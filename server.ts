import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI client (Server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory rate limiting and usage tracking
interface RateLimitRecord {
  count: number;
  lastRequestTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 6; // Max 6 generation requests per minute
const MIN_COOLDOWN_MS = 5000; // Minimum 5s between requests

function checkRateLimit(clientIp: string): { allowed: boolean; message?: string; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record) {
    rateLimitMap.set(clientIp, { count: 1, lastRequestTime: now });
    return { allowed: true };
  }

  // Cooldown check
  const timeSinceLast = now - record.lastRequestTime;
  if (timeSinceLast < MIN_COOLDOWN_MS) {
    const waitSec = Math.ceil((MIN_COOLDOWN_MS - timeSinceLast) / 1000);
    return {
      allowed: false,
      message: `Please wait ${waitSec} second(s) before generating another article draft.`,
      retryAfter: waitSec,
    };
  }

  // Window check
  if (now - record.lastRequestTime > RATE_LIMIT_WINDOW_MS) {
    record.count = 1;
    record.lastRequestTime = now;
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.lastRequestTime)) / 1000);
    return {
      allowed: false,
      message: `Usage limit reached (${MAX_REQUESTS_PER_WINDOW} requests/minute). Please retry in ${remainingTime} seconds to avoid unnecessary quota consumption.`,
      retryAfter: remainingTime,
    };
  }

  record.count += 1;
  record.lastRequestTime = now;
  return { allowed: true };
}

// Cleanup rate-limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.lastRequestTime > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// API Status Route
app.get('/api/gemini/status', (_req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    configured: isConfigured,
    model: 'gemini-3.8-flash',
    searchGroundingSupported: true,
    instructions: !isConfigured
      ? 'GEMINI_API_KEY is not set. Please add GEMINI_API_KEY in the Settings > Secrets panel of Google AI Studio.'
      : undefined,
  });
});

