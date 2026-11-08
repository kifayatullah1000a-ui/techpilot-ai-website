import React, { useState } from 'react';
import { Search, Clock, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { Article, ArticleCategory } from '../types';

interface BlogSectionProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onOpenStudioWithTopic?: (topic: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  articles,
  onSelectArticle,
  onOpenStudioWithTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'readTime'>('latest');

  const categories: string[] = [
    'All',
    'Generative AI',
    'Robotics & Hardware',
    'Quantum & Silicon',
    'AI Safety & Governance',
    'Dev & Cloud Architecture',
  ];

  // Filter only published articles for public view
  const publishedArticles = articles.filter((a) => a.status === 'published');

  const filteredArticles = publishedArticles
    .filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'readTime') {
        const timeA = parseInt(a.readTime) || 0;
        const timeB = parseInt(b.readTime) || 0;
        return timeA - timeB;
      }
      return 0; // Default order
    });

  const featuredArticle = publishedArticles.find((a) => a.featured) || publishedArticles[0];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Blog Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>Frontier Tech Journalism</span>
            <span aria-hidden="true">·</span>
            <span>Technical Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Verified Citations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            Technology & AI Deep Dives
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            In-depth architectural breakdowns, hardware physical limits, autonomous systems, and distributed inference topologies.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search architecture, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortBy === 'latest'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('readTime')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortBy === 'readTime'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Read Time
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Marquee Card (when not searching specific queries) */}
      {!searchQuery && selectedCategory === 'All' && featuredArticle && (
        <div
          onClick={() => onSelectArticle(featuredArticle)}
          className="group relative mb-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                    {featuredArticle.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Featured Deep Dive</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredArticle.readTime}</span>
                </div>

                <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {featuredArticle.title}
                </h2>

                <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredArticle.author.avatar}
                    alt={featuredArticle.author.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-xs">
                    <span className="font-medium text-slate-900 dark:text-slate-100 block">
                      {featuredArticle.author.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {featuredArticle.author.role}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                  Read Article
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
              <img
                src={featuredArticle.featuredImage}
                alt={featuredArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between shadow-xs"
          >
            <div>
              {/* Card Image */}
              <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                {article.isDemo && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-900/80 text-slate-200 backdrop-blur-xs border border-white/10">
                    Demonstration Sample
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                {/* Clean unboxed metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-medium text-cyan-600 dark:text-cyan-400">
                    {article.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 font-heading">
                  {article.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate">{article.author.name}</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {article.isDemo ? 'Demonstration Data' : article.publishedAt}
              </span>
            </div>
          </article>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          {publishedArticles.length === 0 ? (
            <div className="max-w-md mx-auto">
              <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-heading">
                Live Supabase Database Connected
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                No articles are published in the live database yet. In TechPilot AI, every manuscript requires human editorial review and explicit administrator approval before public release.
              </p>
              {onOpenStudioWithTopic && (
                <button
                  onClick={() => onOpenStudioWithTopic('Frontier AI Systems Architecture')}
                  className="mt-4 px-4 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors"
                >
                  Create Manuscript in Content Studio
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No articles match the current filter criteria "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
