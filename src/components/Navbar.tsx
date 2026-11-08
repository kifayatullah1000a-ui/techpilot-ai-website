import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  FileCheck, 
  Search,
  Plus,
  Lock,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  pendingApprovalsCount: number;
  onNewArticle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  pendingApprovalsCount,
  onNewArticle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin, adminUser, logout, openLoginModal } = useAuth();

  const navLinks: { id: ActiveTab; label: string; badge?: number; adminOnly?: boolean }[] = [
    { id: 'home', label: 'Home' },
    { id: 'tools', label: 'AI Tools' },
    { id: 'blog', label: 'Tech Blog' },
    { id: 'studio', label: 'Content Studio' },
    { id: 'research', label: 'Research & Quality' },
    { id: 'approvals', label: 'Editorial Approval', badge: isAdmin ? pendingApprovalsCount : undefined, adminOnly: true },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single text element wordmark) */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-heading whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          TechPilot AI
        </button>

        {/* Zone 2: Navigation Links (single-line, concise) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                activeTab === link.id
                  ? 'text-slate-900 dark:text-slate-100 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{link.label}</span>
              {link.adminOnly && !isAdmin && (
                <span title="Administrator access required">
                  <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </span>
              )}
              {link.badge !== undefined && link.badge > 0 && (
                <span className="px-1.5 py-0.2 font-mono text-[10px] font-bold bg-amber-500 text-white rounded-full">
                  {link.badge}
                </span>
              )}
              {activeTab === link.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Theme Toggle + Admin State + CTA) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Admin Status & Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <div 
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs"
                title={`Logged in as ${adminUser?.email || 'Administrator'}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">Admin</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-800"
                title="Log Out Administrator"
                aria-label="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
              title="Sign in with Administrator Credentials"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Admin Sign In</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Primary CTA */}
          <button
            onClick={onNewArticle}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Article</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-5 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === link.id
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{link.label}</span>
                {link.adminOnly && !isAdmin && (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span className="px-2 py-0.5 font-mono text-xs font-bold bg-amber-500 text-white rounded-full">
                  {link.badge} pending
                </span>
              )}
            </button>
          ))}

          {/* Mobile Admin Auth State */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {isAdmin ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Administrator Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {adminUser?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 text-rose-600 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-50"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-600" />
                <span>Admin Sign In</span>
              </button>
            )}

            <button
              onClick={() => {
                onNewArticle();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-cyan-600 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Article Draft</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
