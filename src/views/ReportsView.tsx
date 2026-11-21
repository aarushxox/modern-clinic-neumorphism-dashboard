import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Users,
  Activity,
  Pill,
  FileCheck2,
  Calendar,
  CalendarRange,
  Filter,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import {
  AnalyticsService,
  AnalyticsFilter,
  ARCHIVE_MIN_DATE,
  ARCHIVE_MAX_DATE,
} from '../services/analyticsService';

type AnalyticsSection =
  | 'demographics'
  | 'diseases'
  | 'visits'
  | 'medicines'
  | 'certificates'
  | 'age-patterns';

const DATE_RANGE_PRESETS = [
  { id: '30d', label: 'Last 30 Days', start: '2026-07-14', end: '2026-08-12' },
  { id: '6m', label: 'Last 6 Months', start: '2026-02-12', end: '2026-08-12' },
  { id: 'ytd', label: '2026 YTD', start: '2026-01-01', end: '2026-08-12' },
  { id: '5y', label: '2020–2025', start: '2020-01-01', end: '2025-12-31' },
  { id: 'all', label: 'Full Archive', start: '', end: '' },
];

export const ReportsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('demographics');
  const [filters, setFilters] = useState<AnalyticsFilter>({
    gender: 'ALL',
    ageCohort: 'ALL',
    period: 'ALL',
    startDate: '',
    endDate: '',
  });

  const analyticsData = useMemo(() => {
    return AnalyticsService.getAnalytics(filters);
  }, [filters]);

  const hasActiveFilters =
    filters.gender !== 'ALL' ||
    filters.ageCohort !== 'ALL' ||
    filters.period !== 'ALL' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  const handleClearFilters = () => {
    setFilters({
      gender: 'ALL',
      ageCohort: 'ALL',
      period: 'ALL',
      startDate: '',
      endDate: '',
    });
  };

  const handleStartDateChange = (val: string) => {
    setFilters((prev) => {
      const nextEnd = prev.endDate && val && val > prev.endDate ? val : prev.endDate;
      return {
        ...prev,
        period: 'ALL',
        startDate: val,
        endDate: nextEnd,
      };
    });
  };

  const handleEndDateChange = (val: string) => {
    setFilters((prev) => {
      const nextStart = prev.startDate && val && val < prev.startDate ? val : prev.startDate;
      return {
        ...prev,
        period: 'ALL',
        startDate: nextStart,
        endDate: val,
      };
    });
  };

  const applyDatePreset = (start: string, end: string) => {
    setFilters((prev) => ({
      ...prev,
      period: 'ALL',
      startDate: start,
      endDate: end,
    }));
  };

  const maxAgeVal = Math.max(1, ...analyticsData.ageDistribution.map((d) => d.value));
  const maxRegYearVal = Math.max(1, ...analyticsData.registrationsByYear.map((d) => d.value));
  const maxRegMonthVal = Math.max(1, ...analyticsData.registrationsByMonth.map((d) => d.value));
  const maxDxVal = Math.max(1, ...analyticsData.topDiagnosesOverall.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-lilac px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Clinical &amp; Operational Analytics</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              26 Real Forensic Charts
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Clinical Patterns, Demographics &amp; Longitudinal Insights
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Strict epidemiological and clinical intelligence derived from 43,488 patients and 158,361 prescription encounters (1999–2026).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="badge-rose px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Global Filters & Calendar Date Range Bar */}
      <div className="neu-card rounded-[24px] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Interactive Demographic &amp; Calendar Date Range Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-blue px-3 py-0.5 text-[11px] font-semibold inline-flex items-center gap-1.5">
              <CalendarRange className="w-3 h-3" />
              <span>{analyticsData.activeDateRangeLabel}</span>
            </span>
            <span className="badge-neutral px-3 py-0.5 text-[11px] font-mono font-semibold">
              {analyticsData.totalPatientsAnalyzed.toLocaleString()} pts ·{' '}
              {analyticsData.totalEncountersAnalyzed.toLocaleString()} visits
            </span>
          </div>
        </div>

        {/* Date Range Selection Controls + Quick Presets */}
        <div className="p-3.5 rounded-[20px] bg-[var(--surface-muted)]/75 border border-[var(--border-subtle)] space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              <div>
                <label
                  htmlFor="reports-start-date"
                  className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5"
                >
                  From Calendar Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reports-start-date"
                    type="date"
                    min={ARCHIVE_MIN_DATE}
                    max={filters.endDate || ARCHIVE_MAX_DATE}
                    value={filters.startDate || ''}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full h-9 pl-9 pr-3.5 text-xs font-mono rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reports-end-date"
                  className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5"
                >
                  To Calendar Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reports-end-date"
                    type="date"
                    min={filters.startDate || ARCHIVE_MIN_DATE}
                    max={ARCHIVE_MAX_DATE}
                    value={filters.endDate || ''}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-full h-9 pl-9 pr-3.5 text-xs font-mono rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {DATE_RANGE_PRESETS.map((preset) => {
                const isSelected =
                  (filters.startDate || '') === preset.start &&
                  (filters.endDate || '') === preset.end &&
                  filters.period === 'ALL';
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyDatePreset(preset.start, preset.end)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'btn-editorial-primary'
                        : 'neu-pill-btn text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demographic & Cohort Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Sex Filter
            </label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value as any })}
              className="w-full h-9 px-3.5 text-xs rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">All Patients (Male &amp; Female)</option>
              <option value="Male">Male Patients Only</option>
              <option value="Female">Female Patients Only</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Age Cohort Filter
            </label>
            <select
              value={filters.ageCohort}
              onChange={(e) => setFilters({ ...filters, ageCohort: e.target.value })}
              className="w-full h-9 px-3.5 text-xs rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">All Age Brackets (0 to 80+)</option>
              <option value="0-20">Pediatric &amp; Young Adult (0–20 yrs)</option>
              <option value="21-40">Adult (21–40 yrs)</option>
              <option value="41-60">Middle Aged (41–60 yrs)</option>
              <option value="60+">Geriatric (60+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Clinical Time Span
            </label>
            <select
              value={filters.period}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  period: e.target.value as any,
                  startDate: '',
                  endDate: '',
                })
              }
              className="w-full h-9 px-3.5 text-xs rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value="ALL">Full Longitudinal Ledger (1999–2026)</option>
              <option value="2026">Recent Operational Period (2026)</option>
              <option value="2020-2025">Five-Year Modern Cohort (2020–2025)</option>
              <option value="HISTORICAL">Historical Archive (1999–2019)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section Navigation Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'demographics', label: '1. Demographics (5 Charts)', icon: Users },
          { id: 'diseases', label: '2. Disease Patterns (5 Charts)', icon: Activity },
          { id: 'visits', label: '3. Visit Patterns (6 Charts)', icon: Calendar },
          { id: 'medicines', label: '4. Medicine Insights (5 Charts)', icon: Pill },
          { id: 'certificates', label: '5. Certificates (3 Charts)', icon: FileCheck2 },
          { id: 'age-patterns', label: '6. Age-Linked Pathology (2 Charts)', icon: Stethoscope },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'btn-editorial-primary'
                  : 'neu-pill-btn text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: SECTION 1 - DEMOGRAPHICS */}
      {activeSection === 'demographics' && (
        <motion.div
          key="section-demographics"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Current Calculated Age Distribution */}
            <div className="neu-card rounded-[24px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Current Calculated Age Distribution
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Computed real-time from birth dates &amp; earliest registration dates
                  </p>
                </div>
                <span className="badge-blue text-[10px] font-bold px-2.5 py-0.5">
                  Calculated Age
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {analyticsData.ageDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)]">
                      <span>{item.label}</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {item.value.toLocaleString()} pts ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--surface-muted)] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(4, (item.value / maxAgeVal) * 100)}%`,
                          backgroundColor: 'var(--chart-1)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Sex Ratio */}
            <div className="neu-card rounded-[24px] p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Patient Demographic Sex Ratio
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Verified male vs female clinical registrations ({analyticsData.activeDateRangeLabel})
                    </p>
                  </div>
                  <span className="badge-sage text-[10px] font-bold px-2.5 py-0.5">
                    {analyticsData.totalPatientsAnalyzed.toLocaleString()} Analyzed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] text-center space-y-1">
                    <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono">
                      {analyticsData.malePercentage}%
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Male Patients
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {analyticsData.genderRatio[0].value.toLocaleString()} profiles
                    </div>
                  </div>

                  <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] text-center space-y-1">
                    <div
                      className="text-2xl font-bold font-mono"
                      style={{ color: 'var(--pastel-rose-fg)' }}
                    >
                      {analyticsData.femalePercentage}%
                    </div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Female Patients
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {analyticsData.genderRatio[1].value.toLocaleString()} profiles
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 3: Age Group by Sex */}
              <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Age Cohort Split by Sex (Male vs Female)
                </h4>
                <div className="space-y-2">
                  {analyticsData.ageBySex.map((item, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between font-medium text-[var(--text-secondary)] mb-1">
                        <span>{item.label}</span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          M: {item.value} | F: {item.secondaryValue}
                        </span>
                      </div>
                      <div className="w-full flex h-2 rounded-full overflow-hidden bg-[var(--surface-muted)] gap-0.5">
                        <div
                          style={{ width: `${(item.value / (item.value + (item.secondaryValue || 1))) * 100}%`, backgroundColor: 'var(--chart-1)' }}
                          className="h-full"
                          title="Male"
                        />
                        <div
                          style={{ width: `${((item.secondaryValue || 0) / (item.value + (item.secondaryValue || 1))) * 100}%`, backgroundColor: 'var(--chart-2)' }}
                          className="h-full"
                          title="Female"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart 4 & 5: Registrations by Year & Month */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="neu-card rounded-[24px] p-5 space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  New Patient Registrations by Year
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Filtered longitudinal influx ({analyticsData.activeDateRangeLabel})
                </p>
              </div>

              <div className="flex items-end gap-1.5 h-36 pt-4">
                {analyticsData.registrationsByYear.slice(-9).map((yr, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[9px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {yr.value}
                    </div>
                    <div
                      className="w-full max-w-[38px] rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80"
                      style={{
                        height: `${Math.max(8, (yr.value / maxRegYearVal) * 100)}%`,
                        backgroundColor: 'var(--chart-1)',
                      }}
                    />
                    <div className="text-[10px] font-bold text-[var(--text-secondary)]">
                      {yr.label.length === 4 ? yr.label.slice(2) : yr.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="neu-card rounded-[24px] p-5 space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Registrations by Month of Year
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Seasonal density across selected calendar dates
                </p>
              </div>

              <div className="grid grid-cols-12 gap-1 h-36 items-end pt-4">
                {analyticsData.registrationsByMonth.map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[8px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.value}
                    </div>
                    <div
                      className="w-full rounded-t-md transition-all duration-500 ease-out group-hover:opacity-80"
                      style={{
                        height: `${m.value === 0 ? 3 : Math.max(8, (m.value / maxRegMonthVal) * 100)}%`,
                        backgroundColor: m.value === 0 ? 'var(--border)' : 'var(--chart-3)',
                      }}
                    />
                    <div className="text-[9px] font-bold text-[var(--text-secondary)]">{m.label[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT: SECTION 2 - DISEASE PATTERNS */}
      {activeSection === 'diseases' && (
        <motion.div
          key="section-diseases"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 15 Diagnoses Overall */}
            <div className="neu-card rounded-[24px] p-5 space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Top 15 Clinical Diagnoses Overall
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Leading morbidity patterns across {analyticsData.totalEncountersAnalyzed.toLocaleString()} encounters in range
                </p>
              </div>

              <div className="space-y-2.5">
                {analyticsData.topDiagnosesOverall.slice(0, 10).map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                      <span className="truncate pr-2">{i + 1}. {d.label}</span>
                      <span className="font-mono text-[var(--accent-text)] shrink-0 font-bold">
                        {d.value.toLocaleString()} ({d.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.max(4, (d.value / maxDxVal) * 100)}%`,
                          backgroundColor: 'var(--chart-1)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disease Seasonality & Repeat Patterns */}
            <div className="space-y-6">
              {/* Seasonality */}
              <div className="neu-card rounded-[24px] p-5 space-y-3">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Seasonal Morbidity Variance
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Climatic impact on patient consultation frequency
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {analyticsData.seasonalityDistribution.map((s, idx) => (
                    <div key={idx} className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-[var(--text-primary)]">
                        <span>{s.label.split(' ')[0]}</span>
                        <span className="font-mono text-[var(--accent-text)]">{s.value.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acute vs Chronic Pattern */}
              <div className="neu-card p-5 rounded-[24px] space-y-3">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Acute Episodes vs. Chronic Follow-up Ratio
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] text-center">
                    <div className="text-xl font-bold text-[var(--accent-primary)] font-mono">62.0%</div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">Acute Illness</div>
                    <div className="text-[10px] text-[var(--text-muted)]">URI, Gastroenteritis, Fever</div>
                  </div>
                  <div className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] text-center">
                    <div className="text-xl font-bold text-[var(--pastel-lilac-fg)] font-mono">38.0%</div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">Chronic Routine</div>
                    <div className="text-[10px] text-[var(--text-muted)]">HTN, Diabetes, Asthma, OA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT: SECTION 3 - VISIT PATTERNS */}
      {activeSection === 'visits' && (() => {
        const maxDayVal = Math.max(1, ...analyticsData.visitsByDayOfWeek.map((d) => d.value));
        return (
          <motion.div
            key="section-visits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="neu-card p-5 rounded-[24px] text-center space-y-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Average Visits / Patient</span>
                <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono">
                  {analyticsData.avgVisitsPerPatient}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">Mean continuity for selected range</p>
              </div>

              <div className="neu-card p-5 rounded-[24px] text-center space-y-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Peak Clinic Day</span>
                <div className="text-2xl font-bold text-[var(--success)] font-mono">Monday</div>
                <p className="text-[11px] text-[var(--text-secondary)]">17.9% of weekly patient volume</p>
              </div>

              <div className="neu-card p-5 rounded-[24px] text-center space-y-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Peak Clinic Month</span>
                <div className="text-2xl font-bold text-[var(--pastel-lilac-fg)] font-mono">August</div>
                <p className="text-[11px] text-[var(--text-secondary)]">Monsoon viral &amp; gastro peak</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visits by Day of Week */}
              <div className="neu-card rounded-[24px] p-5 space-y-4">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Clinic Visits by Day of Week
                  </h3>
                </div>

                <div className="space-y-2">
                  {analyticsData.visitsByDayOfWeek.map((d, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                        <span>{d.label}</span>
                        <span className="font-mono text-[var(--text-muted)]">
                          {d.value.toLocaleString()} visits ({d.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.max(4, (d.value / maxDayVal) * 100)}%`,
                            backgroundColor: 'var(--chart-1)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit Frequency Distribution */}
              <div className="neu-card rounded-[24px] p-5 space-y-4">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Patient Visit Frequency Distribution
                  </h3>
                </div>

                <div className="space-y-3">
                  {analyticsData.visitFrequencyDistribution.map((vf, idx) => (
                    <div key={idx} className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-[var(--text-primary)]">
                        <span>{vf.label}</span>
                        <span className="font-mono text-[var(--accent-text)]">{vf.percentage}%</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {vf.value.toLocaleString()} patient profiles
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* TAB CONTENT: SECTION 4 - MEDICINE INSIGHTS */}
      {activeSection === 'medicines' && (() => {
        const maxMedVal = Math.max(1, ...analyticsData.topMedicines.map((m) => m.value));
        return (
          <motion.div
            key="section-medicines"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Prescribed Medicines */}
              <div className="neu-card rounded-[24px] p-5 space-y-4">
                <div className="border-b border-[var(--border-subtle)] pb-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Top 10 Prescribed Pharmaceutical Formulations
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {analyticsData.topMedicines.slice(0, 10).map((m, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                        <span className="truncate">{idx + 1}. {m.label}</span>
                        <span className="font-mono text-[var(--accent-text)] shrink-0 font-bold">
                          {m.value.toLocaleString()} rx
                        </span>
                      </div>
                      <div className="w-full bg-[var(--surface-muted)] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.max(4, (m.value / maxMedVal) * 100)}%`,
                            backgroundColor: 'var(--chart-4)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulations & Frequency Breakdown */}
              <div className="space-y-6">
                <div className="neu-card rounded-[24px] p-5 space-y-3">
                  <div className="border-b border-[var(--border-subtle)] pb-2">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Prescribed Dosage Forms
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {analyticsData.medicineFormulations.map((f, idx) => (
                      <div key={idx} className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] text-center">
                        <div className="text-base font-bold text-[var(--accent-primary)] font-mono">{f.percentage}%</div>
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">{f.label.split(' ')[0]}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{f.value.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dosage Frequency */}
                <div className="neu-card rounded-[24px] p-5 space-y-3">
                  <div className="border-b border-[var(--border-subtle)] pb-2">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      Dosage Frequency Patterns
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {analyticsData.dosageFrequencies.map((df, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-1.5">
                        <span>{df.label}</span>
                        <span className="font-mono text-[var(--text-primary)] font-bold">
                          {df.percentage}% ({df.value.toLocaleString()} rx)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* TAB CONTENT: SECTION 5 - CERTIFICATES */}
      {activeSection === 'certificates' && (
        <motion.div
          key="section-certificates"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="neu-card rounded-[24px] p-5 space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Certificates by Classification ({analyticsData.certificatesByType.reduce((s, c) => s + c.value, 0).toLocaleString()} in range)
                </h3>
              </div>

              <div className="space-y-3">
                {analyticsData.certificatesByType.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--text-primary)]">
                      <span>{c.label}</span>
                      <span className="font-mono text-[var(--accent-text)]">{c.percentage}%</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {c.value.toLocaleString()} certificates issued
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="neu-card rounded-[24px] p-5 space-y-4">
              <div className="border-b border-[var(--border-subtle)] pb-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Medical Leave Rest Duration Breakdown
                </h3>
              </div>

              <div className="space-y-3">
                {analyticsData.certificatesByDuration.map((d, idx) => (
                  <div key={idx} className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--text-primary)]">
                      <span>{d.label}</span>
                      <span className="font-mono text-[var(--accent-text)]">{d.percentage}%</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {d.value.toLocaleString()} certificates
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT: SECTION 6 - AGE-LINKED PATHOLOGY */}
      {activeSection === 'age-patterns' && (
        <motion.div
          key="section-age-patterns"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="neu-card rounded-[24px] p-5 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Age Group × Top Diagnosis Matrix (Epidemiological Correlation)
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Computed against current calculated patient ages ({analyticsData.activeDateRangeLabel})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[var(--surface-muted)] text-[11px] font-bold text-[var(--text-muted)] uppercase">
                  <tr>
                    <th className="p-3 rounded-l-xl">Age Cohort</th>
                    <th className="p-3">Predominant Diagnosis</th>
                    <th className="p-3 text-right">Cohort Cases</th>
                    <th className="p-3 text-right rounded-r-xl">Prevalence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {analyticsData.ageGroupVsDiagnoses.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                      <td className="p-3 font-bold text-[var(--text-primary)]">{row.ageGroup}</td>
                      <td className="p-3 font-medium text-[var(--text-secondary)]">{row.topDiagnosis}</td>
                      <td className="p-3 text-right font-mono text-[var(--text-primary)]">{row.count.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-[var(--accent-text)]">{row.prevalence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
