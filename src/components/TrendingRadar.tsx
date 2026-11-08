import React from 'react';
import { Cpu, Network, Bot, Shield, Zap, ChevronRight, Activity } from 'lucide-react';

interface TrendingRadarProps {
  onSelectTopic: (topic: string) => void;
}

export const TrendingRadar: React.FC<TrendingRadarProps> = ({ onSelectTopic }) => {
  const trends = [
    {
      title: 'Silicon Photonics & CPO',
      category: 'Hardware & Compute',
      description: 'Optical interconnects breaking the GPU memory wall with sub-2pJ/bit transmission energy.',
      metric: 'Sub-2pJ/bit',
      status: 'Standards & Foundry Pilots',
    },
    {
      title: 'Deterministic Multi-Agent Graphs',
      category: 'Generative AI',
      description: 'Replacing unconstrained ReAct loops with structured DAGs and persistent checkpoint states.',
      metric: 'DAG Graph Flow',
      status: 'Open Source Frameworks',
    },
    {
      title: '1 kHz Tactile Embodied Robotics',
      category: 'Robotics',
      description: 'Sub-millisecond force feedback arrays unlocking human-level dexterous manipulation.',
      metric: '1000 Hz Loop',
      status: 'Research Lab Testing',
    },
    {
      title: 'Lossless Speculative Decoding',
      category: 'Inference Infrastructure',
      description: 'Dual draft-target model verification reducing autoregressive latency while preserving mathematical distribution.',
      metric: 'Zero Loss Drift',
      status: 'Inference Engines',
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>Frontier Architecture Radar</span>
            <span aria-hidden="true">·</span>
            <span>Current Technology Shifts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
            Emerging Tech & AI Signals
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trends.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectTopic(item.title)}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-medium text-cyan-600 dark:text-cyan-400">{item.category}</span>
                <span className="font-mono text-[11px] text-slate-400">{item.metric}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors font-heading">
                {item.title}
              </h3>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {item.status}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