// API Research Assistant Route with Google Search Grounding
app.post('/api/gemini/research', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';

  const rateLimitCheck = checkRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      error: 'RateLimitExceeded',
      message: rateLimitCheck.message,
      retryAfter: rateLimitCheck.retryAfter,
    });
  }

  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    return res.status(503).json({
      error: 'ApiKeyMissing',
      message: 'GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.',
    });
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }

  const { topic } = req.body;
  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({
      error: 'InvalidInput',
      message: 'Please provide a valid research topic with at least 3 characters.',
    });
  }

  try {
    const researchPrompt = `Perform rigorous technical research on the following engineering topic:
Topic: "${topic.trim()}"

Provide:
1. Executive Summary: The current architectural reality, fundamental physics/hardware/software constraints, and industry consensus.
2. 4 Specific Key Findings: Deep architectural insights, verified standard metrics, or algorithmic invariants.
3. Relevant Primary Bodies & Standards: List 3-4 verifiable standards (e.g. IEEE, ACM, IETF, OCP, JEDEC, arXiv) with known papers or specification titles.
4. Proposed Technical Outline: 4 structured sections (01. to 04.) for an in-depth engineering teardown.
5. Research Caveats & Open Engineering Questions.

Rules:
- Ground research strictly in verifiable facts. Never invent citations, authors, or benchmark numbers.
- Differentiate between production-proven capabilities and theoretical roadmap claims.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: researchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const rawChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

    const extractedSources: Array<{
      title: string;
      url: string;
      domain: string;
      isGrounded: boolean;
    }> = [];

    const seenUrls = new Set<string>();

    for (const chunk of rawChunks) {
      if (chunk.web?.uri) {
        const uri = chunk.web.uri;
        if (!seenUrls.has(uri)) {
          seenUrls.add(uri);
          let domain = '';
          try {
            domain = new URL(uri).hostname.replace(/^www\./, '');
          } catch {
            domain = uri;
          }
          extractedSources.push({
            title: chunk.web.title || domain || 'Web Reference',
            url: uri,
            domain: domain,
            isGrounded: true,
          });
        }
      }
    }

    return res.json({
      success: true,
      data: {
        topic: topic.trim(),
        summary: response.text || '',
        sources: extractedSources,
        searchQueries: webSearchQueries,
        groundedWithGoogleSearch: extractedSources.length > 0 || webSearchQueries.length > 0,
        researchedAt: new Date().toISOString(),
        model: 'gemini-3.8-flash',
      },
    });
  } catch (error: any) {
    console.error('Error during research with Gemini API:', error);
    const errorMessage = error?.message || 'Unknown error';
    const status = error?.status || (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429') ? 429 : 500);

    if (status === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'ResourceExhausted',
        message: 'Gemini API rate limit or quota exceeded on current key. Live Google Search grounding is temporarily paused by Google AI Studio quota limits.',
      });
    }

    return res.status(status === 403 ? 403 : 500).json({
      error: 'ResearchFailed',
      message: `Research query failed: ${errorMessage}`,
    });
  }
});

// API Quality and SEO Audit Route
app.post('/api/gemini/quality-check', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';

  const rateLimitCheck = checkRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      error: 'RateLimitExceeded',
      message: rateLimitCheck.message,
      retryAfter: rateLimitCheck.retryAfter,
    });
  }

  const { title, content, excerpt } = req.body;
  if (!title || typeof title !== 'string' || !content || typeof content !== 'string') {
    return res.status(400).json({
      error: 'InvalidInput',
      message: 'Article title and content are required for quality and SEO analysis.',
    });
  }

  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    return res.status(503).json({
      error: 'ApiKeyMissing',
      message: 'GEMINI_API_KEY is not configured on the server. Please add your key in Settings > Secrets.',
    });
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
  }

  try {
    const auditPrompt = `You are the Chief Technical Auditor & SEO Director at TechPilot AI.
Audit the following technical manuscript with uncompromising engineering rigor:

Title: "${title.trim()}"
${excerpt ? `Excerpt: "${excerpt.trim()}"\n` : ''}

Manuscript Body:
"""
${content.trim().slice(0, 25000)}
"""

Evaluate and return structured JSON matching the schema:
1. Technical Quality: Rigor, accuracy of architectural principles, correctness of claims. (Score 0-100)
2. Source Quality: Identify unsupported empirical claims or unverified statistics (e.g. percentages, speeds). Flag any unverified claims. (Score 0-100)
3. Readability & Structure: Evaluate typographic clarity, paragraph flow, and heading hierarchy (H1/H2/H3). Check for duplicate or repetitive paragraphs. (Score 0-100)
4. Math & Code: Inspect LaTeX equations ($$ and $) and code blocks for syntax, typing, and safety.
5. Original Value: Evaluate whether this article offers deep engineering insights or contains generic AI slop.
6. SEO: Provide suggested SEO title (<=60 chars), meta description (140-160 chars), high-intent keywords, and heading analysis. (Score 0-100)
7. Overall composite score (0-100) and written rationales for every score.
8. Problems Needing Attention: Categorize as 'critical', 'warning', or 'suggestion', specifying the category ('Technical' | 'Sources' | 'Code/Math' | 'SEO' | 'Readability' | 'Originality'), problem, and remediation.
9. 3-5 concrete improvement suggestions.`;

    const systemInstruction = `You are a distinguished technical editor and systems researcher. You maintain zero tolerance for fabricated citations, unsupported metrics, or repetitive AI clichés. Score objectively and critique constructively.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: auditPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Composite quality score 0-100' },
            scores: {
              type: Type.OBJECT,
              properties: {
                technicalQuality: { type: Type.INTEGER, description: '0-100 score' },
                sourceQuality: { type: Type.INTEGER, description: '0-100 score' },
                readability: { type: Type.INTEGER, description: '0-100 score' },
                seo: { type: Type.INTEGER, description: '0-100 score' },
              },
              required: ['technicalQuality', 'sourceQuality', 'readability', 'seo'],
            },
            scoreRationales: {
              type: Type.OBJECT,
              properties: {
                technicalQualityRationale: { type: Type.STRING },
                sourceQualityRationale: { type: Type.STRING },
                readabilityRationale: { type: Type.STRING },
                seoRationale: { type: Type.STRING },
              },
              required: ['technicalQualityRationale', 'sourceQualityRationale', 'readabilityRationale', 'seoRationale'],
            },
            technicalAccuracy: {
              type: Type.OBJECT,
              properties: {
                passedChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
                detectedErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['passedChecks', 'detectedErrors'],
            },
            unsupportedClaims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claim: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestedVerification: { type: Type.STRING },
                },
                required: ['claim', 'issue', 'suggestedVerification'],
              },
            },
            mathAndCode: {
              type: Type.OBJECT,
              properties: {
                equationNotes: { type: Type.STRING },
                codeSyntaxValid: { type: Type.BOOLEAN },
                codeIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                codeRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['equationNotes', 'codeSyntaxValid', 'codeIssues', 'codeRecommendations'],
            },
            contentRepetition: {
              type: Type.OBJECT,
              properties: {
                hasRepetition: { type: Type.BOOLEAN },
                details: { type: Type.STRING },
              },
              required: ['hasRepetition', 'details'],
            },
            originalityAndValue: {
              type: Type.OBJECT,
              properties: {
                noveltyAssessment: { type: Type.STRING },
                isAiSlopFree: { type: Type.BOOLEAN },
                boilerplatePhrasesFound: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['noveltyAssessment', 'isAiSlopFree', 'boilerplatePhrasesFound'],
            },
            seo: {
              type: Type.OBJECT,
              properties: {
                suggestedTitle: { type: Type.STRING },
                titleLength: { type: Type.INTEGER },
                suggestedMetaDescription: { type: Type.STRING },
                metaDescriptionLength: { type: Type.INTEGER },
                suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                headingStructureAssessment: { type: Type.STRING },
              },
              required: [
                'suggestedTitle',
                'titleLength',
                'suggestedMetaDescription',
                'metaDescriptionLength',
                'suggestedKeywords',
                'headingStructureAssessment',
              ],
            },
            problemsNeedingAttention: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ['critical', 'warning', 'suggestion'] },
                  category: { type: Type.STRING },
                  problem: { type: Type.STRING },
                  remediation: { type: Type.STRING },
                },
                required: ['severity', 'category', 'problem', 'remediation'],
              },
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'overallScore',
            'scores',
            'scoreRationales',
            'technicalAccuracy',
            'unsupportedClaims',
            'mathAndCode',
            'contentRepetition',
            'originalityAndValue',
            'seo',
            'problemsNeedingAttention',
            'improvementSuggestions',
          ],
        },
      },
    });

    const raw = response.text || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error('Failed to parse quality check JSON:', raw);
      return res.status(502).json({
        error: 'BadGateway',
        message: 'The model response could not be parsed into the required structured audit format.',
      });
    }

    return res.json({
      success: true,
      data: parsed,
      auditedAt: new Date().toISOString(),
      isLiveGemini: true,
    });
  } catch (error: any) {
    console.error('Error during quality check with Gemini API:', error);
    const errorMessage = error?.message || 'Unknown error';
    const status = error?.status || (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429') ? 429 : 500);

    if (status === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'ResourceExhausted',
        message: 'Gemini API rate limit or quota exceeded on current key. Live Gemini audit is temporarily unavailable.',
      });
    }

    return res.status(status === 403 ? 403 : 500).json({
      error: 'QualityCheckFailed',
      message: `Quality audit failed: ${errorMessage}`,
    });
  }
});

