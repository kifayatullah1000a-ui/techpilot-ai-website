import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileCheck, 
  FileEdit, 
  Eye, 
  Check, 
  X, 
  MessageSquare, 
  ExternalLink, 
  Download, 
  Trash2,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Database,
  RefreshCw,
  Copy,
  Code2,
  Terminal,
  Activity,
  Save,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Article, ArticleCategory, ArticleStatus } from '../types';
import { runDeterministicQualityAudit } from '../utils/qualityAuditor';
import { 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  testSupabaseSaveAndRetrieve, 
  updateArticleInSupabase, 
  deleteArticleFromSupabase 
} from '../lib/supabase';

interface ApprovalPipelineProps {
  articles: Article[];
  onUpdateArticleStatus: (articleId: string, newStatus: ArticleStatus, notes?: string) => Promise<boolean> | void;
  onDeleteArticle: (articleId: string) => Promise<boolean> | void;
  onViewLiveArticle: (article: Article) => void;
  onEditArticle?: (updatedArticle: Article) => Promise<boolean> | void;
  onRefreshArticles?: () => void;
}

export const ApprovalPipeline: React.FC<ApprovalPipelineProps> = ({
  articles,
  onUpdateArticleStatus,
  onDeleteArticle,
  onViewLiveArticle,
  onEditArticle,
  onRefreshArticles,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ArticleStatus>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);
  const [dbActionResult, setDbActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [draftEditForm, setDraftEditForm] = useState<{
    title: string;
    slug: string;
    category: ArticleCategory;
    excerpt: string;
    content: string;
    metaDescription: string;
    keywords: string;
  }>({
    title: '',
    slug: '',
    category: 'Dev & Cloud Architecture',
    excerpt: '',
    content: '',
    metaDescription: '',
    keywords: '',
  });

  const [checklist, setChecklist] = useState({
    factualVerification: false,
    codeTested: false,
    noAiSlop: false,
    seoOptimized: false,
  });

  // Supabase state & diagnostics
  const [supabaseStatus, setSupabaseStatus] = useState(() => getSupabaseConfig());
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
    details?: any;
  } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Check Supabase status from backend on mount
  useEffect(() => {
    fetch('/api/supabase/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setSupabaseStatus({
            url: data.url,
            hasKey: true,
            maskedKey: data.maskedKey,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not query server Supabase status:', err);
      });
  }, []);

  const filteredArticles = articles.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.status === activeFilter;
  });

  const countByStatus = {
    all: articles.length,
    pending_review: articles.filter((a) => a.status === 'pending_review').length,
    revision_requested: articles.filter((a) => a.status === 'revision_requested').length,
    approved: articles.filter((a) => a.status === 'approved').length,
    rejected: articles.filter((a) => a.status === 'rejected').length,
    published: articles.filter((a) => a.status === 'published').length,
    draft: articles.filter((a) => a.status === 'draft').length,
  };

  const openReviewModal = (article: Article) => {
    setSelectedArticle(article);
    setFeedbackNotes(article.reviewNotes || '');
    setIsEditingDraft(false);
    setDraftEditForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      excerpt: article.excerpt || '',
      content: article.content,
      metaDescription: article.seo?.metaDescription || article.excerpt || '',
      keywords: article.seo?.keywords?.join(', ') || '',
    });
    setChecklist({
      factualVerification: article.status === 'published' || article.status === 'approved',
      codeTested: article.status === 'published' || article.status === 'approved',
      noAiSlop: article.status === 'published' || article.status === 'approved',
      seoOptimized: article.status === 'published' || article.status === 'approved',
    });
  };

  const handleAction = async (status: ArticleStatus) => {
    if (!selectedArticle) return;
    setIsUpdatingDb(true);
    setDbActionResult(null);
    const success = await onUpdateArticleStatus(selectedArticle.id, status, feedbackNotes);
    setIsUpdatingDb(false);
    if (success !== false) {
      setSelectedArticle({ ...selectedArticle, status, reviewNotes: feedbackNotes });
      setDbActionResult({
        type: 'success',
        message: `Status updated to ${status} in Supabase.`,
      });
      setTimeout(() => setDbActionResult(null), 4000);
    } else {
      setDbActionResult({
        type: 'error',
        message: `Failed to update status to ${status} in Supabase.`,
      });
    }
  };

  const handleSaveDraftEdits = async () => {
    if (!selectedArticle) return;

    const keywordsArray = draftEditForm.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const updated: Article = {
      ...selectedArticle,
      title: draftEditForm.title,
      slug: draftEditForm.slug,
      category: draftEditForm.category,
      excerpt: draftEditForm.excerpt,
      content: draftEditForm.content,
      seo: {
        ...selectedArticle.seo,
        title: `${draftEditForm.title} | TechPilot AI`,
        metaDescription: draftEditForm.metaDescription,
        keywords: keywordsArray,
      },
    };

    setIsUpdatingDb(true);
    setDbActionResult(null);

    let success = false;
    if (onEditArticle) {
      const res = await onEditArticle(updated);
      success = res !== false;
    } else {
      const res = await onUpdateArticleStatus(updated.id, updated.status, updated.reviewNotes);
      success = res !== false;
    }
    setIsUpdatingDb(false);

    if (success) {
      setSelectedArticle(updated);
      setIsEditingDraft(false);
      setSaveSuccessNotice('Draft edits saved to Supabase successfully!');
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    } else {
      setDbActionResult({
        type: 'error',
        message: 'Failed to save manuscript edits to Supabase.',
      });
    }
  };

  const handleRunLiveDbTest = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);

    // First attempt client probe
    let result = await testSupabaseSaveAndRetrieve();

    // If client wasn't configured, check if server has key configured
    if (!result.success) {
      try {
        const srvRes = await fetch('/api/supabase/test', { method: 'POST' });
        const srvData = await srvRes.json();
        if (srvData.success) {
          result = {
            success: true,
            message: srvData.message,
            latencyMs: srvData.latencyMs,
            details: { ...srvData, source: 'server-verified' },
          };
        }
      } catch (e) {
        console.warn('Server probe fallback exception', e);
      }
    }

    setDbTestResult({
      tested: true,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
      details: result.details,
    });
    setIsTestingDb(false);
  };

  const handleExportMarkdown = (article: Article) => {
    const md = `# ${article.title}
Category: ${article.category}
Author: ${article.author.name}
Status: ${article.status}

${article.excerpt}

---

${article.content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.slug || 'article'}.md`;
    a.click();
  };

  const statusBadgeMap: Record<ArticleStatus, { label: string; bgClass: string; textClass: string }> = {
    draft: { label: 'Local Draft', bgClass: 'bg-slate-100 dark:bg-slate-800', textClass: 'text-slate-600 dark:text-slate-400' },
    pending_review: { label: 'Pending Review', bgClass: 'bg-amber-100 dark:bg-amber-950/60', textClass: 'text-amber-800 dark:text-amber-300' },
    revision_requested: { label: 'Revisions Requested', bgClass: 'bg-rose-100 dark:bg-rose-950/60', textClass: 'text-rose-800 dark:text-rose-300' },
    approved: { label: 'Approved & Ready', bgClass: 'bg-cyan-100 dark:bg-cyan-950/60', textClass: 'text-cyan-800 dark:text-cyan-300' },
    published: { label: 'Published Live', bgClass: 'bg-emerald-100 dark:bg-emerald-950/60', textClass: 'text-emerald-800 dark:text-emerald-300' },
    rejected: { label: 'Rejected', bgClass: 'bg-slate-200 dark:bg-slate-800', textClass: 'text-slate-500' },
  };

  const sqlSchemaText = `-- TechPilot AI - Supabase Database Schema
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'revision_requested', 'approved', 'published', 'rejected')),
  author_name TEXT DEFAULT 'TechPilot Editorial Staff',
  author_role TEXT DEFAULT 'Staff Contributor',
  author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  read_time TEXT DEFAULT '5 min read',
  featured_image TEXT DEFAULT '/src/assets/images/blog_neural_agents_1793517435046.jpg',
  review_notes TEXT DEFAULT '',
  seo JSONB DEFAULT '{"title": "", "metaDescription": "", "keywords": []}'::jsonb,
  citations JSONB DEFAULT '[]'::jsonb,
  quality_report JSONB DEFAULT NULL,
  metrics JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policies for public reading and editorial operations
CREATE POLICY "Public Read Published Only" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Editorial Read All" ON public.articles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Editorial Insert Manuscripts" ON public.articles FOR INSERT TO anon, authenticated WITH CHECK (title IS NOT NULL AND content IS NOT NULL);
CREATE POLICY "Editorial Update Manuscripts" ON public.articles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Editorial Delete Manuscripts" ON public.articles FOR DELETE TO anon, authenticated USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Editorial Governance Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Editorial Governance & Review Pipeline</span>
          <span aria-hidden="true">·</span>
          <span>Editor-in-Chief Authority</span>
          <span aria-hidden="true">·</span>
          <span>Zero Auto-Publish Standard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
              Editorial Approval & Database Pipeline
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
              Inspect manuscripts, verify code and citations, edit drafts, and authorize articles for live publication. Articles are saved to your Supabase PostgreSQL database with Row Level Security.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{countByStatus.pending_review}</strong> article(s) awaiting your editorial sign-off.
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Connection & Live Verification Card */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                Supabase PostgreSQL Integration
              </h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                  supabaseStatus.hasKey
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                {supabaseStatus.hasKey ? '● Configured' : '○ Waiting for Publishable Key'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span>Project: https://qusbrdwetykqhpmjxpcr.supabase.co</span>
              <span>·</span>
              <span>Anon Key: {supabaseStatus.maskedKey}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>View SQL Schema</span>
            </button>

            {onRefreshArticles && (
              <button
                onClick={onRefreshArticles}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Supabase</span>
              </button>
            )}

            <button
              onClick={handleRunLiveDbTest}
              disabled={isTestingDb}
              className="px-3.5 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isTestingDb ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Probing Supabase...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  <span>Run Live Save & Retrieval Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Test Diagnostic Output */}
        {dbTestResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              dbTestResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}
          >
            {dbTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="font-semibold flex items-center justify-between">
                <span>
                  {dbTestResult.success ? 'Supabase Connection & Roundtrip Verified' : 'Database Probe Notification'}
                </span>
                {dbTestResult.latencyMs && (
                  <span className="font-mono text-[11px] opacity-75">
                    Latency: {dbTestResult.latencyMs}ms
                  </span>
                )}
              </div>
              <p className="leading-relaxed">{dbTestResult.message}</p>
              {!dbTestResult.success && (
                <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  Tip: Configure <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in Settings &gt; Secrets, and ensure the SQL schema has been executed in the Supabase SQL editor.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto border border-slate-200/80 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === 'all'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>All Records</span>
          <span className="font-mono text-[11px] text-slate-400">({countByStatus.all})</span>
        </button>

        <button
          onClick={() => setActiveFilter('pending_review')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === 'pending_review'
              ? 'bg-amber-500 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Pending Review</span>
          <span className="font-mono text-[11px]">({countByStatus.pending_review})</span>
        </button>

        <button
          onClick={() => setActiveFilter('draft')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === 'draft'
              ? 'bg-slate-700 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Drafts</span>
          <span className="font-mono text-[11px]">({countByStatus.draft})</span>
        </button>

        <button
          onClick={() => setActiveFilter('revision_requested')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === 'revision_requested'
              ? 'bg-rose-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Revision Requested</span>
          <span className="font-mono text-[11px]">({countByStatus.revision_requested})</span>
        </button>

        <button
          onClick={() => setActiveFilter('approved')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === 'approved'
              ? 'bg-cyan-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Approved</span>
          <span className="font-mono text-[11px]">({countByStatus.approved})</span>
        </button>

        <button
          onClick={() => setActiveFilter('published')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeFilter === 'published'
              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Published Live</span>
          <span className="font-mono text-[11px]">({countByStatus.published})</span>
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Title & Excerpt</th>
                <th className="py-3 px-4">Author / Origin</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredArticles.map((article) => {
                const current = statusBadgeMap[article.status] || statusBadgeMap.draft;
                return (
                  <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 max-w-md">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 font-heading text-sm">
                        {article.title}
                      </div>
                      <div className="text-slate-500 line-clamp-1 text-xs mt-0.5">
                        {article.excerpt || 'No summary excerpt provided.'}
                      </div>
                      <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-slate-400">
                        <span>slug: {article.slug}</span>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={article.author.avatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {article.author.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                      {article.category}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${current.bgClass} ${current.textClass}`}>
                        {current.label}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReviewModal(article)}
                          className="px-2.5 py-1.5 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors flex items-center gap-1"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Review & Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete article "${article.title}"?`)) {
                              onDeleteArticle(article.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {article.status === 'published' && (
                          <button
                            onClick={() => onViewLiveArticle(article)}
                            className="p-1.5 text-slate-400 hover:text-cyan-600 transition-colors"
                            title="View on public blog"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredArticles.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No articles found under "{activeFilter}".
          </div>
        )}
      </div>

      {/* Review, Edit & Approval Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {selectedArticle.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{selectedArticle.status.replace('_', ' ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedArticle.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading">
                  {selectedArticle.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch between Inspect/Checklist and Edit Manuscript */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setIsEditingDraft(false)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      !isEditingDraft
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Inspect & Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingDraft(true)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      isEditingDraft
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Edit Draft Content
                  </button>
                </div>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {saveSuccessNotice && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{saveSuccessNotice}</span>
                </div>
              )}

              {isEditingDraft ? (
                /* EDIT DRAFT MODE */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Article Title
                      </label>
                      <input
                        type="text"
                        value={draftEditForm.title}
                        onChange={(e) => setDraftEditForm({ ...draftEditForm, title: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={draftEditForm.slug}
                        onChange={(e) => setDraftEditForm({ ...draftEditForm, slug: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Category
                      </label>
                      <select
                        value={draftEditForm.category}
                        onChange={(e) => setDraftEditForm({ ...draftEditForm, category: e.target.value as ArticleCategory })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      >
                        <option value="Generative AI">Generative AI</option>
                        <option value="Robotics & Hardware">Robotics & Hardware</option>
                        <option value="Quantum & Silicon">Quantum & Silicon</option>
                        <option value="AI Safety & Governance">AI Safety & Governance</option>
                        <option value="Dev & Cloud Architecture">Dev & Cloud Architecture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Suggested Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={draftEditForm.keywords}
                        onChange={(e) => setDraftEditForm({ ...draftEditForm, keywords: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Excerpt / Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={draftEditForm.excerpt}
                      onChange={(e) => setDraftEditForm({ ...draftEditForm, excerpt: e.target.value, metaDescription: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Markdown Content Body
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {draftEditForm.content.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={12}
                      value={draftEditForm.content}
                      onChange={(e) => setDraftEditForm({ ...draftEditForm, content: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingDraft(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraftEdits}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* INSPECT & REVIEW MODE */
                <>
                  {/* Verification Checklist */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2 font-heading">
                      Editor-in-Chief Pre-Publication Checklist
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.factualVerification}
                          onChange={(e) => setChecklist({ ...checklist, factualVerification: e.target.checked })}
                          className="rounded text-cyan-600 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Primary source citations verified
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.codeTested}
                          onChange={(e) => setChecklist({ ...checklist, codeTested: e.target.checked })}
                          className="rounded text-cyan-600 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Code snippets syntactically valid
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.noAiSlop}
                          onChange={(e) => setChecklist({ ...checklist, noAiSlop: e.target.checked })}
                          className="rounded text-cyan-600 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Free of generic AI conversational filler
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.seoOptimized}
                          onChange={(e) => setChecklist({ ...checklist, seoOptimized: e.target.checked })}
                          className="rounded text-cyan-600 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          Metadata & SERP preview compliant
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Quality & SEO Report Summary */}
                  {selectedArticle.qualityReport ? (
                    <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Quality & SEO Pre-Audit Results (Composite: {selectedArticle.qualityReport.overallScore}/100)</span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                          {selectedArticle.qualityReport.isLiveGemini ? 'Gemini 3.8 Flash' : 'Deterministic Rules Engine'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Technical</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{selectedArticle.qualityReport.scores.technicalQuality}/100</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Sources</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{selectedArticle.qualityReport.scores.sourceQuality}/100</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Readability</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{selectedArticle.qualityReport.scores.readability}/100</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 block">SEO</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{selectedArticle.qualityReport.scores.seo}/100</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Quality audit report not yet attached to this draft.
                      </span>
                      <button
                        onClick={() => {
                          const report = runDeterministicQualityAudit(selectedArticle.title, selectedArticle.content, selectedArticle.excerpt);
                          setSelectedArticle({ ...selectedArticle, qualityReport: report });
                        }}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium text-[11px]"
                      >
                        Run Instant Audit
                      </button>
                    </div>
                  )}

                  {/* Manuscript Content Preview */}
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
                      Manuscript Content Preview
                    </span>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto text-slate-800 dark:text-slate-200 font-mono">
                      {selectedArticle.content}
                    </div>
                  </div>

                  {/* Feedback Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      Editor Revision Notes & Directives
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      placeholder="e.g. Please expand on section 2 with concrete latency benchmarks, or verify proof."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportMarkdown(selectedArticle)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .MD</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete article "${selectedArticle.title}"?`)) {
                      onDeleteArticle(selectedArticle.id);
                      if (isSupabaseConfigured()) {
                        deleteArticleFromSupabase(selectedArticle.id);
                      }
                      setSelectedArticle(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction('rejected')}
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                >
                  Reject Manuscript
                </button>

                <button
                  onClick={() => handleAction('revision_requested')}
                  className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  Request Revisions
                </button>

                <button
                  onClick={() => handleAction('approved')}
                  className="px-3 py-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  Approve Manuscript
                </button>

                <button
                  onClick={() => {
                    handleAction('published');
                    onViewLiveArticle({ ...selectedArticle, status: 'published' });
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publish to Live Blog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                  Supabase SQL Migration Script
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-cyan-900 dark:text-cyan-200 mb-1">
                  How to execute this migration:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Open your Supabase project: <code className="bg-cyan-100 dark:bg-cyan-900/40 px-1 py-0.2 rounded font-mono">https://qusbrdwetykqhpmjxpcr.supabase.co</code></li>
                  <li>Click on <strong>SQL Editor</strong> in the left sidebar navigation.</li>
                  <li>Paste the SQL script below and click <strong>Run</strong>.</li>
                  <li>This creates the <code className="font-mono">articles</code> table with Row Level Security (RLS) policies.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-80 border border-slate-800">
                  {sqlSchemaText}
                </pre>
                <button
                  onClick={copySql}
                  className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
