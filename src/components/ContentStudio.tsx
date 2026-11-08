import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Sliders, 
  RotateCcw, 
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  Code2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Search,
  Eye,
  Edit3,
  Database
} from 'lucide-react';
import { Article, ArticleCategory } from '../types';
import { isSupabaseConfigured, saveArticleToSupabase, getSupabaseConfig } from '../lib/supabase';
import { safeFetchJson } from '../utils/apiClient';

interface VerificationSource {
  sourceName: string;
  searchQuery: string;
  verificationNote: string;
}

interface ContentStudioProps {
  onArticleCreated: (newArticle: Article) => Promise<boolean> | void;
  initialTopic?: string;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  onArticleCreated,
  initialTopic = '',
}) => {
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [template, setTemplate] = useState<'teardown' | 'benchmark' | 'executive' | 'guide'>('teardown');
  const [topic, setTopic] = useState(
    initialTopic || 'Memory Hierarchy Bottlenecks in Large-Scale Mixture-of-Experts Serving'
  );
  const [category, setCategory] = useState<ArticleCategory>('Dev & Cloud Architecture');
  const [tone, setTone] = useState('Rigorous & Mathematical');
  const [audience, setAudience] = useState('Staff & Principal Engineers');
  const [includeCode, setIncludeCode] = useState(true);
  const [keyPoints, setKeyPoints] = useState(
    '1. All-to-all communication latency in distributed MoE.\n2. Expert routing load imbalance mitigation.\n3. Dynamic KV-cache allocation with PagedAttention.'
  );

  // Gemini API & Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLiveGemini, setIsLiveGemini] = useState(false);
  const [editorMode, setEditorMode] = useState<'preview' | 'edit'>('preview');

  // Generated Manuscript Fields
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedExcerpt, setGeneratedExcerpt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [verificationSources, setVerificationSources] = useState<VerificationSource[]>([]);
  const [tokenCount, setTokenCount] = useState(0);

  // Status flags
  const [copied, setCopied] = useState(false);
  const [submittedToReview, setSubmittedToReview] = useState(false);
  const [savedAsDraft, setSavedAsDraft] = useState(false);

  // Check Gemini API Configuration on Mount
  useEffect(() => {
    safeFetchJson<{ configured: boolean }>('/api/gemini/status')
      .then((res) => {
        if (res.ok && res.data) {
          setGeminiConfigured(Boolean(res.data.configured));
        } else {
          setGeminiConfigured(false);
        }
      })
      .catch((err) => {
        console.warn('Could not check Gemini API status:', err);
        setGeminiConfigured(false);
      });
  }, []);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  // Main Generation Handler using Server-Side Gemini API
  const handleStartGeneration = async () => {
    if (!topic.trim()) {
      setApiError('Please enter a technology topic before generating.');
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    setSubmittedToReview(false);
    setSavedAsDraft(false);

    try {
      const response = await safeFetchJson<{
        success: boolean;
        message?: string;
        data?: any;
        model?: string;
      }>('/api/gemini/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          tone,
          audience,
          includeCode,
          keyPoints,
          template,
        }),
      });

      if (!response.ok || !response.data?.success || !response.data?.data) {
        throw new Error(
          response.error ||
          response.data?.message ||
          'Generation failed. Upstream model returned an error or unavailable response.'
        );
      }

      const data = response.data.data;

      // Construct formatted Markdown draft
      const sectionsMarkdown = (data.sections || [])
        .map((s: { heading: string; content: string }) => `### ${s.heading}\n\n${s.content}`)
        .join('\n\n---\n\n');

      const verificationMarkdown = (data.suggestedVerificationSources || [])
        .map(
          (src: VerificationSource) =>
            `- **${src.sourceName}**: \`${src.searchQuery}\` — *${src.verificationNote}*`
        )
        .join('\n');

      const fullDraftMarkdown = `### 01. Context & Architectural Motivation
${data.introduction}

---

${sectionsMarkdown}

---

### Conclusion & Production Considerations
${data.conclusion}

---

### Sources Suggested for Human Verification
> **Strict Editorial Integrity Rule:** The following sources, benchmark bodies, and search queries are suggested avenues for primary verification. Before publication on TechPilot AI, the Editor-in-Chief must verify technical claims against official specifications.

${verificationMarkdown}`;

      setGeneratedTitle(data.title || topic);
      setGeneratedExcerpt(data.excerpt || '');
      setGeneratedContent(fullDraftMarkdown);
      setSuggestedKeywords(data.keywords || [category, 'Architecture', 'AI Engineering']);
      setVerificationSources(data.suggestedVerificationSources || []);
      setTokenCount(Math.round(fullDraftMarkdown.length / 4));
      setIsLiveGemini(true);
      setGeminiConfigured(true);
    } catch (err: any) {
      console.error('Failed to generate with Gemini API:', err);
      setApiError(err.message || 'An unexpected error occurred while communicating with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback Generation if User is Offline or Key Not Set
  const handleGenerateFallback = () => {
    setIsGenerating(true);
    setApiError(null);
    setSubmittedToReview(false);
    setSavedAsDraft(false);

    const titleResult = topic.length > 5 ? topic : 'Distributed Inference Topology Optimization';
    setGeneratedTitle(titleResult);
    setGeneratedExcerpt(
      `An architectural exploration of ${topic.toLowerCase()}, detailing latency profiles, arithmetic intensity, and interconnect tradeoffs.`
    );

    const sampleSources: VerificationSource[] = [
      {
        sourceName: 'ACM Digital Library',
        searchQuery: `${topic} architecture latency benchmark`,
        verificationNote: 'Verify primary interconnect latency and communication overhead claims.',
      },
      {
        sourceName: 'IEEE Computer Society',
        searchQuery: `${topic} memory hierarchy hardware limits`,
        verificationNote: 'Verify arithmetic intensity invariants against PCIe Gen 5/6 bandwidth.',
      },
    ];
    setVerificationSources(sampleSources);
    setSuggestedKeywords([category, 'Systems', 'Inference', 'Demonstration']);

    const sampleText = `### 01. Context & Architectural Motivation
Scaling modern frontier systems introduces severe physical barriers at the interconnect and memory layers. When deploying ${topic}, traditional single-node assumptions disintegrate.

We analyze the underlying latency distribution across three distinct layers:
1. **Host-to-Device Transfer**: Bandwidth limits over PCIe Gen 5/6.
2. **Cluster Sharding Topology**: Cross-rack collective communication overhead.
3. **Cache Invariant Maintenance**: Dynamic memory allocation under non-uniform workloads.

---

### 02. Mathematical & Algorithmic Formulation
To formalize the memory bandwidth constraint, we evaluate the arithmetic intensity ratio:

$$I = \\frac{\\text{Total Floating Point Operations (FLOPs)}}{\\text{Total Memory Bytes Transferred}}$$

When $I < 100$, execution remains memory-bound. Optimizing ${topic} requires shifting from bandwidth-limited operations to compute-bound fused kernels.

${includeCode ? `\`\`\`python
import torch
import torch.nn as nn

class OptimizedKernelRouting(nn.Module):
    """
    High-performance routing layer with fused kernel dispatch.
    Avoids host-device synchronization latency.
    """
    def __init__(self, d_model: int, num_experts: int, top_k: int = 2):
        super().__init__()
        self.d_model = d_model
        self.num_experts = num_experts
        self.top_k = top_k
        self.gate = nn.Linear(d_model, num_experts, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        logits = self.gate(x)
        weights, indices = torch.topk(torch.softmax(logits, dim=-1), self.top_k)
        assert not torch.isnan(weights).any(), "Gating weights encountered numerical instability"
        return weights, indices
\`\`\`` : ''}

---

### 03. Production Deployment Checklist
- [x] Verified zero data race in collective all-reduce calls
- [x] Configured fallback timeout for worker threads
- [x] Integrated telemetry alerts for memory fragmentation > 8%

---

### Sources Suggested for Human Verification
> **Strict Editorial Integrity Rule:** The following sources and queries are suggested reference paths for human fact-checking. A human editor must verify all claims before live publication.

- **ACM Digital Library**: \`${topic} architecture latency benchmark\` — *Verify primary interconnect latency and communication overhead claims.*
- **IEEE Computer Society**: \`${topic} memory hierarchy hardware limits\` — *Verify arithmetic intensity invariants against PCIe Gen 5/6 bandwidth.*`;

    setGeneratedContent(sampleText);
    setTokenCount(Math.round(sampleText.length / 4));
    setIsLiveGemini(false);
    setIsGenerating(false);
  };

  // Human Review & Draft Creation
  const handleSaveAsDraft = async () => {
    setIsSavingDb(true);
    setSaveStatusMsg(null);

    const newArt: Article = {
      id: `draft-${Date.now()}`,
      title: generatedTitle || topic,
      slug: (generatedTitle || topic)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      category: category,
      excerpt: generatedExcerpt || 'Draft technical manuscript created in Content Studio.',
      content: generatedContent,
      author: {
        name: isLiveGemini ? 'TechPilot AI & Gemini 3.8 Flash' : 'TechPilot Content Studio',
        role: 'Draft Manuscript',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      publishedAt: 'Draft (Saved)',
      readTime: `${Math.max(1, Math.ceil(generatedContent.split(/\s+/).length / 220))} min read`,
      featuredImage: '/src/assets/images/blog_neural_agents_1793517435046.jpg',
      status: 'draft',
      isDemo: false,
      reviewNotes: `Saved directly as draft. Engine: ${isLiveGemini ? 'Google Gemini 3.8 Flash' : 'Template Engine'}. Archetype: ${template}. Tone: ${tone}. Target: ${audience}.`,
      seo: {
        title: `${generatedTitle || topic} | TechPilot AI`,
        metaDescription: generatedExcerpt,
        keywords: suggestedKeywords.length > 0 ? suggestedKeywords : [category, 'Draft', 'Engineering'],
      },
      citations: verificationSources.map((s) => ({
        source: s.sourceName,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(s.searchQuery)}`,
        note: `[Suggested for Human Verification] ${s.verificationNote}`,
      })),
      metrics: {
        views: 0,
        likes: 0,
        shares: 0,
      },
      tags: suggestedKeywords.length > 0 ? suggestedKeywords : ['Draft', category, 'Content Studio'],
    };

    const res = await onArticleCreated(newArt);
    setIsSavingDb(false);
    if (res !== false) {
      setSavedAsDraft(true);
      setSubmittedToReview(false);
      setSaveStatusMsg({ type: 'success', text: 'Manuscript draft saved to Supabase.' });
    } else {
      setSaveStatusMsg({ type: 'error', text: 'Failed to save draft to Supabase. Check administrator privileges.' });
    }
  };

  const handleSubmitForReview = async () => {
    setIsSavingDb(true);
    setSaveStatusMsg(null);

    const newArt: Article = {
      id: `gen-${Date.now()}`,
      title: generatedTitle || topic,
      slug: (generatedTitle || topic)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      category: category,
      excerpt: generatedExcerpt || 'Generated draft submitted for Editor-in-Chief review.',
      content: generatedContent,
      author: {
        name: isLiveGemini ? 'TechPilot AI & Gemini 3.8 Flash' : 'TechPilot Content Studio',
        role: 'AI Technical Writing Assistant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      publishedAt: 'Pending Approval',
      readTime: `${Math.max(1, Math.ceil(generatedContent.split(/\s+/).length / 220))} min read`,
      featuredImage: '/src/assets/images/blog_neural_agents_1793517435046.jpg',
      status: 'pending_review',
      isDemo: false,
      reviewNotes: `Generated via ${isLiveGemini ? 'Google Gemini API (gemini-3.8-flash)' : 'Content Studio'} with ${tone} tone for ${audience}. Requires manual fact-checking of suggested verification sources before publishing.`,
      seo: {
        title: `${generatedTitle || topic} | TechPilot AI`,
        metaDescription: generatedExcerpt,
        keywords: suggestedKeywords.length > 0 ? suggestedKeywords : [category, 'Architecture', 'AI Engineering'],
      },
      citations: verificationSources.map((s) => ({
        source: s.sourceName,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(s.searchQuery)}`,
        note: `[Suggested for Human Verification] ${s.verificationNote}`,
      })),
      metrics: {
        views: 0,
        likes: 0,
        shares: 0,
      },
      tags: suggestedKeywords.length > 0 ? suggestedKeywords : ['AI Studio', category, 'Architecture'],
    };

    const res = await onArticleCreated(newArt);
    setIsSavingDb(false);
    if (res !== false) {
      setSubmittedToReview(true);
      setSavedAsDraft(false);
      setSaveStatusMsg({ type: 'success', text: 'Manuscript submitted for review in Supabase.' });
    } else {
      setSaveStatusMsg({ type: 'error', text: 'Failed to submit manuscript to Supabase.' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supabaseConfig = getSupabaseConfig();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Studio Header with Gemini API & Supabase Status Indicators */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>AI Content Generation Engine</span>
            <span aria-hidden="true">·</span>
            <span>Server-Side Google Gemini API</span>
            <span aria-hidden="true">·</span>
            <span>Supabase PostgreSQL Storage</span>
            <span aria-hidden="true">·</span>
            <span>Zero Auto-Publish Safeguard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            AI Technical Content Studio
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
            Input any technical domain topic to generate structured, original draft manuscripts powered by Google Gemini. Every draft is created with explicit verification sources, saved as a draft into your Supabase database, and requires your manual editorial approval before publication.
          </p>
        </div>

        {/* Integration Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Gemini Badge */}
          <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${geminiConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {geminiConfigured ? 'Gemini 3.8 Flash' : 'Gemini Key Pending'}
            </span>
          </div>

          {/* Supabase Badge */}
          <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {supabaseConfig.hasKey ? 'Supabase Connected' : 'Supabase (Offline Cache)'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generation Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          {/* Archetype Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Template Archetype
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('teardown')}
                className={`p-2.5 text-xs font-medium rounded-lg border text-left transition-colors ${
                  template === 'teardown'
                    ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold block">Architecture Teardown</span>
                <span className="text-[11px] opacity-75">Hardware & systems depth</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('benchmark')}
                className={`p-2.5 text-xs font-medium rounded-lg border text-left transition-colors ${
                  template === 'benchmark'
                    ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold block">Empirical Benchmark</span>
                <span className="text-[11px] opacity-75">Metrics & telemetry stats</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('guide')}
                className={`p-2.5 text-xs font-medium rounded-lg border text-left transition-colors ${
                  template === 'guide'
                    ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold block">Developer Guide</span>
                <span className="text-[11px] opacity-75">Code & implementation</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate('executive')}
                className={`p-2.5 text-xs font-medium rounded-lg border text-left transition-colors ${
                  template === 'executive'
                    ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold block">Executive Strategy</span>
                <span className="text-[11px] opacity-75">Tradeoffs & ROI impact</span>
              </button>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Article Subject / Technical Thesis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Memory Hierarchy Bottlenecks in Large-Scale Mixture-of-Experts Serving"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Category & Persona */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Category Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="Dev & Cloud Architecture">Dev & Cloud Architecture</option>
                <option value="Generative AI">Generative AI</option>
                <option value="Quantum & Silicon">Quantum & Silicon</option>
                <option value="Robotics & Hardware">Robotics & Hardware</option>
                <option value="AI Safety & Governance">AI Safety & Governance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Audience Persona
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option>Staff & Principal Engineers</option>
                <option>Founders & CTOs</option>
                <option>Full-Stack Developers</option>
                <option>ML Research Scientists</option>
              </select>
            </div>
          </div>

          {/* Tone & Code Option */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              >
                <option>Rigorous & Mathematical</option>
                <option>Journalistic & Concise</option>
                <option>Pragmatic Engineering</option>
                <option>Opinionated Founder</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Include Code Snippets
                </span>
              </label>
            </div>
          </div>

          {/* Key Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Required Technical Arguments & Invariants
            </label>
            <textarea
              rows={3}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="e.g. 1. All-to-all communication latency. 2. Expert routing load imbalance."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          {/* Error Banner */}
          {apiError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Notice:</span>
                  <span>{apiError}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  You can also test with the local draft engine:
                </span>
                <button
                  type="button"
                  onClick={handleGenerateFallback}
                  className="px-2 py-1 text-[11px] font-medium bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded hover:bg-amber-300 transition-colors"
                >
                  Generate Sample Draft
                </button>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${
              isGenerating
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                <span>Generating Draft via Google Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Article Draft (Gemini API)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Editor / Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col min-h-[580px] shadow-xs">
          {/* Top Actions & Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setEditorMode('preview')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    editorMode === 'preview'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setEditorMode('edit')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    editorMode === 'edit'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                  <span>Edit Draft</span>
                </button>
              </div>

              {tokenCount > 0 && (
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded">
                  ~{tokenCount} tokens
                </span>
              )}

              {isLiveGemini && (
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Gemini 3.8 Flash Draft
                </span>
              )}
            </div>

            {generatedContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSaveAsDraft}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Save this draft without submitting to pending approvals"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Save as Draft</span>
                </button>

                <button
                  onClick={handleSubmitForReview}
                  disabled={submittedToReview}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    submittedToReview
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900'
                  }`}
                  title="Queue for human editorial verification"
                >
                  {submittedToReview ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Queued in Approvals</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Submission / Saved Banners */}
          {submittedToReview && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Manuscript submitted to the <strong>Editorial Approval Board</strong>. A human editor must inspect citations and approve before publication.</span>
              </div>
            </div>
          )}

          {savedAsDraft && (
            <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl flex items-center justify-between text-xs text-cyan-900 dark:text-cyan-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Draft successfully saved! You can find it anytime under <strong>Editorial Approvals &gt; Drafts</strong> to revise or submit.</span>
              </div>
            </div>
          )}

          {/* Verification Notice Banner */}
          {generatedContent && verificationSources.length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Sources Suggested for Human Fact-Checking ({verificationSources.length})</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                TechPilot AI integrity standard: citations are suggestions for verification, not pre-verified peer review. Review all claims in primary documentation before authorizing live publication.
              </p>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[540px]">
            {generatedContent ? (
              editorMode === 'preview' ? (
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 mb-1">
                      <span>{category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tone}</span>
                      <span aria-hidden="true">·</span>
                      <span>Target: {audience}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                      {generatedTitle}
                    </h2>
                    {generatedExcerpt && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic">
                        {generatedExcerpt}
                      </p>
                    )}
                  </div>

                  <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                    {generatedContent}
                  </div>

                  {suggestedKeywords.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Keywords:</span>
                      {suggestedKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Draft Working Title
                    </label>
                    <input
                      type="text"
                      value={generatedTitle}
                      onChange={(e) => setGeneratedTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Executive Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={generatedExcerpt}
                      onChange={(e) => setGeneratedExcerpt(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Markdown Body & Verification Notes
                    </label>
                    <textarea
                      rows={16}
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden resize-none"
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                <FileText className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No manuscript draft generated yet
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Enter your technology subject on the left and click "Generate Article Draft (Gemini API)" to create an original draft.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