// API Article Draft Generation Route
app.post('/api/gemini/generate-article', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'client';

  // 1. Rate Limit & Usage Guard
  const rateLimitCheck = checkRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      error: 'RateLimitExceeded',
      message: rateLimitCheck.message,
      retryAfter: rateLimitCheck.retryAfter,
    });
  }

  // 2. Check API Key
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    return res.status(503).json({
      error: 'ApiKeyMissing',
      message:
        'The GEMINI_API_KEY is not configured on the server. Please open the Settings > Secrets panel in Google AI Studio to set your Gemini API key.',
    });
  }

  // Re-instantiate if needed
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // 3. Validate Inputs
  const { topic, category, tone, audience, includeCode, keyPoints, template } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({
      error: 'InvalidInput',
      message: 'Please provide a descriptive technology topic with at least 3 characters.',
    });
  }

  if (topic.length > 300) {
    return res.status(400).json({
      error: 'InvalidInput',
      message: 'Topic length exceeds 300 characters limit.',
    });
  }

  const cleanCategory = typeof category === 'string' ? category : 'Dev & Cloud Architecture';
  const cleanTone = typeof tone === 'string' ? tone : 'Rigorous & Mathematical';
  const cleanAudience = typeof audience === 'string' ? audience : 'Staff & Principal Engineers';
  const cleanTemplate = typeof template === 'string' ? template : 'teardown';

  // 4. Prompt Assembly
  const userPrompt = `Generate a comprehensive, peer-grade technical article draft for TechPilot AI on the following topic:
Topic: "${topic.trim()}"
Category Domain: ${cleanCategory}
Article Archetype: ${cleanTemplate}
Tone of Voice: ${cleanTone}
Target Audience: ${cleanAudience}
Include Syntactically Valid Code Snippet: ${includeCode ? 'Yes' : 'No'}
Specific Technical Sub-Points or Invariants:
${keyPoints || 'Focus on architectural bottlenecks, mathematical or algorithmic invariants, and production reliability tradeoffs.'}

Requirements:
- Provide an authoritative title, an executive introduction takeaway, structured technical sections with in-depth analysis and tradeoffs, a forward-looking conclusion, indexed keywords, and a list of authoritative places to verify the technical claims.
- Strictly adhere to factual boundaries. Do not fabricate benchmarks, statistics, or paper citations. Mark external sources as 'Suggested for Human Verification'.`;

  const systemInstruction = `You are a principal systems architect and senior technical editor for TechPilot AI, an elite technology and AI engineering publication.

EDITORIAL CODE & FACTUAL INTEGRITY INSTRUCTIONS:
1. Ground all reasoning in sound computer science, hardware architecture, and distributed systems principles.
2. NEVER fabricate citations, never invent authors, never invent DOI links, and never invent benchmark statistics.
3. If mentioning performance or latency metrics, frame them strictly as architectural targets or cite standard benchmarking suites (e.g., MLPerf, SPEC, ASHRAE, IEEE, RFC specifications).
4. Clearly designate reference sources as 'Suggested for Human Verification' with the exact recommended search query so a human editor can inspect them before publication.
5. Code snippets must be syntactically valid and production-grade with type annotations and error guards.
6. Ban generic AI slop: Do NOT use phrases like 'in today's digital landscape', 'testament to', 'beacon of innovation', 'embark on a journey', or 'delve deep'. Write with direct, confident engineering precision.`;

  const generationSchema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'Clear, authoritative technical title',
      },
      excerpt: {
        type: Type.STRING,
        description: 'Concise executive summary (2-3 sentences) detailing the architectural tradeoff',
      },
      introduction: {
        type: Type.STRING,
        description: 'Problem statement, physical/software context, and motivation',
      },
      sections: {
        type: Type.ARRAY,
        description: '2 to 4 detailed technical sections',
        items: {
          type: Type.OBJECT,
          properties: {
            heading: { type: Type.STRING, description: 'Numbered section heading (e.g. 01. Interconnect Latency)' },
            content: { type: Type.STRING, description: 'Markdown formatted deep technical explanation, with code or diagrams if requested' },
          },
          required: ['heading', 'content'],
        },
      },
      conclusion: {
        type: Type.STRING,
        description: 'Synthesis, production deployment checklist, and architectural outlook',
      },
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Suggested indexing keywords and tags',
      },
      suggestedVerificationSources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sourceName: { type: Type.STRING, description: 'Authoritative documentation body or standard (e.g. ACM, IEEE, OCP, W3C, RFC)' },
            searchQuery: { type: Type.STRING, description: 'Exact search query for editor to verify claims' },
            verificationNote: { type: Type.STRING, description: 'What exact specification or claim needs manual verification' },
          },
          required: ['sourceName', 'searchQuery', 'verificationNote'],
        },
        description: 'External documentation avenues for the human editor to verify before publishing.',
      },
    },
    required: [
      'title',
      'excerpt',
      'introduction',
      'sections',
      'conclusion',
      'keywords',
      'suggestedVerificationSources',
    ],
  };

  try {
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let successfulModel = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await aiClient.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: generationSchema,
          },
        });
        successfulModel = modelName;
        break;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isTransient) {
          console.warn(`[Gemini Draft] Model ${modelName} unavailable or high demand. Trying fallback...`);
          continue;
        }
        throw err;
      }
    }

    if (!response || !successfulModel) {
      throw lastError || new Error('All candidate models failed to generate draft.');
    }

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response JSON:', rawText);
      return res.status(502).json({
        error: 'BadGateway',
        message: 'The model response could not be parsed into the required structured format. Please retry.',
      });
    }

    return res.json({
      success: true,
      data: parsedData,
      generatedAt: new Date().toISOString(),
      model: successfulModel,
    });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);

    const errorMessage = error?.message || 'Unknown error during Gemini generation';
    const status = error?.status || 500;

    // Handle standard Gemini status codes
    if (status === 403 || errorMessage.includes('PERMISSION_DENIED')) {
      return res.status(403).json({
        error: 'PermissionDenied',
        message: 'Gemini API permission denied. Please verify your GEMINI_API_KEY in the Settings > Secrets panel.',
      });
    }

    if (status === 400 || errorMessage.includes('API_KEY_INVALID')) {
      return res.status(400).json({
        error: 'InvalidApiKey',
        message: 'Invalid Gemini API key. Please check or re-enter your key in Settings > Secrets.',
      });
    }

    if (status === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error: 'ResourceExhausted',
        message: 'Gemini API rate limit or quota exceeded. Please wait a moment before trying again.',
      });
    }

    return res.status(500).json({
      error: 'GenerationFailed',
      message: `Failed to generate draft: ${errorMessage}`,
    });
  }
});

