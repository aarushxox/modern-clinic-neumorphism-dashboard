import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HorizontalNav } from './components/HorizontalNav';
import { DemoGuideModal } from './components/DemoGuideModal';
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

const DEFAULT_SETTINGS: ClinicSettings = {
  doctorName: 'Dr. J.S. Pandey',
  clinicName: 'Dr. J.S. Pandey Clinic',
  clinicAddress: 'Main Road, Civil Lines / Indira Nagar, UP',
  clinicPhone: '9839000000',
  clinicDegree: 'M.B.B.S., M.D. (Medicine)',
  regNumber: 'UPMC-1998-4421',
  sidebarMode: 'expanded',
  hoverExpansion: true,
  theme: 'sky-blue',
  navOrientation: 'vertical',
  collapsedBehavior: 'half-close',
  sidebarAppearance: 'follow-theme',
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
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [sidebarMode, setSidebarMode] = useState<'expanded' | 'icon-rail' | 'hidden'>('expanded');
  const [selectedClinicDate, setSelectedClinicDate] = useState<string>('2026-08-12');
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');

  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem('jsp_clinic_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
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
    setSidebarMode(settings.sidebarMode);
  }, [settings.sidebarMode]);

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
  }, [isPatientModalOpen, isDemoGuideOpen, showToast]);

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
    handleUpdateSettings({
      ...settings,
      theme: isDark ? 'sky-blue' : 'midnight-clinical',
    });
  };

  const handleQuickSearch = (query?: string) => {
    if (typeof query === 'string') {
      setQuickSearchQuery(query);
    }
    setActiveModule('search');
  };

  const handleNavigateToClinicDay = (dateStr: string) => {
    setSelectedClinicDate(dateStr);
    setActiveModule('today');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex overflow-hidden transition-colors duration-200">
      {/* Smooth Collapsible Sidebar (always mounted when vertical for silky open/close) */}
      {settings.navOrientation !== 'horizontal' && (
        <Sidebar
          activeModule={activeModule}
          onNavigate={(mod) => setActiveModule(mod)}
          mode={sidebarMode}
          hoverExpansion={settings.hoverExpansion}
          onCloseSidebar={handleToggleSidebar}
          onToggleOrientation={(orientation) =>
            handleUpdateSettings({ ...settings, navOrientation: orientation })
          }
          sidebarAppearance={settings.sidebarAppearance}
          settings={settings}
        />
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          activeModule={activeModule}
          moduleTitle={MODULE_NAMES[activeModule]}
          onNavigate={(mod) => setActiveModule(mod)}
          onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          onQuickSearch={handleQuickSearch}
          onToggleQuickDarkMode={handleQuickToggleDarkMode}
          clinicDate={selectedClinicDate}
          settings={settings}
          sidebarMode={sidebarMode}
        />

        {settings.navOrientation === 'horizontal' && (
          <HorizontalNav
            activeModule={activeModule}
            onNavigate={(mod) => setActiveModule(mod)}
          />
        )}

        <main className="flex-1 overflow-y-auto px-4 sm:px-7 pb-10 pt-2">
          <div className="max-w-[1440px] mx-auto w-full">
            {activeModule === 'dashboard' && (
              <DashboardView
                onNavigate={(mod) => setActiveModule(mod)}
                onSelectPatient={handleSelectPatient}
                onSelectClinicDate={handleNavigateToClinicDay}
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
                key={quickSearchQuery}
                initialQuery={quickSearchQuery}
                onSelectPatient={handleSelectPatient}
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
          </div>
        </main>
      </div>

      {/* Longitudinal Patient Profile Modal */}
      <PatientProfileModal
        patient={selectedPatient}
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
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
