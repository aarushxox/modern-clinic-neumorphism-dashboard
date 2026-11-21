import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Pill,
  Command,
  FileCheck2,
  BookOpen,
  BarChart3,
  Calendar,
  Activity,
  Database,
  Settings,
  HelpCircle,
  HeartPulse,
  Palette,
  Sliders,
  Check,
  X,
  PanelLeftClose,
  ArrowUpRight,
} from 'lucide-react';
import { ActiveModule, ClinicSettings } from '../types/clinic';
import { Tooltip } from './Tooltip';

interface SidebarProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
  mode: 'expanded' | 'icon-rail' | 'hidden';
  hoverExpansion: boolean;
  onCloseSidebar?: () => void;
  onToggleOrientation?: (orientation: 'vertical' | 'horizontal') => void;
  sidebarAppearance?: 'follow-theme' | 'force-light' | 'force-dark';
  settings?: ClinicSettings;
  isMobile?: boolean;
  isMobileOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: string;
  shortcut?: string;
}

const WORKSPACE_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, shortcut: 'Ctrl+D' },
  { id: 'today', label: "Today's Clinic", icon: CalendarDays, count: '22', shortcut: 'Ctrl+T' },
  { id: 'search', label: 'Patients', icon: Users, count: '43.4k', shortcut: 'Ctrl+S' },
  { id: 'calendar', label: 'Schedule', icon: Calendar },
  { id: 'medicines', label: 'Medicines', icon: Pill, count: '73', shortcut: 'Ctrl+M' },
  { id: 'shortcuts', label: 'Rx Shortcuts', icon: Command, count: '357', shortcut: 'Ctrl+K' },
];

const LEDGER_ITEMS: NavItem[] = [
  { id: 'certificates', label: 'Certificates', icon: FileCheck2, count: '2.7k', shortcut: 'Alt+C' },
  { id: 'cashbook', label: 'Cashbook', icon: BookOpen, count: '6.6k', shortcut: 'Alt+J' },
  { id: 'reports', label: 'Analytics', icon: BarChart3, count: '26', shortcut: 'Alt+R' },
];