// Supabase Server Status and Test Endpoints
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://qusbrdwetykqhpmjxpcr.supabase.co';

const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

const isSupabaseServerConfigured = Boolean(
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  supabaseAnonKey !== 'your-supabase-publishable-anon-key-here' &&
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY'
);

app.get('/api/supabase/status', (_req, res) => {
  const maskedKey = isSupabaseServerConfigured
    ? `${supabaseAnonKey.slice(0, 6)}••••••••${supabaseAnonKey.slice(-4)}`
    : 'None configured';

  res.json({
    status: 'ok',
    configured: isSupabaseServerConfigured,
    url: supabaseUrl,
    hasKey: isSupabaseServerConfigured,
    maskedKey,
    instructions: {
      secretName: 'VITE_SUPABASE_ANON_KEY',
      location: 'Settings > Secrets in AI Studio or .env file',
      projectUrl: supabaseUrl,
    },
  });
});

app.post('/api/supabase/test', async (req, res) => {
  if (!isSupabaseServerConfigured) {
    return res.status(400).json({
      success: false,
      message: 'Supabase anon key is not configured in environment variables (VITE_SUPABASE_ANON_KEY).',
      configured: false,
    });
  }

  // Enforce administrator authentication for database write tests under RLS
  const auth = await verifyAdminToken(req);
  if (!auth.authenticated || !auth.token) {
    return res.status(auth.status).json({
      success: false,
      message: `Authentication required: ${auth.error || 'Verified administrator authentication is required to execute database probe tests.'}`,
      configured: true,
    });
  }

  const startTime = Date.now();
  const testId = `srv-probe-${Date.now()}`;
  const testSlug = `srv-verification-${Date.now()}`;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${auth.token}` } },
    });

    // 1. Insert test article
    const { error: insertError } = await supabase.from('articles').insert({
      id: testId,
      title: 'Server Diagnostic Probe',
      slug: testSlug,
      category: 'Dev & Cloud Architecture',
      content: 'Automated roundtrip verification test from TechPilot AI server.',
      excerpt: 'Diagnostic probe verifying Supabase connection.',
      meta_description: 'Diagnostic probe verifying Supabase connection.',
      status: 'draft',
      author_name: 'TechPilot Server Diagnostic',
      tags: ['server-test'],
      is_demo: false,
    });

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: `Supabase insert failed: ${insertError.message}. Make sure table 'articles' exists and RLS policies are applied.`,
        error: insertError,
      });
    }

    // 2. Query back
    const { data: retrieved, error: selectError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', testId)
      .single();

    if (selectError || !retrieved) {
      return res.status(500).json({
        success: false,
        message: `Supabase retrieve failed: ${selectError?.message || 'Could not fetch inserted probe.'}`,
      });
    }

    // 3. Clean up probe
    await supabase.from('articles').delete().eq('id', testId);

    const latency = Date.now() - startTime;
    return res.json({
      success: true,
      message: `Supabase save, retrieve, and delete test passed in ${latency}ms! Row insertion, retrieval, and clean-up verified successfully under RLS.`,
      latencyMs: latency,
      retrievedSlug: retrieved.slug,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Exception during Supabase test: ${err?.message || 'Unknown network error.'}`,
    });
  }
});

