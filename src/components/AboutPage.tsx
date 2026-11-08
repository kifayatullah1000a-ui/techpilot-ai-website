import React from 'react';
import { ShieldCheck, Cpu, Terminal, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { ActiveTab } from '../types';

interface AboutPageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Editorial Transparency</span>
          <span aria-hidden="true">·</span>
          <span>Open Technical Publishing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
          About TechPilot AI
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          TechPilot AI is an independent technical platform dedicated to rigorous systems engineering, silicon hardware disclosures, autonomous multi-agent architectures, and developer productivity tools.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mb-2">
            100% Human Editorial Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We reject the flood of unverified AI slop. While we provide AI research and drafting assistants in our Content Studio, no article is ever automatically published. Every single manuscript must be reviewed and authorized by an editor.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <Terminal className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mb-2">
            Private, Client-Side Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            All six developer utilities (Prompt Architect, Code Analyzer, Jargon Decoder, Readability Estimator, Headline Generator, and SEO Previewer) run entirely in your browser without tracking or storing your proprietary code.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mb-2">
            Verifiable Technical Grounding
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Our deep dives reference documented physical standards (IEEE, JEDEC, HotChips, OCP) and open source implementations. We cite primary sources rather than repeating second-hand marketing claims.
          </p>
        </div>
      </div>

      {/* Editorial Standards Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 mb-16 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
          Our Editorial Code of Conduct
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Zero Fabricated Numbers:</strong> We do not publish simulated visitor counters, unmeasured benchmarks, or speculative revenue claims.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Transparent Peer-Review Labeling:</strong> We only label research as peer-reviewed when published in recognized academic conferences (e.g. IEEE, NeurIPS, RSS). All internal articles are designated as "Editorial Review".
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Author Accountability:</strong> Articles are attributed to our technical desks (Hardware Architecture, Systems Infrastructure, Robotics, and ML Systems) or named contributors who take responsibility for factual correctness.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Reproducible Code:</strong> Code snippets included in our articles must be syntactically valid and accompanied by explicit boundary conditions and complexity trade-offs.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Have questions or want to submit an article?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reach out directly to our editorial team or explore the Content Studio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('contact')}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors"
          >
            Contact Editorial
          </button>
          <button
            onClick={() => onNavigate('blog')}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Read Articles
          </button>
        </div>
      </div>
    </div>
  );
};
