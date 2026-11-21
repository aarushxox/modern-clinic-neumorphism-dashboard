import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HorizontalNav } from './components/HorizontalNav';
import { DemoGuideModal } from './components/DemoGuideModal';
import { Footer } from './components/Footer';
import { PageSkeleton } from './components/Skeleton';
import { PatientProfileModal } from './views/PatientProfileModal';
import { DashboardView } from './views/DashboardView';
import { TodayClinicView } from './views/TodayClinicView';
import { CalendarView } from './views/CalendarView';
import { PatientSearchView } from './views/PatientSearchView';
import { MedicinesView } from './views/MedicinesView';
import { ShortcutsView } from './views/ShortcutsView';
import { CertificatesView } from './views/CertificatesView';
import { CashbookView } from './views/CashbookView';
import { ReportsView } from './views/ReportsView';
import { DataHealthView } from './views/DataHealthView';
import { DataExplorerView } from './views/DataExplorerView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { ToastProvider, useToast } from './components/Toast';
import { ActiveModule, PatientRecord, ClinicSettings } from './types/clinic';
import {
  DEFAULT_DAY_START_HOUR,
  DEFAULT_NIGHT_START_HOUR,
  resolveScheduledTheme,
} from './utils/themeSchedule';

const PAGE_SKELETON_MS = 800;

const DEFAULT_SETTINGS: ClinicSettings = {
  doctorName: 'Dr. Marcus Johnson',
  clinicName: 'Dr. Marcus Johnson Clinical Suite',
  clinicAddress: 'Main Avenue, Medical Plaza, Suite 204',
  clinicPhone: '9839000000',
  clinicDegree: 'M.B.B.S., M.D. (Internal Medicine)',
  regNumber: 'GMC-1998-4421',
  sidebarMode: 'icon-rail',
  hoverExpansion: false,
  theme: 'sky-blue',
  navOrientation: 'vertical',
  collapsedBehavior: 'half-close',
  sidebarAppearance: 'follow-theme',
  autoScheduleDarkMode: false,
  autoScheduleDayHour: DEFAULT_DAY_START_HOUR,
  autoScheduleNightHour: DEFAULT_NIGHT_START_HOUR,
};

const MODULE_NAMES: Record<ActiveModule, string> = {
  dashboard: 'Overview',
  today: "Today's Clinic",
  calendar: 'Clinic Schedule',
  search: 'Patients Directory',
  medicines: 'Medicines Master',
  shortcuts: 'Clinical Shortcuts',
  certificates: 'Medical Certificates',
  cashbook: 'Cashbook Journal',
  reports: 'Clinical Analytics',
  'data-health': 'Data Health & Lineage',
  'data-explorer': 'Data Explorer',
  settings: 'Settings',
  about: 'About Clinic',
};

