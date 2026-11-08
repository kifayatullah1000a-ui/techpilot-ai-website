import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { Article } from '../types';

interface ArticleReaderProps {
  article: Article;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  allArticles: Article[];
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  onBack,
  onSelectArticle,
  allArticles,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<'1x' | '1.25x' | '1.5x'>('1x');
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.metrics?.likes || 0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Track scroll position for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const plainText = `${article.title}. ${article.excerpt}. ${article.content.replace(/[#*`$-]/g, ' ')}`;
      const utterance = new SpeechSynthesisUtterance(plainText.slice(0, 3000));
      const rateMap = { '1x': 1.0, '1.25x': 1.25, '1.5x': 1.5 };
      utterance.rate = rateMap[audioSpeed] || 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const relatedArticles = allArticles
    .filter(a => a.id !== article.id && a.status === 'published')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-50">
        <div 
          className="h-full bg-cyan-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation & Actions Top Strip */}
        <div className="flex items-center justify-between py-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Publications</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy share link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                hasLiked
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{likesCount}</span>
            </button>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="font-medium text-cyan-600 dark:text-cyan-400">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.isDemo ? 'Demonstration Sample' : article.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.readTime}</span>
            </span>
            {article.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700">
                  Demonstration Data
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {article.excerpt}
          </p>

          {/* Author Card */}
          <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  {article.author.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {article.author.role}
                </span>
              </div>
            </div>

            {/* Audio Synthesis Reader */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAudio}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isPlayingAudio
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Speaking' : 'Listen (Audio)'}</span>
              </button>
              {isPlayingAudio && (
                <button
                  onClick={() => {
                    const speeds: Array<'1x' | '1.25x' | '1.5x'> = ['1x', '1.25x', '1.5x'];
                    const next = speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
                    setAudioSpeed(next);
                  }}
                  className="px-2 py-1 text-xs font-mono bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md"
                >
                  {audioSpeed}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Featured Banner Image */}
        {article.featuredImage && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              src={article.featuredImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-72 sm:h-96 object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-6">
          <div className="p-4 bg-cyan-50/60 dark:bg-cyan-950/20 rounded-xl border border-cyan-200/60 dark:border-cyan-900/40 text-xs sm:text-sm text-cyan-950 dark:text-cyan-200">
            <span className="font-semibold block mb-1">Key Architectural Takeaway</span>
            <p className="leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="space-y-4 whitespace-pre-line text-sm sm:text-base leading-relaxed">
            {article.content}
          </div>
        </article>

        {/* Citations & Verified Sources */}
        {article.citations && article.citations.length > 0 && (
          <section className="mt-12 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading mb-3">
              Verified Primary Sources & Citations
            </h3>
            <ul className="space-y-2 text-xs">
              {article.citations.map((cite, idx) => (
                <li key={idx} className="flex items-start justify-between gap-4 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {cite.source}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {cite.note}
                    </span>
                  </div>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-cyan-600 transition-colors shrink-0"
                    title="Open citation source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tags */}
        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">Tags:</span>
          {article.tags.map((tag, idx) => (
            <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300">
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Deep Dives */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading mb-6">
              Related Technical Analyses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{rel.readTime}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