const SYSTEM_ITEMS: NavItem[] = [
  { id: 'data-health', label: 'Data Health', icon: Activity, shortcut: 'Alt+H' },
  { id: 'data-explorer', label: 'Data Explorer', icon: Database, count: '22', shortcut: 'Alt+E' },
  { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'Alt+P' },
  { id: 'about', label: 'About Clinic', icon: HelpCircle, shortcut: '?' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onNavigate,
  mode,
  hoverExpansion,
  onCloseSidebar,
  onToggleOrientation,
  sidebarAppearance = 'follow-theme',
  settings,
  isMobile = false,
  isMobileOpen = false,
  onCloseMobileMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseBtnHovered, setIsCloseBtnHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        if (isMobile && isMobileOpen && onCloseMobileMenu) {
          onCloseMobileMenu();
        }
      }
    };

    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, isMobile, isMobileOpen, onCloseMobileMenu]);

  const isHidden = isMobile ? !isMobileOpen : mode === 'hidden';
  const isEffectivelyExpanded = isMobile
    ? true
    : mode === 'expanded' || (mode === 'icon-rail' && hoverExpansion && isHovered);

  const handleNavClick = (mod: ActiveModule) => {
    onNavigate(mod);
    if (isMobile && onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const handleCloseAction = () => {
    setIsCloseBtnHovered(false);
    if (isMobile && onCloseMobileMenu) {
      onCloseMobileMenu();
      return;
    }
    if (onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  let appearanceStyle: React.CSSProperties | undefined;
  let appearanceExtraClass = '';
  if (sidebarAppearance === 'force-dark') {
    appearanceStyle = {
      background: 'linear-gradient(180deg, #0e1014 0%, #101217 100%)',
      borderRightColor: '#252833',
    };
    appearanceExtraClass = 'text-[#eceef2]';
  } else if (sidebarAppearance === 'force-light') {
    appearanceStyle = {
      background: 'linear-gradient(180deg, #eaeef3 0%, #e4e9f0 100%)',
      borderRightColor: '#d7dfe8',
    };
    appearanceExtraClass = 'text-[#242733]';
  }

  const renderNavGroup = (heading: string, items: NavItem[], showDividerTop = false) => (
    <div className="flex flex-col gap-1">
      {showDividerTop && !isEffectivelyExpanded && (
        <div className="w-7 h-px bg-[var(--sidebar-border)] mx-auto my-1.5" />
      )}
      <div
        className={`px-3 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--text-muted)] whitespace-nowrap overflow-hidden sidebar-label-fade ${
          isEffectivelyExpanded ? 'opacity-85 max-h-7' : 'opacity-0 max-h-0 py-0'
        }`}
      >
        {heading}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.id;

        const btn = (
          <button
            id={`sidebar-nav-${item.id}`}
            type="button"
            onClick={() => handleNavClick(item.id)}
            style={
              isActive
                ? {
                    background: 'var(--nav-active-bg)',
                    color: 'var(--nav-active-text)',
                    boxShadow: 'var(--nav-active-shadow)',
                  }
                : undefined
            }
            className={`flex items-center rounded-full transition-all duration-200 ease-out cursor-pointer touch-manipulation active:scale-[0.98] ${
              isEffectivelyExpanded
                ? isMobile
                  ? 'w-full min-h-[44px] px-4 gap-3 justify-start'
                  : 'w-full h-[38px] px-3.5 gap-2.5 justify-start'
                : 'w-11 h-11 mx-auto justify-center shrink-0'
            } ${
              isActive
                ? 'font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--text-primary)] font-medium'
            }`}
          >
            <Icon
              className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                isActive ? 'text-[var(--nav-active-icon)]' : 'text-[var(--text-muted)]'
              }`}
            />

            {isEffectivelyExpanded && (
              <div className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap min-w-0">
                <span className={`${isMobile ? 'text-[13.5px]' : 'text-[12.5px]'} truncate`}>
                  {item.label}
                </span>
                {item.count && (
                  <span className="text-[10.5px] font-mono tabular-nums text-[var(--text-muted)] ml-2 shrink-0">
                    {item.count}
                  </span>
                )}
              </div>
            )}
          </button>
        );

        if (!isMobile && !isEffectivelyExpanded && !isHidden) {
          return (
            <div key={item.id} className="w-full flex justify-center">
              <Tooltip
                position="right"
                content={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
              >
                {btn}
              </Tooltip>
            </div>
          );
        }

        return (
          <div key={item.id} className="w-full">
            {btn}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Scrim: blocks all clicks/taps on background content while drawer is open */}
      {isMobile && (
        <div
          id="mobile-sidebar-backdrop"
          aria-hidden={!isMobileOpen}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onCloseMobileMenu) onCloseMobileMenu();
          }}
          className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] touch-none transition-opacity duration-250 ease-out ${
            isMobileOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        />
      )}

      <aside
        id="app-primary-sidebar"
        ref={sidebarRef}
        role={isMobile ? 'dialog' : undefined}
        aria-modal={isMobile && isMobileOpen ? true : undefined}
        aria-label="Primary navigation menu"
        onMouseEnter={() => {
          if (!isMobile && mode === 'icon-rail' && hoverExpansion) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isMobile && mode === 'icon-rail' && hoverExpansion) setIsHovered(false);
        }}
        onClick={(e) => {
          if (isMobile) e.stopPropagation();
        }}
        onContextMenu={handleContextMenu}
        style={appearanceStyle}
        aria-hidden={isHidden}
        className={`sidebar-shell shrink-0 flex flex-col justify-between select-none ${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 h-[100dvh] w-[280px] max-w-[85vw] shadow-2xl overflow-hidden overscroll-contain touch-pan-y ${
                isMobileOpen
                  ? 'translate-x-0 opacity-100 pointer-events-auto'
                  : '-translate-x-full opacity-0 pointer-events-none'
              }`
            : `h-screen z-20 ${
                isEffectivelyExpanded ? 'overflow-hidden' : 'overflow-visible'
              } ${
                isHidden
                  ? 'w-0 opacity-0 -translate-x-4 border-r-0 pointer-events-none overflow-hidden'
                  : isEffectivelyExpanded
                  ? 'w-[232px] opacity-100 translate-x-0'
                  : 'w-[72px] opacity-100 translate-x-0'
              }`
        } ${appearanceExtraClass}`}
      >
        {/* Top Brand Area */}
        <div
          className={`pt-5 pb-4 flex items-center justify-between transition-all duration-300 ${
            isEffectivelyExpanded ? 'px-4' : 'px-0 justify-center'
          }`}
        >
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 overflow-hidden text-left cursor-pointer group touch-manipulation min-h-[44px]"
          >
            {settings?.logoDataUrl ? (
              <img
                src={settings.logoDataUrl}
                alt="Clinic Logo"
                className="w-9 h-9 rounded-[12px] object-contain bg-[var(--surface-elevated)] p-1 shadow-[var(--neu-raised-sm)] shrink-0"
              />
            ) : (
              <span
                className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-[1.03]"
                style={{
                  background: 'var(--surface-elevated)',
                  color: 'var(--accent-primary)',
                  boxShadow: 'var(--neu-raised-sm)',
                }}
              >
                <HeartPulse className="w-[18px] h-[18px]" />
              </span>
            )}

            {isEffectivelyExpanded && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="text-[17px] font-bold tracking-tight leading-none text-[var(--text-primary)]">
                  johnson<span style={{ color: 'var(--accent-primary)' }}>.</span>
                </div>
                <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[var(--text-muted)] mt-1">
                  Clinical Suite
                </div>
              </div>
            )}
          </button>

          {(onCloseSidebar || (isMobile && onCloseMobileMenu)) && isEffectivelyExpanded && (
            <button
              id="sidebar-close-btn"
              type="button"
              onClick={handleCloseAction}
              onMouseEnter={() => setIsCloseBtnHovered(true)}
              onMouseLeave={() => setIsCloseBtnHovered(false)}
              onFocus={() => setIsCloseBtnHovered(true)}
              onBlur={() => setIsCloseBtnHovered(false)}
              style={
                isMobile || isCloseBtnHovered
                  ? {
                      background: 'var(--pastel-rose-bg)',
                      color: '#e11d48',
                      borderColor: 'var(--pastel-rose-border)',
                    }
                  : {
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border)',
                    }
              }
              className={`${
                isMobile ? 'min-w-[44px] min-h-[44px] w-11 h-11' : 'w-8 h-8'
              } rounded-full border shadow-[var(--neu-raised-sm)] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer touch-manipulation shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]`}
              title={isMobile ? 'Close Navigation Menu' : 'Collapse Side Menu'}
              aria-label={isMobile ? 'Close Navigation Menu' : 'Collapse Side Menu'}
            >
              {isMobile || isCloseBtnHovered ? (
                <X className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} stroke-[2.4] transition-transform duration-150`} />
              ) : (
                <PanelLeftClose className="w-4 h-4 stroke-[2.1] transition-transform duration-150" />
              )}
            </button>
          )}
        </div>

        {/* Clean Vertical Navigation Groups (Zero Horizontal Icon Collision) */}
        <nav
          className={`flex-1 flex flex-col gap-2.5 pb-2 overscroll-contain ${
            isEffectivelyExpanded
              ? 'overflow-y-auto px-3'
              : 'overflow-y-auto overflow-x-hidden px-1.5 items-center'
          }`}
        >
          {renderNavGroup('Workspace', WORKSPACE_ITEMS, false)}
          {renderNavGroup('Clinical Ledger', LEDGER_ITEMS, true)}
          {renderNavGroup('System', SYSTEM_ITEMS, true)}
        </nav>

        {/* Bottom Doctor Profile & Archive Card */}
        <div className={`pb-3.5 pt-2 space-y-2.5 ${isEffectivelyExpanded ? 'px-3' : 'px-1.5'}`}>
          {isEffectivelyExpanded && (
            <div
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--neu-raised-sm)',
              }}
              className="rounded-[20px] border p-3.5"
            >
              <div
                className="text-[9.5px] font-bold tracking-[0.1em] uppercase"
                style={{ color: 'var(--accent-primary)' }}
              >
                27-Year Archive
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                158,361 encounters across 43,488 patient profiles.
              </p>
              <button
                type="button"
                onClick={() => handleNavClick('reports')}
                className="mt-2 text-[11px] font-bold hover:underline cursor-pointer inline-flex items-center gap-1 touch-manipulation min-h-[32px]"
                style={{ color: 'var(--accent-text)' }}
              >
                <span>Open analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center rounded-xl py-1.5 transition-colors hover:bg-[var(--nav-hover-bg)] text-left cursor-pointer touch-manipulation ${
              isMobile ? 'min-h-[48px]' : ''
            } ${
              isEffectivelyExpanded ? 'px-2 gap-2.5 justify-start' : 'px-0 justify-center'
            }`}
            title="Clinic Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e3dbe8] to-[#d2e3e4] dark:from-[#32303c] dark:to-[#283436] text-[#4c4b5c] dark:text-[#e4e2ec] font-bold text-[11px] flex items-center justify-center shrink-0 border border-white/80 dark:border-white/10">
              {((settings?.doctorName || 'Dr. Marcus Johnson')
                .replace(/^Dr\.?\s*/i, '')
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map((p) => p[0])
                .slice(0, 2)
                .join('') || 'MJ'
              ).toUpperCase()}
            </div>
            {isEffectivelyExpanded && (
              <div className="overflow-hidden whitespace-nowrap min-w-0">
                <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {settings?.doctorName || 'Dr. Marcus Johnson'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                  {settings?.regNumber || 'GMC-1998-4421'}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Right-Click Sidebar Context Menu */}
      {contextMenu && (
        <div
          id="sidebar-context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 min-w-[205px] neu-card rounded-2xl p-1.5 text-xs text-[var(--text-primary)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Navigation Layout
          </div>

          <button
            id="ctx-nav-vertical"
            onClick={() => {
              if (onToggleOrientation) onToggleOrientation('vertical');
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[var(--surface-muted)] text-left cursor-pointer"
          >
            <span>Vertical Sidebar</span>
            <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          </button>

          <button
            id="ctx-nav-horizontal"
            onClick={() => {
              if (onToggleOrientation) onToggleOrientation('horizontal');
              setContextMenu(null);
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-[var(--surface-muted)] text-left cursor-pointer"
          >
            <span>Horizontal Top Bar</span>
          </button>

          <div className="my-1 border-t border-[var(--border)]" />

          <button
            id="ctx-nav-appearance"
            onClick={() => {
              onNavigate('settings');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[var(--surface-muted)] text-left cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Change Color Theme</span>
          </button>

          <button
            id="ctx-nav-sidebar-settings"
            onClick={() => {
              onNavigate('settings');
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[var(--surface-muted)] text-left cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--pastel-blue-fg)]" />
            <span>Side Menu Preferences</span>
          </button>
        </div>
      )}
    </>
  );
};