function AppContent() {
  const { showToast } = useToast();
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [sidebarMode, setSidebarMode] = useState<'expanded' | 'icon-rail' | 'hidden'>('icon-rail');
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedClinicDate, setSelectedClinicDate] = useState<string>('2026-08-12');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');
  const [quickAgeCohortFilter, setQuickAgeCohortFilter] = useState<string>('ALL');

  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem('jsp_clinic_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = { ...DEFAULT_SETTINGS, ...parsed };
        if (typeof migrated.doctorName === 'string' && /pandey/i.test(migrated.doctorName)) {
          migrated.doctorName = DEFAULT_SETTINGS.doctorName;
        }
        if (typeof migrated.clinicName === 'string' && /pandey/i.test(migrated.clinicName)) {
          migrated.clinicName = DEFAULT_SETTINGS.clinicName;
        }
        if (migrated.regNumber === 'UPMC-1998-4421') {
          migrated.regNumber = DEFAULT_SETTINGS.regNumber;
        }
        migrated.sidebarMode = migrated.collapsedBehavior === 'full-close' ? 'hidden' : 'icon-rail';
        if (migrated.autoScheduleDarkMode) {
          migrated.theme = resolveScheduledTheme(
            new Date(),
            migrated.autoScheduleDayHour,
            migrated.autoScheduleNightHour
          );
        }
        return migrated;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    const theme = settings.theme || 'sky-blue';
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'night-galaxy' || theme === 'midnight-clinical';
    document.documentElement.classList.toggle('dark', isDark);
  }, [settings.theme]);

  useEffect(() => {
    if (!settings.autoScheduleDarkMode) return;

    const syncThemeWithClock = () => {
      const scheduledTheme = resolveScheduledTheme(
        new Date(),
        settings.autoScheduleDayHour,
        settings.autoScheduleNightHour
      );

      setSettings((prev) => {
        if (!prev.autoScheduleDarkMode || prev.theme === scheduledTheme) {
          return prev;
        }
        const updated: ClinicSettings = {
          ...prev,
          theme: scheduledTheme,
        };
        try {
          localStorage.setItem('jsp_clinic_settings', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to persist auto-scheduled theme', e);
        }
        return updated;
      });
    };

    syncThemeWithClock();
    const intervalId = window.setInterval(syncThemeWithClock, 30_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncThemeWithClock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.autoScheduleDarkMode, settings.autoScheduleDayHour, settings.autoScheduleNightHour]);

  const isFirstSidebarSync = useRef(true);
  useEffect(() => {
    if (isFirstSidebarSync.current) {
      isFirstSidebarSync.current = false;
      return;
    }
    setSidebarMode(settings.sidebarMode);
  }, [settings.sidebarMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const handleViewportChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobileNow = e.matches;
      setIsMobile(mobileNow);
      if (!mobileNow) {
        setIsMobileMenuOpen(false);
      }
    };
    handleViewportChange(mq);
    mq.addEventListener('change', handleViewportChange);
    return () => mq.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (isPatientModalOpen || isDemoGuideOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isPatientModalOpen, isDemoGuideOpen]);

  useEffect(() => {
    setIsPageLoading(true);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const timer = window.setTimeout(() => {
      setIsPageLoading(false);
    }, PAGE_SKELETON_MS);
    return () => window.clearTimeout(timer);
  }, [activeModule]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
      const key = e.key.toLowerCase();

      if (e.key === 'Escape') {
        if (isPatientModalOpen) {
          setIsPatientModalOpen(false);
          return;
        }
        if (isDemoGuideOpen) {
          setIsDemoGuideOpen(false);
          return;
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          return;
        }
      }

      if (isInput && !hasModifier) return;

      let targetModule: ActiveModule | null = null;
      let shortcutLabel = '';

      if (hasModifier) {
        if (key === 'd') {
          targetModule = 'dashboard';
          shortcutLabel = e.altKey ? 'Alt+D' : 'Ctrl+D';
        } else if (key === 's') {
          targetModule = 'search';
          shortcutLabel = e.altKey ? 'Alt+S' : 'Ctrl+S';
        } else if (key === 't') {
          targetModule = 'today';
          shortcutLabel = e.altKey ? 'Alt+T' : 'Ctrl+T';
        } else if (key === 'm') {
          targetModule = 'medicines';
          shortcutLabel = e.altKey ? 'Alt+M' : 'Ctrl+M';
        } else if (key === 'k') {
          targetModule = 'shortcuts';
          shortcutLabel = e.altKey ? 'Alt+K' : 'Ctrl+K';
        } else if (key === 'e') {
          targetModule = 'data-explorer';
          shortcutLabel = e.altKey ? 'Alt+E' : 'Ctrl+E';
        } else if (key === 'h') {
          targetModule = 'data-health';
          shortcutLabel = e.altKey ? 'Alt+H' : 'Ctrl+H';
        } else if (key === 'j') {
          targetModule = 'cashbook';
          shortcutLabel = e.altKey ? 'Alt+J' : 'Ctrl+J';
        } else if (key === 'c' && e.altKey) {
          targetModule = 'certificates';
          shortcutLabel = 'Alt+C';
        } else if (key === 'r' && e.altKey) {
          targetModule = 'reports';
          shortcutLabel = 'Alt+R';
        } else if ((key === 'p' && e.altKey) || (key === ',' && (e.ctrlKey || e.metaKey))) {
          targetModule = 'settings';
          shortcutLabel = e.altKey ? 'Alt+P' : 'Ctrl+,';
        } else if (key === '/' || key === '?') {
          e.preventDefault();
          setIsDemoGuideOpen((prev) => !prev);
          return;
        }
      }

      if (targetModule) {
        e.preventDefault();
        setActiveModule(targetModule);
        showToast(
          `Switched to ${MODULE_NAMES[targetModule]} (${shortcutLabel})`,
          'info',
          'Keyboard Navigation'
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPatientModalOpen, isDemoGuideOpen, isMobileMenuOpen, showToast]);

  const handleUpdateSettings = (newSettings: ClinicSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('jsp_clinic_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem('jsp_clinic_settings');
    } catch (e) {
      console.error('Failed to clear settings from localStorage', e);
    }
  };

  const handleSelectPatient = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen((prev) => !prev);
      return;
    }
    if (settings.navOrientation === 'horizontal') {
      handleUpdateSettings({ ...settings, navOrientation: 'vertical', sidebarMode: 'expanded' });
      return;
    }
    setSidebarMode((prev) => {
      if (prev === 'expanded') {
        return settings.collapsedBehavior === 'full-close' ? 'hidden' : 'icon-rail';
      }
      return 'expanded';
    });
  };

  const handleQuickToggleDarkMode = () => {
    const isDark = settings.theme === 'night-galaxy' || settings.theme === 'midnight-clinical';
    const nextTheme = isDark ? 'sky-blue' : 'midnight-clinical';
    const wasAutoScheduled = Boolean(settings.autoScheduleDarkMode);
    handleUpdateSettings({
      ...settings,
      theme: nextTheme,
      autoScheduleDarkMode: false,
    });
    if (wasAutoScheduled) {
      showToast(
        `Switched manually to ${nextTheme}. Auto-Schedule Dark Mode paused.`,
        'info',
        'Manual Theme Override'
      );
    }
  };

  const handleQuickSearch = (query?: string) => {
    if (typeof query === 'string') {
      setQuickSearchQuery(query);
    }
    setQuickAgeCohortFilter('ALL');
    setActiveModule('search');
  };

  const handleFilterDirectoryByAge = (bracket: string) => {
    setQuickSearchQuery('');
    setQuickAgeCohortFilter(bracket);
    setActiveModule('search');
    showToast(
      `Filtered Patients Directory to age cohort ${bracket} yrs.`,
      'info',
      'Age Cohort Filter Applied'
    );
  };

  const handleNavigateToClinicDay = (dateStr: string) => {
    setSelectedClinicDate(dateStr);
    setActiveModule('today');
  };

  const isMobileOverlayActive = isMobile && isMobileMenuOpen;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden transition-colors duration-200">
      {/* Smooth Collapsible Sidebar (desktop inline, mobile touch-optimized slide-over overlay) */}
      {(settings.navOrientation !== 'horizontal' || isMobile) && (
        <Sidebar
          activeModule={activeModule}
          onNavigate={(mod) => {
            setActiveModule(mod);
            if (isMobile) setIsMobileMenuOpen(false);
          }}
          mode={sidebarMode}
          hoverExpansion={settings.hoverExpansion}
          onCloseSidebar={handleToggleSidebar}
          onToggleOrientation={(orientation) =>
            handleUpdateSettings({ ...settings, navOrientation: orientation })
          }
          sidebarAppearance={settings.sidebarAppearance}
          settings={settings}
          isMobile={isMobile}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Column (isolated from pointer/touch clicks while mobile drawer is open) */}
      <div
        aria-hidden={isMobileOverlayActive || undefined}
        className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden ${
          isMobileOverlayActive ? 'pointer-events-none select-none' : ''
        }`}
      >
        <Header
          activeModule={activeModule}
          moduleTitle={MODULE_NAMES[activeModule]}
          onNavigate={(mod) => setActiveModule(mod)}
          onSelectPatient={handleSelectPatient}
          onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          onQuickSearch={handleQuickSearch}
          onToggleQuickDarkMode={handleQuickToggleDarkMode}
          clinicDate={selectedClinicDate}
          settings={settings}
          sidebarMode={sidebarMode}
          isMobile={isMobile}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {settings.navOrientation === 'horizontal' && !isMobile && (
          <HorizontalNav
            activeModule={activeModule}
            onNavigate={(mod) => setActiveModule(mod)}
          />
        )}

        <main
          ref={mainScrollRef}
          className={`flex-1 smooth-scroll-region px-4 sm:px-7 pb-10 pt-2 ${
            isMobileOverlayActive ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <div className="max-w-[1440px] mx-auto w-full">
            <AnimatePresence mode="wait" initial={false}>
              {isPageLoading ? (
                <motion.div
                  key={`skeleton-${activeModule}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PageSkeleton module={activeModule} />
                </motion.div>
              ) : (
                <motion.div
                  key={`view-${activeModule}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeModule === 'dashboard' && (
                    <DashboardView
                      onNavigate={(mod) => setActiveModule(mod)}
                      onSelectPatient={handleSelectPatient}
                      onSelectClinicDate={handleNavigateToClinicDay}
                      onFilterDirectoryByAge={handleFilterDirectoryByAge}
                      settings={settings}
                    />
                  )}

                  {activeModule === 'today' && (
                    <TodayClinicView
                      key={selectedClinicDate}
                      initialDate={selectedClinicDate}
                      onSelectPatient={handleSelectPatient}
                    />
                  )}

                  {activeModule === 'calendar' && (
                    <CalendarView onNavigateToClinicDay={handleNavigateToClinicDay} />
                  )}

                  {activeModule === 'search' && (
                    <PatientSearchView
                      key={`${quickSearchQuery}-${quickAgeCohortFilter}`}
                      initialQuery={quickSearchQuery}
                      initialAgeCohort={quickAgeCohortFilter}
                      onSelectPatient={handleSelectPatient}
                      settings={settings}
                    />
                  )}

                  {activeModule === 'medicines' && <MedicinesView />}

                  {activeModule === 'shortcuts' && <ShortcutsView />}

                  {activeModule === 'certificates' && <CertificatesView />}

                  {activeModule === 'cashbook' && <CashbookView />}

                  {activeModule === 'reports' && <ReportsView />}

                  {activeModule === 'data-health' && <DataHealthView />}

                  {activeModule === 'data-explorer' && <DataExplorerView />}

                  {activeModule === 'settings' && (
                    <SettingsView
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                      onResetSettings={handleResetSettings}
                    />
                  )}

                  {activeModule === 'about' && <AboutView />}
                </motion.div>
              )}
            </AnimatePresence>

            <Footer />
          </div>
        </main>
      </div>

      {/* Longitudinal Patient Profile Modal */}
      <PatientProfileModal
        patient={selectedPatient}
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        settings={settings}
      />

      {/* Walkthrough Guide Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={(mod) => setActiveModule(mod)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