// Supabase Authentication Helper to verify admin JWT Bearer token
interface AuthVerification {
  authenticated: boolean;
  user?: any;
  token?: string;
  error?: string;
  status: number;
}

async function verifyAdminToken(req: express.Request): Promise<AuthVerification> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Unauthorized: Missing or invalid Authorization Bearer header. Please log in as an administrator.',
      status: 401,
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      authenticated: false,
      error: 'Unauthorized: Bearer token is empty.',
      status: 401,
    };
  }

  if (!isSupabaseServerConfigured) {
    return {
      authenticated: false,
      error: 'Server configuration error: Supabase anon key is missing or not configured.',
      status: 500,
    };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    // Using Supabase client with user's JWT Bearer token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return {
        authenticated: false,
        error: `Authentication failed: ${error?.message || 'Invalid or expired session token.'}`,
        status: 401,
      };
    }

    const user = data.user;
    const isAuthorizedAdmin = user.id === '6212d070-05b0-46d1-a98a-3c77087626d3';

    if (!isAuthorizedAdmin) {
      return {
        authenticated: false,
        error: 'Forbidden: User is not authorized to perform administrative actions.',
        status: 403,
      };
    }

    return {
      authenticated: true,
      user,
      token,
      status: 200,
    };
  } catch (err: any) {
    return {
      authenticated: false,
      error: `Internal error validating authentication token: ${err.message}`,
      status: 500,
    };
  }
}

