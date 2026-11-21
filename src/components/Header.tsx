import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Menu,
  X,
  Search,
  Calendar,
  Printer,
  Sun,
  Moon,
  HelpCircle,
  ChevronDown,
  Bell,
  AlertTriangle,
  Clock,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ActiveModule, ClinicSettings, PatientRecord } from '../types/clinic';
import { ClinicDataProvider } from '../services/dataProvider';

interface HeaderProps {
  activeModule: ActiveModule;
  moduleTitle?: string;
  onNavigate: (module: ActiveModule) => void;
  onSelectPatient?: (patient: PatientRecord) => void;
  onOpenDemoGuide: () => void;
  onToggleSidebar: () => void;
  onQuickSearch: (query?: string) => void;
  onToggleQuickDarkMode?: () => void;
  clinicDate?: string;
  settings?: ClinicSettings;
  sidebarMode?: 'expanded' | 'icon-rail' | 'hidden';
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  moduleTitle = 'Overview',
  onNavigate,
  onSelectPatient,
  onOpenDemoGuide,
  onToggleSidebar,
  onQuickSearch,
  onToggleQuickDarkMode,
  clinicDate = '2026-08-12',
  settings,
  sidebarMode = 'expanded',
  isMobile = false,
  isMobileMenuOpen = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const isDarkTheme =
    settings?.theme === 'night-galaxy' || settings?.theme === 'midnight-clinical';

  const allReminders = useMemo(
    () => ClinicDataProvider.getClinicalReminders(clinicDate),
    [clinicDate]
  );

  const activeReminders = useMemo(
    () => allReminders.filter((r) => !dismissedReminderIds.includes(r.id)),
    [allReminders, dismissedReminderIds]
  );

  useEffect(() => {
    setActiveBannerIdx(0);
    setIsBannerDismissed(false);
  }, [clinicDate]);

  useEffect(() => {
    if (activeBannerIdx >= activeReminders.length && activeReminders.length > 0) {
      setActiveBannerIdx(0);
    }
  }, [activeBannerIdx, activeReminders.length]);

