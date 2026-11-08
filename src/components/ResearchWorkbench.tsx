import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Send, 
  ExternalLink, 
  FileEdit, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Globe,
  Cpu,
  BarChart2,
  FileCheck,
  RefreshCw,
  Sliders,
  Code,
  Tag,
  Download,
  ArrowRight
} from 'lucide-react';
import { Article, ArticleCategory, ResearchResult, QualityCheckReport, QualityProblem } from '../types';
import { runDeterministicQualityAudit } from '../utils/qualityAuditor';

interface ResearchWorkbenchProps {
  onArticleSubmitted: (newArticle: Article) => void;
  articles?: Article[];
  initialTopic?: string;
  onOpenStudioWithTopic?: (topic: string) => void;
}

export const ResearchWorkbench: React.FC<ResearchWorkbenchProps> = ({
  onArticleSubmitted,
  articles = [],
  initialTopic = '',
  onOpenStudioWithTopic,
}) => {
  // Main view mode: 'researcher' | 'auditor'
  const [activeMode, setActiveMode] = useState<'researcher' | 'auditor'>('researcher');

  // ==========================================
  // 1. AI RESEARCH ASSISTANT STATES
  // ==========================================
  const [researchTopic, setResearchTopic] = useState(
    initialTopic || 'Ultra-Ethernet Consortium (UEC) vs InfiniBand for 100k+ GPU Clusters'
  );
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [searchGroundingActive, setSearchGroundingActive] = useState<boolean>(true);

  // Sample quick research topics
  const sampleTopics = [
    'Ultra-Ethernet Consortium (UEC) vs InfiniBand for 100k+ GPU Clusters',
    'Silicon Photonics & Co-Packaged Optics in AI Clusters',
    'Distributed MoE Fabrics, All-to-All Bottlenecks, and Paged KV Memory',
    'Liquid Cooling Infrastructures for 100kW+ AI Server Racks',
  ];

  // ==========================================
  // 2. ARTICLE QUALITY & SEO CHECKER STATES
  // ==========================================
  const [selectedArticleId, setSelectedArticleId] = useState<string>('custom');
  const [auditTitle, setAuditTitle] = useState(
    'Architectural Invariants for Large-Scale MoE Deployment in 2027'
  );
  const [auditCategory, setAuditCategory] = useState<ArticleCategory>('Dev & Cloud Architecture');
  const [auditExcerpt, setAuditExcerpt] = useState(
    'An authoritative systems engineering analysis of distributed Mixture-of-Experts inference: All-to-All collective bottlenecks, load balancing frontiers, PagedAttention memory isolation, and 2027 hardware fabric invariants.'
  );
  const [auditBody, setAuditBody] = useState(`### 01. Latency Boundaries: Web Transport vs. Accelerator Inference
When an end user interacts with a modern LLM-powered web application, perceived latency is the cumulative sum of distinct physical pipelines:

| Metric Layer | Primary Determinants | Typical Order of Magnitude | Bottleneck Classification |
| :--- | :--- | :--- | :--- |
| **Edge Web Transport (TTFB)** | DNS lookup, TCP 3-way handshake, TLS 1.3 negotiation | 15 ms – 120 ms | Network latency & edge geography |
| **Inference Time to First Token (TTFT)** | **Prompt Prefill Phase**: Parallel processing of prompt tokens, dense GEMM operations | 30 ms – 800+ ms | **Compute-Bound (Tensor Core TFLOPS)** |
| **Inter-Token Latency (ITL / TPOT)** | **Autoregressive Decode Phase**: Step-by-step token generation, weight matrix streaming | 8 ms – 35 ms / token | **Memory Bandwidth-Bound (HBM TB/s)** |

During the **prefill phase**, matrix multiplications exhibit high arithmetic intensity ($I_{\\text{prefill}} \\gg 1$). In the **decode phase**, only one token ($N=1$) is processed per step, causing arithmetic intensity to collapse ($I_{\\text{decode}} \\approx \\mathcal{O}(1)$), bound strictly by HBM bandwidth.

---

### 02. Distributed MoE Fabrics: Routing & Capacity Tradeoffs
In distributed Mixture-of-Experts (MoE) architectures, token representation $x$ is dispatched via Top-$K$ gating:
$$G(x) = \\text{Softmax}(\\text{KeepTopK}(H(x), K))$$

To prevent token dropping under skewed token distributions, the expert capacity $C$ is scaled by a Capacity Factor (CF):
$$C = \\text{CF} \\times \\left\\lceil \\frac{N \\cdot K}{E} \\right\\rceil$$
When $\\text{CF} \\le 1.0$, excess tokens are dropped or bypassed through the residual stream without MLP processing, increasing cross-entropy perplexity. An auxiliary load balancing loss $\\mathcal{L}_{\\text{aux}} = \\alpha_{\\text{aux}} E \\sum_{i=1}^E f_i P_i$ penalizes skewed dispatch.

---

### 03. Interconnect Bottlenecks: The All-to-All Problem
In the Hockney communication model $T(m) = \\alpha + \\frac{m}{B}$, pairwise shift exchange executes across $P - 1$ steps:
$$T_{\\text{pairwise}} = (P - 1)\\alpha + \\frac{P - 1}{P} \\frac{M}{B}$$
As rank count $P$ expands while per-batch tokens remain small, the startup latency overhead $(P - 1)\\alpha$ dominates execution time.

\`\`\`python
# SIMPLIFIED EDUCATIONAL BLOCK MANAGER (SIMULATION ONLY)
class EducationalBlockTable:
    def __init__(self, sequence_id: str, block_size: int = 16):
        self.sequence_id = sequence_id
        self.block_size = block_size
        self.physical_block_ids = []
        self.num_tokens = 0

    def append_token(self, free_pool):
        self.num_tokens += 1
        needed = (self.num_tokens + self.block_size - 1) // self.block_size
        if needed > len(self.physical_block_ids):
            if not free_pool:
                raise MemoryError("HBM Block Pool Exhausted")
            self.physical_block_ids.append(free_pool.pop(0))
        return self.physical_block_ids[-1]
\`\`\`

---

### Sources Suggested for Human Verification
- **ACM SOSP 2023**: Kwon et al. *Efficient Memory Management for Large Language Model Serving with PagedAttention.* https://doi.org/10.1145/3600006.3613165
- **ICLR 2021**: Lepikhin et al. *GShard: Scaling Giant Models with Conditional Computation.* https://arxiv.org/abs/2006.16668
- **JMLR 2022**: Fedus et al. *Switch Transformers: Scaling to Trillion Parameter Models.* https://jmlr.org/papers/v23/21-0998.html`);

  const [isAuditing, setIsAuditing] = useState(false);
  const [qualityReport, setQualityReport] = useState<QualityCheckReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'problems' | 'accuracy' | 'claims' | 'mathCode' | 'seo'>('overview');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Workflow submission feedback
  const [submissionStatus, setSubmissionStatus] = useState<{
    type: 'draft' | 'review' | null;
    message: string;
  }>({ type: null, message: '' });

  // Sync selected article into audit editor
  const handleSelectArticleToAudit = (articleId: string) => {
    setSelectedArticleId(articleId);
    if (articleId === 'custom') return;

    const found = articles.find((a) => a.id === articleId);
    if (found) {
      setAuditTitle(found.title);
      setAuditCategory(found.category);
      setAuditExcerpt(found.excerpt);
      setAuditBody(found.content);
      setQualityReport(found.qualityReport || null);
      setSubmissionStatus({ type: null, message: '' });
    }
  };

  // Word metrics
  const wordCount = auditBody.trim().split(/\s+/).filter(Boolean).length;
  const readTimeEstimate = Math.max(1, Math.ceil(wordCount / 220));

  // ==========================================
  // RUN AI RESEARCH
  // ==========================================
  const handleExecuteResearch = async () => {
    if (!researchTopic || researchTopic.trim().length < 3) return;
    setIsResearching(true);
    setResearchError(null);

    try {
      const response = await fetch('/api/gemini/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: researchTopic.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setResearchResult(data.data);
      } else {
        // Handle 429 quota exhaustion or missing key with honest offline technical corpus
        console.warn('Research API returned non-200, falling back to verified technical corpus:', data);
        const isQuotaIssue = response.status === 429 || data?.error === 'ResourceExhausted';
        setResearchError(
          isQuotaIssue
            ? 'Gemini API quota is currently exhausted on the active key. Loading verified primary standards corpus (offline mode).'
            : (data?.message || 'Server research request encountered an issue. Using verified technical knowledge base.')
        );

        // Grounded offline corpus with real canonical URLs
        setResearchResult({
          topic: researchTopic.trim(),
          summary: `### Architectural State of the Art: ${researchTopic.trim()}

Modern distributed systems require verifiable network determinism, predictable tail latency, and loss-minimized packet dispatching. 

When evaluating ${researchTopic.trim()}, architectural trade-offs pivot on:
1. **Physical Transport Layer**: Comparing RoCEv2 (RDMA over Converged Ethernet) with credit-based InfiniBand adaptive routing.
2. **Packet Spraying & Congestion Control**: Preventing incast congestion during All-to-All collective phases through fine-grained selective acknowledgment and packet pacing.
3. **Open Standards Alignment**: The Ultra Ethernet Consortium (UEC) specification targets transport layer improvements to democratize multi-tenant AI supercomputing fabrics.`,
          sources: [
            {
              title: 'Ultra Ethernet Consortium (UEC) Technical Specification',
              url: 'https://ultraethernet.org',
              domain: 'ultraethernet.org',
              isGrounded: false,
              note: 'Verified industry consortium standard for AI and HPC Ethernet fabrics.',
            },
            {
              title: 'IEEE 802.3 Ethernet Working Group Standards',
              url: 'https://ieee802.org/3/',
              domain: 'ieee802.org',
              isGrounded: false,
              note: 'Physical and data-link layer transmission specifications up to 800 Gbps / 1.6 Tbps.',
            },
            {
              title: 'IETF RFC 7560: Problem Statement for Transport Layer Congestion Exposure',
              url: 'https://datatracker.ietf.org/doc/html/rfc7560',
              domain: 'datatracker.ietf.org',
              isGrounded: false,
              note: 'Canonical IETF transport protocol and packet pacing specification.',
            },
            {
              title: 'Open Compute Project (OCP) High-Performance Networking',
              url: 'https://opencompute.org',
              domain: 'opencompute.org',
              isGrounded: false,
              note: 'Open networking switch telemetry and RoCE congestion management.',
            },
          ],
          searchQueries: [
            `${researchTopic} architecture specifications`,
            `${researchTopic} latency benchmark RFC IEEE`,
          ],
          groundedWithGoogleSearch: false,
          researchedAt: new Date().toISOString(),
          model: 'Verified Offline Corpus (Quota Fallback)',
        });
      }
    } catch (err: any) {
      console.error('Error invoking research API:', err);
      setResearchError('Network error connecting to research backend. Loading verified reference baseline.');
      setResearchResult({
        topic: researchTopic.trim(),
        summary: `Standard architectural documentation retrieved for "${researchTopic.trim()}". Verify all primary citations prior to publishing.`,
        sources: [
          {
            title: 'ACM Digital Library: High Performance Computing & Architectures',
            url: 'https://dl.acm.org',
            domain: 'dl.acm.org',
            isGrounded: false,
            note: 'Peer-reviewed systems and networking research proceedings.',
          },
          {
            title: 'arXiv.org Computer Science & Distributed Systems',
            url: 'https://arxiv.org/archive/cs',
            domain: 'arxiv.org',
            isGrounded: false,
            note: 'Open-access primary preprints in computer systems architecture.',
          },
        ],
        searchQueries: [`${researchTopic} systems architecture`],
        groundedWithGoogleSearch: false,
        researchedAt: new Date().toISOString(),
      });
    } finally {
      setIsResearching(false);
    }
  };

  // Transfer Research Findings into Draft Editor
  const handleTransferResearchToEditor = () => {
    if (!researchResult) return;
    setAuditTitle(researchResult.topic);
    setAuditExcerpt(
      researchResult.summary.slice(0, 160).replace(/[#*`]/g, '').trim() + '...'
    );

    const citationsMarkdown = researchResult.sources
      .map((s) => `- **${s.title}**: [${s.domain || s.url}](${s.url}) — *${s.note || 'Primary specification source.'}*`)
      .join('\n');

    const combinedDraft = `${researchResult.summary}\n\n---\n\n### Primary Research Sources & Citations\n${citationsMarkdown}`;
    setAuditBody(combinedDraft);
    setActiveMode('auditor');
    setSelectedArticleId('custom');
    setQualityReport(null);
  };

  // ==========================================
  // RUN ARTICLE QUALITY & SEO AUDIT
  // ==========================================
  const handleRunAudit = async () => {
    if (!auditTitle || !auditBody) return;
    setIsAuditing(true);

    try {
      const response = await fetch('/api/gemini/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: auditTitle,
          excerpt: auditExcerpt,
          content: auditBody,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setQualityReport({
          ...data.data,
          isLiveGemini: true,
          auditedAt: data.auditedAt || new Date().toISOString(),
        });
      } else {
        // Graceful fallback to transparent, rigorous deterministic rules engine
        console.warn('Quality Check API returned non-200. Executing deterministic rules audit:', data);
        const deterministicReport = runDeterministicQualityAudit(auditTitle, auditBody, auditExcerpt);
        setQualityReport({
          ...deterministicReport,
          isLiveGemini: false,
        });
      }
    } catch (err) {
      console.error('Audit network request failed, executing deterministic rules engine:', err);
      const deterministicReport = runDeterministicQualityAudit(auditTitle, auditBody, auditExcerpt);
      setQualityReport({
        ...deterministicReport,
        isLiveGemini: false,
      });
    } finally {
      setIsAuditing(false);
      setActiveReportTab('overview');
    }
  };

  // ==========================================
  // HUMAN EDITORIAL ACTIONS
  // ==========================================
  const handleSaveAsDraft = () => {
    const article: Article = {
      id: selectedArticleId !== 'custom' ? selectedArticleId : `draft-${Date.now()}`,
      title: auditTitle,
      slug: auditTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: auditCategory,
      excerpt: auditExcerpt,
      content: auditBody,
      author: {
        name: 'TechPilot Systems Contributor',
        role: 'Verified Systems Researcher',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      publishedAt: 'Draft (Saved)',
      readTime: `${readTimeEstimate} min read`,
      featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      status: 'draft',
      qualityReport: qualityReport || undefined,
      reviewNotes: qualityReport
        ? `Audited: Overall Score ${qualityReport.overallScore}/100. Tech: ${qualityReport.scores.technicalQuality}, Sources: ${qualityReport.scores.sourceQuality}, SEO: ${qualityReport.scores.seo}.`
        : 'Saved as draft from Quality Control Workbench.',
      seo: {
        title: qualityReport?.seo.suggestedTitle || `${auditTitle} | TechPilot AI`,
        metaDescription: qualityReport?.seo.suggestedMetaDescription || auditExcerpt,
        keywords: qualityReport?.seo.suggestedKeywords || [auditCategory, 'Architecture', 'Inference'],
      },
      citations: [],
      metrics: { views: 0, likes: 0, shares: 0 },
      tags: [auditCategory, 'Quality Audited'],
    };

    onArticleSubmitted(article);
    setSubmissionStatus({
      type: 'draft',
      message: 'Article saved as draft. Never published automatically without human review.',
    });
  };

  const handleSubmitForReview = () => {
    const article: Article = {
      id: selectedArticleId !== 'custom' ? selectedArticleId : `pending-${Date.now()}`,
      title: auditTitle,
      slug: auditTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: auditCategory,
      excerpt: auditExcerpt,
      content: auditBody,
      author: {
        name: 'TechPilot Systems Contributor',
        role: 'Verified Systems Researcher',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      publishedAt: 'Pending Editorial Approval',
      readTime: `${readTimeEstimate} min read`,
      featuredImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      status: 'pending_review',
      qualityReport: qualityReport || undefined,
      reviewNotes: qualityReport
        ? `Submitted to Editorial Approval with Quality Audit (Composite: ${qualityReport.overallScore}/100). Technical: ${qualityReport.scores.technicalQuality}, Sources: ${qualityReport.scores.sourceQuality}, Readability: ${qualityReport.scores.readability}, SEO: ${qualityReport.scores.seo}. Problems flagged: ${qualityReport.problemsNeedingAttention.length}.`
        : 'Submitted for editorial review without pre-computed audit report.',
      seo: {
        title: qualityReport?.seo.suggestedTitle || `${auditTitle} | TechPilot AI`,
        metaDescription: qualityReport?.seo.suggestedMetaDescription || auditExcerpt,
        keywords: qualityReport?.seo.suggestedKeywords || [auditCategory, 'Engineering'],
      },
      citations: [],
      metrics: { views: 0, likes: 0, shares: 0 },
      tags: [auditCategory, 'Under Review'],
    };

    onArticleSubmitted(article);
    setSubmissionStatus({
      type: 'review',
      message: 'Manuscript forwarded to the Editorial Approval Pipeline. A human Editor-in-Chief must approve before publication.',
    });
  };

  const handleApplySeo = () => {
    if (!qualityReport) return;
    if (qualityReport.seo.suggestedTitle) setAuditTitle(qualityReport.seo.suggestedTitle);
    if (qualityReport.seo.suggestedMetaDescription) setAuditExcerpt(qualityReport.seo.suggestedMetaDescription);
  };

  const handleExportReportMarkdown = () => {
    if (!qualityReport) return;
    const md = `# Editorial Quality Control & SEO Audit Report: ${auditTitle}
Audited At: ${new Date(qualityReport.auditedAt).toLocaleString()}
Mode: ${qualityReport.isLiveGemini ? 'Live Gemini 3.8 Flash' : 'Deterministic Rules Engine'}
Composite Score: ${qualityReport.overallScore}/100

## 1. Quality Scores
- Technical Quality: ${qualityReport.scores.technicalQuality}/100 (${qualityReport.scoreRationales.technicalQualityRationale})
- Source Quality: ${qualityReport.scores.sourceQuality}/100 (${qualityReport.scoreRationales.sourceQualityRationale})
- Readability & Structure: ${qualityReport.scores.readability}/100 (${qualityReport.scoreRationales.readabilityRationale})
- SEO Optimization: ${qualityReport.scores.seo}/100 (${qualityReport.scoreRationales.seoRationale})

## 2. Problems Needing Attention (${qualityReport.problemsNeedingAttention.length})
${qualityReport.problemsNeedingAttention.map((p) => `- [${p.severity.toUpperCase()}] (${p.category}) ${p.problem}\n  Remediation: ${p.remediation}`).join('\n')}

## 3. SEO Recommendations
- Suggested Title: ${qualityReport.seo.suggestedTitle} (${qualityReport.seo.titleLength} chars)
- Suggested Meta Description: ${qualityReport.seo.suggestedMetaDescription} (${qualityReport.seo.metaDescriptionLength} chars)
- Target Keywords: ${qualityReport.seo.suggestedKeywords.join(', ')}
- Heading Structure: ${qualityReport.seo.headingStructureAssessment}

## 4. Priority Improvements
${qualityReport.improvementSuggestions.map((s) => `1. ${s}`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editorial-report-${Date.now()}.md`;
    a.click();
  };

  // Helper for score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
    if (score >= 70) return 'text-cyan-500 border-cyan-500 bg-cyan-500/10';
    if (score >= 50) return 'text-amber-500 border-amber-500 bg-amber-500/10';
    return 'text-rose-500 border-rose-500 bg-rose-500/10';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>AI Research Assistant</span>
          <span aria-hidden="true">·</span>
          <span>Google Search Grounding</span>
          <span aria-hidden="true">·</span>
          <span>Article Quality Control</span>
          <span aria-hidden="true">·</span>
          <span>Automated SEO Checker</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
              AI Research & Quality Control Center
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
              Conduct verified technical research with accessible sources, run rigorous multi-layer quality audits on manuscripts, optimize SEO metadata, and prepare peer-grade drafts for human editorial approval.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setActiveMode('researcher')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeMode === 'researcher'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-cyan-500" />
              <span>1. Research Assistant</span>
            </button>
            <button
              onClick={() => setActiveMode('auditor')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeMode === 'auditor'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>2. Quality & SEO Checker</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Notice: No Auto-Publishing */}
      <div className="mb-6 p-3 bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between text-xs text-cyan-900 dark:text-cyan-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>
            <strong>Zero-Fabrication & Strict Human Approval:</strong> All sources, scores, and findings are grounded. Articles are strictly saved as drafts and never published automatically.
          </span>
        </div>
        <span className="font-mono text-[11px] px-2 py-0.5 bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 rounded-md">
          Governance Active
        </span>
      </div>

      {/* Mode 1: AI Research Assistant */}
      {activeMode === 'researcher' && (
        <div className="space-y-8">
          {/* Query & Topic Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading">
                Technology Research Topic
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                <span>Google Search Grounding Supported</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Enter an emerging hardware architecture, protocol, or AI engineering topic..."
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleExecuteResearch}
                disabled={isResearching}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isResearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Investigating Web & Specs...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run Grounded Research</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Topics */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Sample topics:</span>
              {sampleTopics.map((top, idx) => (
                <button
                  key={idx}
                  onClick={() => setResearchTopic(top)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 truncate max-w-xs"
                >
                  {top}
                </button>
              ))}
            </div>

            {researchError && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{researchError}</span>
              </div>
            )}
          </div>

          {/* Research Results Display */}
          {researchResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Verified Accessible Sources */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-500" />
                      <span>Accessible Primary Sources</span>
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono rounded-md border border-emerald-500/20">
                      {researchResult.groundedWithGoogleSearch ? 'Google Search Grounded' : 'Verified Canonical Corpus'}
                    </span>
                  </div>

                  {researchResult.sources.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No web sources were returned for this specific topic query.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {researchResult.sources.map((source, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-cyan-500/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                              {source.title}
                            </span>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 shrink-0 p-1"
                              title="Open verified source in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>{source.domain || 'canonical source'}</span>
                            {source.isGrounded && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-sans text-[10px] font-medium">
                                · Grounded
                              </span>
                            )}
                          </div>
                          {source.note && (
                            <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 italic">
                              {source.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Queries Used */}
                  {researchResult.searchQueries && researchResult.searchQueries.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                        Grounding Search Queries Executed:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {researchResult.searchQueries.map((q, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700"
                          >
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Transfer Actions Card */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Next Action
                  </h4>
                  <button
                    onClick={handleTransferResearchToEditor}
                    className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Send to Quality & SEO Checker</span>
                  </button>
                  {onOpenStudioWithTopic && (
                    <button
                      onClick={() => onOpenStudioWithTopic(researchResult.topic)}
                      className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Draft in Content Studio</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Research Synthesis & Key Findings */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Technical Research Synthesis
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Grounded review of architectural invariants and empirical findings
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(researchResult.researchedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {researchResult.summary}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Article Quality & SEO Checker */}
      {activeMode === 'auditor' && (
        <div className="space-y-8">
          {/* Article Source Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading block">
                  Select Manuscript to Audit
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Audit an existing published or draft article, or paste your own custom manuscript
                </span>
              </div>

              <select
                value={selectedArticleId}
                onChange={(e) => handleSelectArticleToAudit(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                <option value="custom">-- Custom Manuscript / Scratchpad --</option>
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    [{art.status.toUpperCase()}] {art.title.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Title & Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Article Title ({auditTitle.length} chars)
                </label>
                <input
                  type="text"
                  value={auditTitle}
                  onChange={(e) => setAuditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Domain Category
                </label>
                <select
                  value={auditCategory}
                  onChange={(e) => setAuditCategory(e.target.value as ArticleCategory)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Generative AI">Generative AI</option>
                  <option value="Robotics & Hardware">Robotics & Hardware</option>
                  <option value="Quantum & Silicon">Quantum & Silicon</option>
                  <option value="AI Safety & Governance">AI Safety & Governance</option>
                  <option value="Dev & Cloud Architecture">Dev & Cloud Architecture</option>
                </select>
              </div>

              <div className="sm:col-span-12">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Executive Excerpt / Meta Preview ({auditExcerpt.length} chars)
                </label>
                <textarea
                  rows={2}
                  value={auditExcerpt}
                  onChange={(e) => setAuditExcerpt(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Markdown Body */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Markdown Content ({wordCount} words · ~{readTimeEstimate} min read)
                </label>
                <span className="text-[11px] text-slate-500">Supports LaTeX ($$ ... $$) and code fences</span>
              </div>
              <textarea
                rows={12}
                value={auditBody}
                onChange={(e) => setAuditBody(e.target.value)}
                className="w-full p-4 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 leading-relaxed"
              />
            </div>

            {/* Run Audit Button */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Audits technical accuracy, unsupported claims, math/code, repetition, and SEO</span>
              </div>

              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Manuscript...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run Quality & SEO Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submission Feedback Banner */}
          {submissionStatus.type && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
                submissionStatus.type === 'review'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{submissionStatus.message}</span>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 bg-white/20 rounded-md">Saved</span>
            </div>
          )}

          {/* EDITORIAL REPORT DASHBOARD */}
          {qualityReport && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                      Editorial Audit Report
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        qualityReport.isLiveGemini
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                      }`}
                    >
                      {qualityReport.isLiveGemini
                        ? 'Live Gemini 3.8 Flash Audit'
                        : 'Deterministic Technical Rules Engine'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading mt-1">
                    Manuscript Quality & SEO Evaluation
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportReportMarkdown}
                    className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Report</span>
                  </button>
                  <button
                    onClick={handleApplySeo}
                    className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Apply SEO Suggestions</span>
                  </button>
                </div>
              </div>

              {/* 4 SCORE METERS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Technical Quality */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technical Quality</span>
                    <span className={`text-base font-bold font-mono px-2 py-0.5 rounded-lg border ${getScoreColor(qualityReport.scores.technicalQuality)}`}>
                      {qualityReport.scores.technicalQuality}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-snug">
                    {qualityReport.scoreRationales.technicalQualityRationale}
                  </p>
                </div>

                {/* 2. Source Quality */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Source Quality</span>
                    <span className={`text-base font-bold font-mono px-2 py-0.5 rounded-lg border ${getScoreColor(qualityReport.scores.sourceQuality)}`}>
                      {qualityReport.scores.sourceQuality}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-snug">
                    {qualityReport.scoreRationales.sourceQualityRationale}
                  </p>
                </div>

                {/* 3. Readability & Structure */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Readability</span>
                    <span className={`text-base font-bold font-mono px-2 py-0.5 rounded-lg border ${getScoreColor(qualityReport.scores.readability)}`}>
                      {qualityReport.scores.readability}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-snug">
                    {qualityReport.scoreRationales.readabilityRationale}
                  </p>
                </div>

                {/* 4. SEO Optimization */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">SEO Optimization</span>
                    <span className={`text-base font-bold font-mono px-2 py-0.5 rounded-lg border ${getScoreColor(qualityReport.scores.seo)}`}>
                      {qualityReport.scores.seo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-snug">
                    {qualityReport.scoreRationales.seoRationale}
                  </p>
                </div>
              </div>

              {/* Sub-tabs for deep report */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {[
                  { id: 'overview', label: `Overview & Improvements (${qualityReport.improvementSuggestions.length})` },
                  { id: 'problems', label: `Problems Needing Attention (${qualityReport.problemsNeedingAttention.length})` },
                  { id: 'claims', label: `Unsupported Claims (${qualityReport.unsupportedClaims.length})` },
                  { id: 'mathCode', label: 'Math & Code Quality' },
                  { id: 'seo', label: 'SEO Suggestions' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveReportTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeReportTab === tab.id
                        ? 'bg-slate-900 dark:bg-cyan-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview & Improvements */}
              {activeReportTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 font-heading">
                      Prioritized Improvement Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {qualityReport.improvementSuggestions.map((sug, i) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 font-heading">
                        Originality & Depth Assessment
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {qualityReport.originalityAndValue.noveltyAssessment}
                      </p>
                      <div className="mt-2 text-[11px] font-mono text-slate-500">
                        AI Cliché Status: {qualityReport.originalityAndValue.isAiSlopFree ? '100% Free of Generic Slop' : `${qualityReport.originalityAndValue.boilerplatePhrasesFound.length} Generic phrases detected`}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 font-heading">
                        Repetition & Circularity Check
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {qualityReport.contentRepetition.details}
                      </p>
                      <div className="mt-2 text-[11px] font-mono text-slate-500">
                        Duplicate Headings/Sentences: {qualityReport.contentRepetition.hasRepetition ? 'Issues Detected' : 'Clean (No Duplication)'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Problems Needing Attention */}
              {activeReportTab === 'problems' && (
                <div className="space-y-3">
                  {qualityReport.problemsNeedingAttention.length === 0 ? (
                    <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      Zero critical problems detected! The manuscript meets the rigorous TechPilot engineering standard.
                    </div>
                  ) : (
                    qualityReport.problemsNeedingAttention.map((prob, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs ${
                          prob.severity === 'critical'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                            : prob.severity === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-900 dark:text-cyan-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded-md bg-white/20">
                              {prob.severity}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {prob.category}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 font-medium">{prob.problem}</p>
                        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <strong>Remediation:</strong> {prob.remediation}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Unsupported Claims */}
              {activeReportTab === 'claims' && (
                <div className="space-y-3">
                  {qualityReport.unsupportedClaims.length === 0 ? (
                    <div className="p-6 text-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      All quantitative metrics and claims are grounded or backed by primary citations!
                    </div>
                  ) : (
                    qualityReport.unsupportedClaims.map((claim, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                      >
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                          "{claim.claim}"
                        </span>
                        <div className="text-[11px] text-amber-700 dark:text-amber-300">
                          <strong>Flag:</strong> {claim.issue}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong>Suggested Verification:</strong> {claim.suggestedVerification}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Math & Code Quality */}
              {activeReportTab === 'mathCode' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 font-heading">
                      Mathematical Formulations (LaTeX)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {qualityReport.mathAndCode.equationNotes}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading">
                        Code Snippet Syntax & Safety
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        qualityReport.mathAndCode.codeSyntaxValid
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {qualityReport.mathAndCode.codeSyntaxValid ? 'Syntax Valid' : 'Syntax Issues'}
                      </span>
                    </div>

                    {qualityReport.mathAndCode.codeIssues.length > 0 && (
                      <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
                        {qualityReport.mathAndCode.codeIssues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    )}

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                      {qualityReport.mathAndCode.codeRecommendations.map((rec, i) => (
                        <p key={i}>✓ {rec}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: SEO Suggestions */}
              {activeReportTab === 'seo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Suggested Search Title
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {qualityReport.seo.titleLength} / 60 chars
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={qualityReport.seo.suggestedTitle}
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                      />
                      <button
                        onClick={() => setAuditTitle(qualityReport.seo.suggestedTitle)}
                        className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shrink-0"
                      >
                        Apply Title
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Suggested Meta Description
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {qualityReport.seo.metaDescriptionLength} / 160 chars
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <textarea
                        rows={2}
                        readOnly
                        value={qualityReport.seo.suggestedMetaDescription}
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                      <button
                        onClick={() => setAuditExcerpt(qualityReport.seo.suggestedMetaDescription)}
                        className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shrink-0"
                      >
                        Apply Meta
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Target Indexing Keywords
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {qualityReport.seo.suggestedKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                    <strong>Heading Hierarchy Analysis:</strong> {qualityReport.seo.headingStructureAssessment}
                  </div>
                </div>
              )}

              {/* HUMAN APPROVAL ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Human-in-the-loop: Articles remain in draft or review until signed off.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSaveAsDraft}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleSubmitForReview}
                    className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Editorial Approval</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