// Admin Token Verification Endpoint
app.get('/api/auth/verify', async (req, res) => {
  const auth = await verifyAdminToken(req);
  if (!auth.authenticated) {
    return res.status(auth.status).json({ success: false, error: auth.error });
  }
  return res.json({
    success: true,
    user: {
      id: auth.user.id,
      email: auth.user.email,
      role: auth.user.app_metadata?.role || (auth.user.id === '6212d070-05b0-46d1-a98a-3c77087626d3' ? 'System Administrator' : 'Administrator'),
      lastSignIn: auth.user.last_sign_in_at,
    },
  });
});

// Articles CRUD Endpoints via Supabase
// Public reads published articles only; Authenticated admin reads all (drafts, pending, approved)
app.get('/api/articles', async (req, res) => {
  if (!isSupabaseServerConfigured) {
    return res.json({ success: false, data: null, message: 'Supabase is not configured' });
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    // Check if requester has a valid admin token
    const auth = await verifyAdminToken(req);

    if (auth.authenticated && auth.token) {
      // Authenticated administrator: return ALL articles with authenticated client
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${auth.token}` } },
      });
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(error.code === 'PGRST205' ? 404 : 400).json({
          success: false,
          error: error.message,
          tableMissing: error.code === 'PGRST205',
        });
      }
      return res.json({ success: true, data, scope: 'admin_all' });
    } else {
      // Public anonymous visitor: strictly return only published articles
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(error.code === 'PGRST205' ? 404 : 400).json({
          success: false,
          error: error.message,
          tableMissing: error.code === 'PGRST205',
        });
      }
      return res.json({ success: true, data, scope: 'public_published_only' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error querying Supabase' });
  }
});

app.post('/api/articles', async (req, res) => {
  if (!isSupabaseServerConfigured) {
    return res.status(400).json({ success: false, message: 'Supabase is not configured' });
  }

  // Enforce Administrator Authentication
  const auth = await verifyAdminToken(req);
  if (!auth.authenticated || !auth.token) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error || 'Unauthorized: Administrator authentication required to create or save manuscripts.',
    });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${auth.token}` } },
    });
    const article = req.body;

    const row = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      content: article.content,
      excerpt: article.excerpt || '',
      meta_description: article.meta_description || article.seo?.metaDescription || article.excerpt || '',
      status: article.status || 'draft',
      author_name: article.author?.name || article.author_name || 'TechPilot Editorial Staff',
      author_role: article.author?.role || article.author_role || 'Staff Contributor',
      author_avatar: article.author?.avatar || article.author_avatar || '',
      read_time: article.readTime || article.read_time || '5 min read',
      featured_image: article.featuredImage || article.featured_image || '',
      review_notes: article.reviewNotes || article.review_notes || '',
      seo: article.seo || {},
      citations: article.citations || [],
      quality_report: article.qualityReport || article.quality_report || null,
      metrics: article.metrics || { views: 0, likes: 0, shares: 0 },
      tags: article.tags || [],
      is_demo: Boolean(article.isDemo ?? article.is_demo),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('articles')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error saving article' });
  }
});

