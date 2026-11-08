import React, { useState } from 'react';
import { ArrowRight, Check, Send } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
              TechPilot AI
            </span>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Independent technology publication and client-side developer platform. Focused on verifiable systems engineering, silicon hardware disclosures, and autonomous agent topologies.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Human-in-the-loop review · Zero automatic publishing.
            </div>
          </div>

          {/* Platform Nav Links */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
              Platform
            </span>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Technical Blog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Free Developer Tools
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('studio')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Content Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('research')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Research Lab
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('approvals')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Editorial Approval
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
              About & Governance
            </span>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  About TechPilot AI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Contact Us & Editorial Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Newsletter */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider block">
              Weekly Tech Briefing
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sunday morning digest of verified hardware disclosures and systems papers.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Subscribed! Check your inbox this Sunday.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-slate-900 dark:bg-cyan-600 text-white text-xs font-medium rounded-md hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors flex items-center gap-1"
                  >
                    <span>Join</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} TechPilot AI. Independent Frontier Technology Publishing.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={() => onNavigate('privacy')} className="hover:underline">Privacy Policy</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('terms')} className="hover:underline">Terms of Service</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('about')} className="hover:underline">About</button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('contact')} className="hover:underline">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
