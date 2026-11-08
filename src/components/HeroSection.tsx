import React from 'react';
import { ArrowRight, Sparkles, Terminal, BookOpen, Cpu, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onOpenBlog: () => void;
  onOpenTools: () => void;
  onOpenStudio: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBlog,
  onOpenTools,
  onOpenStudio,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:pt-12 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Grid: Value Proposition + Cinematic Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Frontier Technology & AI Publishing</span>
              <span aria-hidden="true">·</span>
              <span>Independent Systems & Architecture Analysis</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading leading-tight" style={{ textWrap: 'balance' }}>
              Architecting the Future of Artificial Intelligence & Compute
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              TechPilot AI delivers in-depth engineering breakdowns of silicon photonics, autonomous agent topologies, and embodied robotics. Powered by an integrated AI Content Studio and an Editor-in-Chief review pipeline.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenBlog}
                className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-cyan-600 rounded-xl hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
              >
                <span>Explore Technical Blog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenTools}
                className="px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
              >
                <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Free Online Developer Tools</span>
              </button>

              <button
                onClick={onOpenStudio}
                className="px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Open Content Studio</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
              <img
                src="/src/assets/images/hero_techpilot_ai_1793517434398.jpg"
                alt="TechPilot AI Research Laboratory"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                  Inside TechPilot Systems Lab
                </span>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  Continuous evaluation of hardware interconnects, multi-agent coordination, and frontier models.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Verified Platform Metrics Strip */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Platform Deployment</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              Live Preview
            </div>
            <span className="text-[11px] text-slate-400">Frontend Release</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Curated Articles</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              4 Published · 3 Queued
            </div>
            <span className="text-[11px] text-slate-400">Human-vetted</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Human Editorial Check</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              100% Required
            </div>
            <span className="text-[11px] text-slate-400">No Auto-Publishing</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Free Interactive Tools</span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              6 Built-In
            </div>
            <span className="text-[11px] text-slate-400">100% Client-Side</span>
          </div>
        </div>
      </div>
    </section>
  );
};