app.patch('/api/articles/:id', async (req, res) => {
  if (!isSupabaseServerConfigured) {
    return res.status(400).json({ success: false, message: 'Supabase is not configured' });
  }

  // Enforce Administrator Authentication
  const auth = await verifyAdminToken(req);
  if (!auth.authenticated || !auth.token) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error || 'Unauthorized: Administrator authentication required to update manuscripts.',
    });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${auth.token}` } },
    });
    const { id } = req.params;
    const updates = req.body;

    const rowUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.slug !== undefined) rowUpdates.slug = updates.slug;
    if (updates.category !== undefined) rowUpdates.category = updates.category;
    if (updates.content !== undefined) rowUpdates.content = updates.content;
    if (updates.excerpt !== undefined) rowUpdates.excerpt = updates.excerpt;
    if (updates.meta_description !== undefined) rowUpdates.meta_description = updates.meta_description;
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.reviewNotes !== undefined || updates.review_notes !== undefined) {
      rowUpdates.review_notes = updates.reviewNotes ?? updates.review_notes;
    }
    if (updates.seo !== undefined) {
      rowUpdates.seo = updates.seo;
      rowUpdates.meta_description = updates.seo.metaDescription || updates.excerpt || '';
    }

    const { data, error } = await supabase
      .from('articles')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error updating article' });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  if (!isSupabaseServerConfigured) {
    return res.status(400).json({ success: false, message: 'Supabase is not configured' });
  }

  // Enforce Administrator Authentication
  const auth = await verifyAdminToken(req);
  if (!auth.authenticated || !auth.token) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error || 'Unauthorized: Administrator authentication required to delete manuscripts.',
    });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${auth.token}` } },
    });
    const { id } = req.params;

    const { error } = await supabase.from('articles').delete().eq('id', id);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error deleting article' });
  }
});

// Explicit API 404 Handler: NEVER allow unmatched /api/* calls to fall into Vite SPA HTML fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `API endpoint ${req.method} ${req.path} not found.`,
  });
});

// Global API Error Handler: Ensure any thrown error inside /api returns JSON
app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An internal server error occurred.',
  });
});

// Vite Integration: Dev vs Prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[TechPilot AI Server] Running on http://0.0.0.0:${port} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[TechPilot AI Server] Startup error:', err);
  process.exit(1);
});
