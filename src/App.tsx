import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { TrendingRadar } from './components/TrendingRadar';
import { BlogSection } from './components/BlogSection';
import { ArticleReader } from './components/ArticleReader';
import { ToolsHub } from './components/ToolsHub';
import { ContentStudio } from './components/ContentStudio';
import { ResearchWorkbench } from './components/ResearchWorkbench';
import { ApprovalPipeline } from './components/ApprovalPipeline';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage, TermsOfServicePage } from './components/LegalPages';
import { AdminLogin } from './components/AdminLogin';
import { INITIAL_ARTICLES, TOOL_ITEMS } from './data/initialArticles';
import { Article, ArticleStatus, ActiveTab } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  fetchArticlesFromSupabase, 
  saveArticleToSupabase, 
  updateArticleInSupabase, 
  deleteArticleFromSupabase 
} from './lib/supabase';
import { 
  Terminal, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Send,
  Cpu,
  Layers,
  ChevronRight,
  Lock,
  LogOut,
  UserCheck,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

function AppContent() {
  const { isAdmin, adminUser, logout, showLoginModal, setShowLoginModal, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [studioTopic, setStudioTopic] = useState<string>('');
  const [researchTopic, setResearchTopic] = useState<string>('');

  // Initial and reactive fetch from Supabase (fetches published-only for public, all for admin)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingArticles(true);
    setArticlesError(null);

    fetchArticlesFromSupabase()
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          setArticles(res.data);
          setArticlesError(null);
        } else if (res.error) {
          setArticlesError(res.error);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setArticlesError(err.message || 'Error querying Supabase database');
      })
      .finally(() => {
        if (isMounted) setIsLoadingArticles(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  // Dual-theme light/dark state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Calculate count of pending articles
  const pendingCount = articles.filter((a) => a.status === 'pending_review').length;

  const handleArticleCreated = async (newArt: Article): Promise<boolean> => {
    if (!isAdmin) {
      openLoginModal();
      setNotification({
        type: 'error',
        message: 'Administrator authentication required: Log in to save manuscripts to Supabase.',
      });
      return false;
    }

    try {
      const res = await saveArticleToSupabase(newArt);
      if (!res.success) {
        setNotification({
          type: 'error',
          message: `Database Save Error: ${res.error || 'Failed to save manuscript to Supabase.'}`,
        });
        return false;
      }

      const saved = res.data || newArt;
      setArticles((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
      setNotification({
        type: 'success',
        message: `Manuscript "${saved.title}" saved to Supabase (status: ${saved.status}).`,
      });
      setActiveTab('approvals');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Network Exception: ${err.message || 'Failed to connect to Supabase.'}`,
      });
      return false;
    }
  };

  const handleUpdateArticleStatus = async (
    articleId: string,
    newStatus: ArticleStatus,
    notes?: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      openLoginModal();
      setNotification({
        type: 'error',
        message: 'Administrator authentication required to change manuscript status.',
      });
      return false;
    }

    const currentArt = articles.find((a) => a.id === articleId);
    if (!currentArt) return false;

    try {
      const res = await updateArticleInSupabase(articleId, {
        status: newStatus,
        reviewNotes: notes,
      });

      if (!res.success) {
        setNotification({
          type: 'error',
          message: `Supabase Status Update Failed: ${res.error || 'Permission denied by RLS.'}`,
        });
        return false;
      }

      const isNewlyPublished = newStatus === 'published' && currentArt.status !== 'published';
      setArticles((prev) =>
        prev.map((art) => {
          if (art.id === articleId) {
            return {
              ...art,
              status: newStatus,
              publishedAt: isNewlyPublished
                ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : art.publishedAt,
              isDemo: false,
              reviewNotes: notes !== undefined ? notes : art.reviewNotes,
            };
          }
          return art;
        })
      );

      setNotification({
        type: 'success',
        message: `Article status successfully updated to "${newStatus}" in Supabase.`,
      });
      return true;
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Status Update Error: ${err.message || 'Failed to communicate with Supabase.'}`,
      });
      return false;
    }
  };

  const handleEditArticle = async (updatedArticle: Article): Promise<boolean> => {
    if (!isAdmin) {
      openLoginModal();
      setNotification({
        type: 'error',
        message: 'Administrator authentication required to edit manuscripts.',
      });
      return false;
    }

    try {
      const res = await saveArticleToSupabase(updatedArticle);
      if (!res.success) {
        setNotification({
          type: 'error',
          message: `Supabase Edit Failed: ${res.error || 'Could not update manuscript.'}`,
        });
        return false;
      }

      const saved = res.data || updatedArticle;
      setArticles((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
      setNotification({
        type: 'success',
        message: `Edits for "${saved.title}" saved to Supabase.`,
      });
      return true;
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Edit Save Error: ${err.message || 'Network error saving edits.'}`,
      });
      return false;
    }
  };

  const handleDeleteArticle = async (articleId: string): Promise<boolean> => {
    if (!isAdmin) {
      openLoginModal();
      setNotification({
        type: 'error',
        message: 'Administrator authentication required to delete manuscripts.',
      });
      return false;
    }

    try {
      const res = await deleteArticleFromSupabase(articleId);
      if (!res.success) {
        setNotification({
          type: 'error',
          message: `Supabase Deletion Failed: ${res.error || 'Could not delete article.'}`,
        });
        return false;
      }

      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      setNotification({
        type: 'success',
        message: 'Manuscript permanently removed from Supabase.',
      });
      return true;
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Delete Error: ${err.message || 'Failed to delete from Supabase.'}`,
      });
      return false;
    }
  };

  const handleRefreshArticles = async () => {
    setIsLoadingArticles(true);
    setArticlesError(null);
    try {
      const res = await fetchArticlesFromSupabase();
      if (res.data) {
        setArticles(res.data);
        setNotification({
          type: 'info',
          message: `Synced ${res.data.length} article(s) from Supabase.`,
        });
      } else if (res.error) {
        setArticlesError(res.error);
      }
    } catch (err: any) {
      setArticlesError(err.message || 'Refresh failed');
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudioWithTopic = (topic: string) => {
    setStudioTopic(topic);
    setSelectedArticle(null);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenResearchWithTopic = (topic: string) => {
    setResearchTopic(topic);
    setSelectedArticle(null);
    setActiveTab('research');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to switch tabs and clear active reader
  const handleTabChange = (tab: ActiveTab) => {
    setSelectedArticle(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isDark={isDark}
        setIsDark={setIsDark}
        pendingApprovalsCount={pendingCount}
        onNewArticle={() => handleTabChange('studio')}
      />

      {/* Global Database Feedback Banner */}
      {notification && (
        <div
          role="alert"
          className={`w-full py-2.5 px-4 sm:px-8 border-b text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:opacity-75 rounded transition-opacity"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* If viewing a single article */}
        {selectedArticle ? (
          <ArticleReader
            article={selectedArticle}
            allArticles={articles}
            onBack={() => setSelectedArticle(null)}
            onSelectArticle={handleSelectArticle}
          />
        ) : (
          <>
            {/* TAB: HOME */}
            {activeTab === 'home' && (
              <div>
                {/* Hero Section */}
                <HeroSection
                  onOpenBlog={() => handleTabChange('blog')}
                  onOpenTools={() => handleTabChange('tools')}
                  onOpenStudio={() => handleTabChange('studio')}
                />

                {/* Trending Radar */}
                <TrendingRadar
                  onSelectTopic={(topic) => handleOpenStudioWithTopic(topic)}
                />

                {/* Featured Tools Showcase Banner */}
                <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        <span>Zero Sign-Up Required</span>
                        <span aria-hidden="true">·</span>
                        <span>Client-Side Fast Execution</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
                        Free Developer & Technical Creator Tools
                      </h2>
                    </div>

                    <button
                      onClick={() => handleTabChange('tools')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors"
                    >
                      <span>Explore all 6 tools</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOL_ITEMS.slice(0, 3).map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => handleTabChange('tools')}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                              {tool.category}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {tool.badge}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors font-heading">
                            {tool.name}
                          </h3>

                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span>{tool.actionLabel}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Featured Blog Preview */}
                <div className="border-t border-slate-200 dark:border-slate-800/80">
                  <BlogSection
                    articles={articles}
                    onSelectArticle={handleSelectArticle}
                    onOpenStudioWithTopic={handleOpenStudioWithTopic}
                  />
                </div>

                {/* Editorial Pipeline & Human Review Trust Banner */}
                <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xs">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-amber-600 dark:text-amber-400">Human-in-the-Loop Editorial Standard</span>
                          <span aria-hidden="true">·</span>
                          <span>Zero Automated Publishing</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
                          Every Article Must Pass Editor-in-Chief Review
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                          Unlike generic AI content farms that dump unvetted synthetic text onto the internet, TechPilot AI implements an air-gapped review pipeline. Authors and AI assistants draft manuscripts, but publication strictly requires manual review, citation verification, and explicit administrator authorization.
                        </p>
                      </div>

                      <div className="lg:col-span-4 flex flex-col gap-3">
                        <button
                          onClick={() => handleTabChange('approvals')}
                          className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                          {isAdmin ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              <span>Open Editorial Approval Board</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                              <span>Admin Access: Approval Board</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleTabChange('studio')}
                          className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>Draft in Content Studio</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* TAB: TOOLS */}
            {activeTab === 'tools' && (
              <ToolsHub
                onSendToStudio={(promptText) => {
                  setStudioTopic(promptText.slice(0, 80));
                  setActiveTab('studio');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSendToResearch={(topic) => {
                  setResearchTopic(topic);
                  setActiveTab('research');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* TAB: BLOG */}
            {activeTab === 'blog' && (
              <BlogSection
                articles={articles}
                onSelectArticle={handleSelectArticle}
                onOpenStudioWithTopic={handleOpenStudioWithTopic}
              />
            )}

            {/* TAB: CONTENT STUDIO */}
            {activeTab === 'studio' && (
              <ContentStudio
                initialTopic={studioTopic}
                onArticleCreated={handleArticleCreated}
              />
            )}

            {/* TAB: RESEARCH LAB */}
            {activeTab === 'research' && (
              <ResearchWorkbench
                initialTopic={researchTopic}
                onArticleSubmitted={handleArticleCreated}
                articles={articles}
                onOpenStudioWithTopic={handleOpenStudioWithTopic}
              />
            )}

            {/* TAB: EDITORIAL APPROVALS (Protected: Authenticated Admin Only) */}
            {activeTab === 'approvals' && (
              isAdmin ? (
                <ApprovalPipeline
                  articles={articles}
                  onUpdateArticleStatus={handleUpdateArticleStatus}
                  onDeleteArticle={handleDeleteArticle}
                  onEditArticle={handleEditArticle}
                  onRefreshArticles={handleRefreshArticles}
                  onViewLiveArticle={(art) => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ) : (
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="max-w-xl mx-auto mb-6 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5 mb-3">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Protected Pipeline</span>
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
                      Editorial Board Access Restricted
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Unpublished manuscripts, pending submissions, revision queues, and publishing controls are restricted exclusively to authenticated administrators.
                    </p>
                  </div>
                  <AdminLogin
                    isModal={false}
                    reasonMessage="Sign in with your administrator credentials to review pending drafts and authorize live publication."
                    onSuccess={() => {}}
                  />
                </div>
              )
            )}

            {/* TAB: ADMIN PORTAL */}
            {activeTab === 'admin' && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {isAdmin ? (
                  <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                          Administrator Session Active
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Authenticated via Supabase Project <code className="text-cyan-600 dark:text-cyan-400">qusbrdwetykqhpmjxpcr</code>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Administrator Email:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{adminUser?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Account Role:</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{adminUser?.role || 'Administrator'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Editorial Status:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Authorized
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleTabChange('approvals')}
                        className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Go to Approvals Board</span>
                      </button>
                      <button
                        onClick={logout}
                        className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <AdminLogin
                    isModal={false}
                    reasonMessage="Sign in with your administrator credentials to access the editorial management board."
                    onSuccess={() => handleTabChange('approvals')}
                  />
                )}
              </div>
            )}

            {/* TAB: ABOUT US */}
            {activeTab === 'about' && (
              <AboutPage onNavigate={handleTabChange} />
            )}

            {/* TAB: CONTACT US */}
            {activeTab === 'contact' && (
              <ContactPage />
            )}

            {/* TAB: PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <PrivacyPolicyPage onBackToHome={() => handleTabChange('home')} />
            )}

            {/* TAB: TERMS OF SERVICE */}
            {activeTab === 'terms' && (
              <TermsOfServicePage onBackToHome={() => handleTabChange('home')} />
            )}
          </>
        )}
      </main>

      {/* Floating or Modal Admin Login */}
      {showLoginModal && (
        <AdminLogin
          isModal={true}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
          }}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleTabChange} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