  useEffect(() => {
    if (!isRemindersOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setIsRemindersOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsRemindersOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isRemindersOpen]);

  useEffect(() => {
    if (isMobileMenuOpen && isRemindersOpen) {
      setIsRemindersOpen(false);
    }
  }, [isMobileMenuOpen, isRemindersOpen]);

  const formattedDate = useMemo(() => {
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

  const handleReminderAction = (reminder: (typeof allReminders)[number]) => {
    setIsRemindersOpen(false);
    if (reminder.patientSno && onSelectPatient) {
      const patient = ClinicDataProvider.getPatient(reminder.patientSno);
      if (patient) {
        onSelectPatient(patient);
        return;
      }
    }
    onNavigate(reminder.targetModule);
  };

  const handleDismissReminder = (id: string) => {
    setDismissedReminderIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMarkAllReviewed = () => {
    setDismissedReminderIds(allReminders.map((r) => r.id));
    setIsBannerDismissed(true);
  };

  const handleRestoreReminders = () => {
    setDismissedReminderIds([]);
    setIsBannerDismissed(false);
    setActiveBannerIdx(0);
  };

  const isMenuOpen = isMobile ? Boolean(isMobileMenuOpen) : sidebarMode === 'expanded';

  const doctorInitials = useMemo(() => {
    const name = (settings?.doctorName || 'Dr. Marcus Johnson')
      .replace(/^Dr\.?\s*/i, '')
      .trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (parts[0]?.slice(0, 2) || 'MJ').toUpperCase();
  }, [settings?.doctorName]);

  const currentBannerReminder = activeReminders[activeBannerIdx] || activeReminders[0] || null;

  const getSeverityStyles = (severity: 'critical' | 'urgent' | 'upcoming') => {
    if (severity === 'critical') {
      return {
        bg: 'var(--pastel-rose-bg)',
        fg: 'var(--pastel-rose-fg)',
        border: 'var(--pastel-rose-border)',
        label: 'Critical',
      };
    }
    if (severity === 'urgent') {
      return {
        bg: 'var(--pastel-sand-bg)',
        fg: 'var(--pastel-sand-fg)',
        border: 'var(--pastel-sand-border)',
        label: 'Urgent',
      };
    }
    return {
      bg: 'var(--pastel-lilac-bg)',
      fg: 'var(--pastel-lilac-fg)',
      border: 'var(--pastel-lilac-border)',
      label: 'Schedule',
    };
  };

  return (
    <div className="shrink-0 relative z-30">
      <header className="h-[64px] lg:h-[62px] px-3 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-3 select-none border-b border-[var(--border-subtle)]/70 relative bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        {/* Left: Touch-Optimized 3-Line Hamburger Menu Button <-> Red-Pink X Close Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            id="header-sidebar-toggle-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSidebar();
            }}
            style={
              isMenuOpen
                ? {
                    background: 'var(--pastel-rose-bg)',
                    color: '#e11d48',
                    borderColor: 'var(--pastel-rose-border)',
                    boxShadow: 'var(--neu-raised-sm)',
                  }
                : undefined
            }
            className={`min-w-[44px] min-h-[44px] w-11 h-11 lg:min-w-[40px] lg:min-h-[40px] lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer touch-manipulation select-none transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-1 border ${
              isMenuOpen
                ? 'hover:brightness-95'
                : 'neu-pill-btn text-[var(--text-primary)] hover:text-[var(--accent-primary)]'
            }`}
            title={isMenuOpen ? 'Close Side Menu' : 'Open Side Menu'}
            aria-label={isMenuOpen ? 'Close Side Menu' : 'Open Side Menu'}
            aria-expanded={isMenuOpen}
            aria-controls="app-primary-sidebar"
            aria-haspopup={isMobile ? 'dialog' : undefined}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 lg:w-[18px] lg:h-[18px] stroke-[2.4] transition-transform duration-200 rotate-0" />
            ) : (
              <Menu className="w-5 h-5 lg:w-[18px] lg:h-[18px] stroke-[2.2] transition-transform duration-200" />
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

        {/* Right: Search, Reminders Overlay Trigger, Global Print, Calendar, Theme, Guide, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative w-36 sm:w-48 lg:w-60">
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

          {/* Clinical Reminders Notification Bell & Overlay Popover */}
          <div ref={overlayRef} className="relative">
            <button
              id="header-reminders-btn"
              type="button"
              onClick={() => setIsRemindersOpen((prev) => !prev)}
              className="neu-pill-btn w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer relative"
              title="Clinical Reminders & Schedule Alerts"
              aria-label="Open Clinical Reminders"
              aria-expanded={isRemindersOpen}
            >
              <Bell
                className="w-4 h-4"
                style={{
                  color:
                    activeReminders.length > 0
                      ? 'var(--accent-primary)'
                      : 'var(--text-secondary)',
                }}
              />
              {activeReminders.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9.5px] font-bold font-mono text-white flex items-center justify-center shadow-sm"
                  style={{ background: '#e11d48' }}
                >
                  {activeReminders.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isRemindersOpen && (
                <motion.div
                  id="header-reminders-overlay"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 mt-2.5 w-[min(calc(100vw-1.5rem),395px)] rounded-[22px] bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl overflow-hidden z-40"
                >
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 bg-[var(--surface-muted)]/60">
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span>Clinical Reminders</span>
                        <span className="badge-lilac px-2 py-0.5 text-[10px] font-mono font-bold">
                          {formattedDate}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                        Schedule-synced alerts &amp; pending lab sign-offs
                      </p>
                    </div>
                    {activeReminders.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleMarkAllReviewed}
                        className="text-[10.5px] font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Clear all</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRestoreReminders}
                        className="text-[10.5px] font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer shrink-0"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-[340px] overflow-y-auto p-3 space-y-2">
                    {activeReminders.length === 0 ? (
                      <div className="py-7 px-4 text-center space-y-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          All clinical reminders reviewed
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          No unacknowledged alerts remaining for {formattedDate}.
                        </p>
                        <button
                          type="button"
                          onClick={handleRestoreReminders}
                          className="neu-pill-btn px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore schedule reminders</span>
                        </button>
                      </div>
                    ) : (
                      activeReminders.map((rem) => {
                        const sev = getSeverityStyles(rem.severity);
                        const SevIcon = rem.severity === 'critical' ? AlertTriangle : Clock;
                        return (
                          <div
                            key={rem.id}
                            className="p-3 rounded-[16px] bg-[var(--surface-muted)]/60 hover:bg-[var(--surface-muted)] border border-[var(--border-subtle)] transition-colors space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span
                                  className="w-8 h-8 rounded-full grid place-items-center shrink-0 mt-0.5"
                                  style={{ background: sev.bg, color: sev.fg }}
                                >
                                  <SevIcon className="w-3.5 h-3.5" />
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border"
                                      style={{
                                        background: sev.bg,
                                        color: sev.fg,
                                        borderColor: sev.border,
                                      }}
                                    >
                                      {sev.label}
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                      {rem.timeTag}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-[var(--text-primary)] mt-1 leading-snug">
                                    {rem.headline}
                                  </div>
                                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                                    {rem.detail}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDismissReminder(rem.id)}
                                className="w-6 h-6 rounded-full grid place-items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] shrink-0 cursor-pointer"
                                title="Dismiss reminder"
                                aria-label="Dismiss reminder"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleReminderAction(rem)}
                                className="px-3 py-1 rounded-full text-[10.5px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-90"
                                style={{
                                  background: 'var(--accent-soft)',
                                  color: 'var(--accent-text)',
                                }}
                              >
                                <span>{rem.actionLabel}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {isBannerDismissed && activeReminders.length > 0 && (
                    <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--surface-muted)]/40 flex items-center justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Top alert banner hidden</span>
                      <button
                        type="button"
                        onClick={() => setIsBannerDismissed(false)}
                        className="font-semibold hover:underline cursor-pointer"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        Show banner
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
              {doctorInitials}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
        </div>
      </header>

      {/* Clinical Reminders Notification Banner (Schedule-Synced, Dismissible) */}
      <AnimatePresence initial={false}>
        {!isBannerDismissed && currentBannerReminder && (
          <motion.div
            id="header-clinical-reminder-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="no-print overflow-hidden border-b border-[var(--border-subtle)]"
          >
            {(() => {
              const sev = getSeverityStyles(currentBannerReminder.severity);
              const SevIcon =
                currentBannerReminder.severity === 'critical' ? AlertTriangle : Clock;
              return (
                <div
                  className="px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs"
                  style={{ background: sev.bg }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-6 h-6 rounded-full grid place-items-center shrink-0 bg-[var(--surface-elevated)]"
                      style={{ color: sev.fg }}
                    >
                      <SevIcon className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className="hidden md:inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-[var(--surface-elevated)] shrink-0"
                      style={{ color: sev.fg }}
                    >
                      {sev.label} · {currentBannerReminder.timeTag}
                    </span>
                    <div className="min-w-0 truncate">
                      <strong className="font-bold text-[var(--text-primary)]">
                        {currentBannerReminder.headline}
                      </strong>
                      <span className="hidden sm:inline text-[var(--text-secondary)]">
                        {' '}
                        — {currentBannerReminder.detail}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeReminders.length > 1 && (
                      <div className="hidden sm:flex items-center gap-0.5 bg-[var(--surface-elevated)]/80 rounded-full px-1 py-0.5 border border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveBannerIdx(
                              (prev) => (prev - 1 + activeReminders.length) % activeReminders.length
                            )
                          }
                          className="w-5 h-5 rounded-full grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          aria-label="Previous reminder"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] font-mono font-semibold text-[var(--text-secondary)] px-1">
                          {activeBannerIdx + 1}/{activeReminders.length}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveBannerIdx((prev) => (prev + 1) % activeReminders.length)
                          }
                          className="w-5 h-5 rounded-full grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          aria-label="Next reminder"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReminderAction(currentBannerReminder)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:opacity-90 border border-[var(--border-subtle)] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>{currentBannerReminder.actionLabel}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRemindersOpen(true)}
                      className="hidden lg:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold hover:underline cursor-pointer whitespace-nowrap"
                      style={{ color: sev.fg }}
                    >
                      All alerts ({activeReminders.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBannerDismissed(true)}
                      className="w-6 h-6 rounded-full grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]/70 cursor-pointer"
                      title="Dismiss banner"
                      aria-label="Dismiss reminder banner"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
