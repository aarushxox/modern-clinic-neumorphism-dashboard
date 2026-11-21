import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Pill,
  BarChart3,
  Calendar,
  ChevronDown,
  FileCheck2,
  BookOpen,
  Activity,
  Database,
  Settings,
  HelpCircle,
  Command,
} from 'lucide-react';
import { ActiveModule } from '../types/clinic';

interface HorizontalNavProps {
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
}

export const HorizontalNav: React.FC<HorizontalNavProps> = ({
  activeModule,
  onNavigate,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const primaryItems: { id: ActiveModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'today', label: "Today's Clinic", icon: CalendarDays },
    { id: 'search', label: 'Patients', icon: Users },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
  ];

  const moreItems: { id: ActiveModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'shortcuts', label: 'Rx Shortcuts', icon: Command },
    { id: 'certificates', label: 'Certificates', icon: FileCheck2 },
    { id: 'cashbook', label: 'Cashbook Journal', icon: BookOpen },
    { id: 'data-health', label: 'Data Health', icon: Activity },
    { id: 'data-explorer', label: 'Data Explorer', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About Clinic', icon: HelpCircle },
  ];

  const isMoreActive = moreItems.some((m) => m.id === activeModule);

  return (
    <nav className="px-4 sm:px-7 pb-2 flex items-center justify-between gap-3 z-20">
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              id={`horiz-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              style={
                isActive
                  ? {
                      background: 'var(--nav-active-bg)',
                      color: 'var(--nav-active-text)',
                      boxShadow: 'var(--nav-active-shadow)',
                    }
                  : undefined
              }
              className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'font-semibold'
                  : 'neu-pill-btn text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-[var(--nav-active-icon)]' : 'text-[var(--text-muted)]'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="relative" ref={dropdownRef}>
          <button
            id="horiz-nav-more-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreOpen((prev) => !prev);
            }}
            style={
              isMoreActive
                ? {
                    background: 'var(--nav-active-bg)',
                    color: 'var(--nav-active-text)',
                  }
                : undefined
            }
            className="neu-pill-btn flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            <span>More</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMoreOpen && (
            <div
              id="horiz-nav-more-dropdown"
              className="absolute left-0 top-full mt-2 w-52 neu-card rounded-2xl p-1.5 z-50 text-xs"
            >
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    id={`horiz-more-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMoreOpen(false);
                    }}
                    style={
                      isActive
                        ? {
                            background: 'var(--nav-active-bg)',
                            color: 'var(--nav-active-text)',
                          }
                        : undefined
                    }
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover-bg)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
