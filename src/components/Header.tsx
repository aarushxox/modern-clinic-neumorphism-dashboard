import React, { useState } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Calendar,
  Printer,
  Sun,
  Moon,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { ActiveModule, ClinicSettings } from '../types/clinic';

interface HeaderProps {
  activeModule: ActiveModule;
  moduleTitle?: string;
  onNavigate: (module: ActiveModule) => void;
  onOpenDemoGuide: () => void;
  onToggleSidebar: () => void;
  onQuickSearch: (query?: string) => void;
  onToggleQuickDarkMode?: () => void;
  clinicDate?: string;
  settings?: ClinicSettings;
  sidebarMode?: 'expanded' | 'icon-rail' | 'hidden';
}

export const Header: React.FC<HeaderProps> = ({
  moduleTitle = 'Overview',
  onNavigate,
  onOpenDemoGuide,
  onToggleSidebar,
  onQuickSearch,
  onToggleQuickDarkMode,
  clinicDate = '2026-08-12',
  settings,
  sidebarMode = 'expanded',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isDarkTheme =
    settings?.theme === 'night-galaxy' || settings?.theme === 'midnight-clinical';

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(clinicDate + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Aug 12, 2026';
    }
  }, [clinicDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(searchTerm.trim());
  };

  const handlePrintView = () => {
    window.print();
  };

  return (
    <header className="h-[62px] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 select-none z-30 border-b border-[var(--border-subtle)]/70">
      {/* Left: Smooth Sidebar Toggle + Editorial Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="header-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="neu-pill-btn w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
          title={sidebarMode === 'expanded' ? 'Collapse Side Menu' : 'Expand Side Menu'}
          aria-label="Toggle Sidebar Navigation"
        >
          {sidebarMode === 'expanded' ? (
            <PanelLeftClose className="w-[17px] h-[17px]" />
          ) : (
            <PanelLeftOpen className="w-[17px] h-[17px]" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap min-w-0">
          <span className="hidden md:inline">Workspace</span>
          <span className="hidden md:inline" aria-hidden="true">/</span>
          <strong className="font-semibold text-[var(--text-primary)] truncate">
            {moduleTitle}
          </strong>
        </div>
      </div>

      {/* Right: Search, Global Print Current View, Theme, Calendar, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <form onSubmit={handleSearchSubmit} className="relative w-40 sm:w-52 lg:w-64">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="header-quick-search-input"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients, #serial..."
            className="w-full h-9 pl-9 pr-3.5 rounded-full text-xs bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--neu-raised-sm)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </form>

        {/* Global Print Current View Button */}
        <button
          id="header-print-view-btn"
          onClick={handlePrintView}
          className="neu-pill-btn h-9 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          title="Print Current View"
          aria-label="Print Current View"
        >
          <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
          <span className="hidden xl:inline">Print Current View</span>
          <span className="hidden sm:inline xl:hidden">Print</span>
        </button>

        <button
          id="header-calendar-btn"
          onClick={() => onNavigate('calendar')}
          className="neu-pill-btn hidden lg:flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          title="Open Clinic Calendar"
        >
          <Calendar className="w-3.5 h-3.5 text-[var(--pastel-sage-fg)]" />
          <span className="tabular-nums">{formattedDate}</span>
        </button>

        {onToggleQuickDarkMode && (
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleQuickDarkMode}
            className="neu-pill-btn w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
            title={isDarkTheme ? 'Switch to Soft Light Mode' : 'Switch to Calm Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {isDarkTheme ? (
              <Sun className="w-4 h-4 text-[var(--pastel-sand-fg)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--pastel-lilac-fg)]" />
            )}
          </button>
        )}

        <button
          id="header-demo-guide-btn"
          onClick={onOpenDemoGuide}
          className="neu-pill-btn hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
          title="Walkthrough & Keyboard Shortcuts (?)"
          aria-label="Open Walkthrough Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          id="header-profile-btn"
          onClick={() => onNavigate('settings')}
          className="neu-pill-btn h-9 pl-1 pr-2.5 rounded-full flex items-center gap-1.5 shrink-0 cursor-pointer"
          title="Doctor Profile & Settings"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e3dbe8] to-[#d2e3e4] dark:from-[#32303c] dark:to-[#283436] text-[#4c4b5c] dark:text-[#e4e2ec] text-[11px] font-bold flex items-center justify-center border border-white/80 dark:border-white/10">
            JP
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </button>
      </div>
    </header>
  );
};
