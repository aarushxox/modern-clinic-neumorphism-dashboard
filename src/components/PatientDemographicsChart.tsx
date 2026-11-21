import React, { useMemo, useState } from 'react';
import {
  Users,
  ArrowUpRight,
  BarChart3,
  PieChart as PieChartIcon,
  X,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ChartDataPoint } from '../services/analyticsService';

export type DemographicAgeBracket = '0-18' | '19-35' | '36-60' | '60+';

export interface DemographicAgeGroup {
  group: DemographicAgeBracket;
  subtitle: string;
  count: number;
  percentage: number;
  color: string;
}

export function matchesAgeBracket(
  age: number | null | undefined,
  bracket: DemographicAgeBracket | null
): boolean {
  if (!bracket) return true;
  if (typeof age !== 'number' || !Number.isFinite(age)) return false;
  if (bracket === '0-18') return age >= 0 && age <= 18;
  if (bracket === '19-35') return age >= 19 && age <= 35;
  if (bracket === '36-60') return age >= 36 && age <= 60;
  if (bracket === '60+') return age > 60;
  return true;
}

/**
 * Maps the 9 fine-grained archive age bands into the 4 clinical demographic groups:
 * 0-18 (Pediatric/Youth), 19-35 (Young Adult), 36-60 (Middle-Aged), and 60+ (Senior).
 */
export function buildPatientDemographicGroups(
  ageDistribution: ChartDataPoint[]
): DemographicAgeGroup[] {
  const byLabel = new Map<string, number>();
  ageDistribution.forEach((pt) => {
    byLabel.set(pt.label, pt.value);
  });

  const b0_10 = byLabel.get('0-10 yrs') ?? 0;
  const b11_20 = byLabel.get('11-20 yrs') ?? 0;
  const b21_30 = byLabel.get('21-30 yrs') ?? 0;
  const b31_40 = byLabel.get('31-40 yrs') ?? 0;
  const b41_50 = byLabel.get('41-50 yrs') ?? 0;
  const b51_60 = byLabel.get('51-60 yrs') ?? 0;
  const b61_70 = byLabel.get('61-70 yrs') ?? 0;
  const b71_80 = byLabel.get('71-80 yrs') ?? 0;
  const b81Plus = byLabel.get('81+ yrs') ?? 0;

  const b11_18 = Math.round(b11_20 * 0.8);
  const b19_20 = Math.max(0, b11_20 - b11_18);
  const b31_35 = Math.round(b31_40 * 0.5);
  const b36_40 = Math.max(0, b31_40 - b31_35);

  const rawGroups: {
    group: DemographicAgeBracket;
    subtitle: string;
    count: number;
    color: string;
  }[] = [
    {
      group: '0-18',
      subtitle: 'Pediatric & Youth',
      count: b0_10 + b11_18,
      color: 'var(--chart-3)',
    },
    {
      group: '19-35',
      subtitle: 'Young Adults',
      count: b19_20 + b21_30 + b31_35,
      color: 'var(--chart-2)',
    },
    {
      group: '36-60',
      subtitle: 'Working Adults',
      count: b36_40 + b41_50 + b51_60,
      color: 'var(--chart-1)',
    },
    {
      group: '60+',
      subtitle: 'Senior Care',
      count: b61_70 + b71_80 + b81Plus,
      color: 'var(--chart-4)',
    },
  ];

  const total = rawGroups.reduce((sum, item) => sum + item.count, 0) || 1;

  return rawGroups.map((item) => ({
    ...item,
    percentage: Number(((item.count / total) * 100).toFixed(1)),
  }));
}

interface PatientDemographicsChartProps {
  ageDistribution: ChartDataPoint[];
  genderFilter: 'ALL' | 'Male' | 'Female';
  onGenderFilterChange: (gender: 'ALL' | 'Male' | 'Female') => void;
  selectedAgeBracket: DemographicAgeBracket | null;
  onSelectAgeBracket: (bracket: DemographicAgeBracket | null) => void;
  onOpenReports: () => void;
  onOpenDirectoryForBracket?: (bracket: DemographicAgeBracket) => void;
}

interface DemographicChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: DemographicAgeGroup }>;
  totalPopulation: number;
  selectedAgeBracket: DemographicAgeBracket | null;
  chartType: 'donut' | 'bar';
  clickTarget: 'directory' | 'dashboard';
}

const DemographicChartTooltip: React.FC<DemographicChartTooltipProps> = ({
  active,
  payload,
  totalPopulation,
  selectedAgeBracket,
  chartType,
  clickTarget,
}) => {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }
  const entry = payload[0].payload;
  const isSelected = selectedAgeBracket === entry.group;

  return (
    <div
      id="demographics-hover-tooltip"
      role="tooltip"
      className="min-w-[196px] rounded-[16px] border p-3 text-[11px] backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'var(--surface-elevated)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--neu-raised)',
      }}
    >
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-[var(--surface-muted)]"
            style={{ backgroundColor: entry.color }}
          />
          <div className="min-w-0">
            <div className="font-bold text-[12px] leading-tight text-[var(--text-primary)]">
              Age {entry.group} yrs
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              {entry.subtitle}
            </div>
          </div>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10.5px] font-bold font-mono tabular-nums shrink-0"
          style={{
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-text)',
          }}
        >
          {entry.percentage.toFixed(1)}%
        </span>
      </div>

      <div className="pt-2 space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10.5px] text-[var(--text-secondary)]">Exact count</span>
          <span className="font-mono font-bold tabular-nums text-[12px] text-[var(--text-primary)]">
            {entry.count.toLocaleString()} patients
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[10.5px] text-[var(--text-secondary)]">Clinic share</span>
          <span className="font-mono tabular-nums text-[10.5px] text-[var(--text-muted)]">
            {entry.percentage.toFixed(1)}% of {totalPopulation.toLocaleString()}
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface-muted)]">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${Math.min(100, Math.max(4, entry.percentage))}%`,
              backgroundColor: entry.color,
            }}
          />
        </div>

        <div className="text-[10px] text-[var(--text-muted)] pt-0.5">
          {clickTarget === 'directory'
            ? `Click ${chartType === 'donut' ? 'slice' : 'bar'} to filter Patients Directory`
            : isSelected
            ? `Active filter — click ${chartType === 'donut' ? 'slice' : 'bar'} to clear`
            : `Click ${chartType === 'donut' ? 'slice' : 'bar'} to filter day patient list`}
        </div>
      </div>
    </div>
  );
};

export const PatientDemographicsChart: React.FC<PatientDemographicsChartProps> = ({
  ageDistribution,
  genderFilter,
  onGenderFilterChange,
  selectedAgeBracket,
  onSelectAgeBracket,
  onOpenReports,
  onOpenDirectoryForBracket,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [clickTarget, setClickTarget] = useState<'directory' | 'dashboard'>(
    onOpenDirectoryForBracket ? 'directory' : 'dashboard'
  );
  const [hoveredBracket, setHoveredBracket] = useState<DemographicAgeBracket | null>(null);

  const demographicGroups = useMemo(
    () => buildPatientDemographicGroups(ageDistribution),
    [ageDistribution]
  );

  const totalPopulation = useMemo(
    () => demographicGroups.reduce((sum, item) => sum + item.count, 0),
    [demographicGroups]
  );

  const selectedCohortData = useMemo(
    () =>
      selectedAgeBracket
        ? demographicGroups.find((item) => item.group === selectedAgeBracket) || null
        : null,
    [demographicGroups, selectedAgeBracket]
  );

  const largestCohort = useMemo(() => {
    return demographicGroups.reduce(
      (best, item) => (item.count > best.count ? item : best),
      demographicGroups[0]
    );
  }, [demographicGroups]);

  const handleToggleBracket = (group: DemographicAgeBracket) => {
    if (clickTarget === 'directory' && onOpenDirectoryForBracket) {
      onOpenDirectoryForBracket(group);
      return;
    }
    onSelectAgeBracket(selectedAgeBracket === group ? null : group);
  };

  return (
    <section
      id="dashboard-patient-demographics-widget"
      className="lg:col-span-5 neu-card rounded-[24px] p-5 sm:p-6 flex flex-col justify-between gap-4"
    >
      <div className="space-y-3.5">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span
              className="w-9 h-9 rounded-full grid place-items-center shrink-0 mt-0.5"
              style={{
                background: 'var(--pastel-lilac-bg)',
                color: 'var(--pastel-lilac-fg)',
                boxShadow: 'var(--neu-raised-sm)',
              }}
            >
              <Users className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                Patient Age Distribution
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {clickTarget === 'directory'
                  ? 'Click any age cohort slice to filter the Patients Directory'
                  : 'Click any age cohort slice to filter today\u2019s patient list'}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border-subtle)] shrink-0"
            role="group"
            aria-label="Chart visualization mode"
          >
            <button
              type="button"
              onClick={() => setChartType('donut')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                chartType === 'donut'
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Interactive Donut chart view"
              aria-label="Donut chart view"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="Bar chart view"
              aria-label="Bar chart view"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Gender Filter Strip + Click Target Toggle (Directory vs Day List) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border-subtle)]">
            {(['ALL', 'Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGenderFilterChange(g)}
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] transition-colors cursor-pointer ${
                  genderFilter === g
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                {g === 'ALL' ? 'All Patients' : g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onOpenDirectoryForBracket && (
              <div
                className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border-subtle)]"
                role="group"
                aria-label="Slice click filter target"
              >
                <button
                  id="demographics-target-directory-btn"
                  type="button"
                  onClick={() => setClickTarget('directory')}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition-colors cursor-pointer ${
                    clickTarget === 'directory'
                      ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                  }`}
                  title="Clicking a slice opens Patients Directory filtered by that age cohort"
                >
                  Directory
                </button>
                <button
                  id="demographics-target-dashboard-btn"
                  type="button"
                  onClick={() => setClickTarget('dashboard')}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition-colors cursor-pointer ${
                    clickTarget === 'dashboard'
                      ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                  }`}
                  title="Clicking a slice filters today's patient list in place"
                >
                  Day List
                </button>
              </div>
            )}

            {selectedAgeBracket ? (
              <span className="badge-lilac inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold">
                <Filter className="w-2.5 h-2.5" />
                <span>Age {selectedAgeBracket} yrs</span>
                <button
                  id="demographics-clear-age-filter-btn"
                  type="button"
                  onClick={() => onSelectAgeBracket(null)}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Clear age bracket filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              largestCohort && (
                <span className="badge-sage px-2.5 py-0.5 text-[10px] font-semibold">
                  Peak: {largestCohort.group} yrs ({largestCohort.percentage}%)
                </span>
              )
            )}
          </div>
        </div>

        {/* Interactive Recharts Visualization */}
        <div className="h-[210px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'donut' ? (
              <PieChart>
                <Pie
                  data={demographicGroups}
                  dataKey="count"
                  nameKey="group"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="var(--surface-elevated)"
                  strokeWidth={2}
                  onClick={(_, index) => {
                    const target = demographicGroups[index];
                    if (target) handleToggleBracket(target.group);
                  }}
                  onMouseEnter={(_, index) => {
                    const target = demographicGroups[index];
                    if (target) setHoveredBracket(target.group);
                  }}
                  onMouseLeave={() => setHoveredBracket(null)}
                >
                  {demographicGroups.map((entry) => {
                    const isSelected = selectedAgeBracket === entry.group;
                    const isHovered = hoveredBracket === entry.group;
                    const isDimmed = Boolean(
                      (selectedAgeBracket && !isSelected && !isHovered) ||
                        (!selectedAgeBracket && hoveredBracket && !isHovered)
                    );
                    return (
                      <Cell
                        key={entry.group}
                        fill={entry.color}
                        fillOpacity={isDimmed ? 0.38 : 1}
                        stroke={
                          isSelected || isHovered
                            ? 'var(--text-primary)'
                            : 'var(--surface-elevated)'
                        }
                        strokeWidth={isSelected ? 2.5 : isHovered ? 2.25 : 2}
                        style={{
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'fill-opacity 180ms ease, stroke-width 180ms ease',
                        }}
                      />
                    );
                  })}
                </Pie>
                <RechartsTooltip
                  isAnimationActive={false}
                  wrapperStyle={{ zIndex: 30, pointerEvents: 'none', outline: 'none' }}
                  content={({ active, payload }) => (
                    <DemographicChartTooltip
                      active={active}
                      payload={payload as ReadonlyArray<{ payload?: DemographicAgeGroup }>}
                      totalPopulation={totalPopulation}
                      selectedAgeBracket={selectedAgeBracket}
                      chartType="donut"
                      clickTarget={clickTarget}
                    />
                  )}
                />
              </PieChart>
            ) : (
              <BarChart
                data={demographicGroups}
                margin={{ top: 10, right: 8, left: -16, bottom: 2 }}
                barCategoryGap="24%"
              >
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  dataKey="group"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                  dy={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10.5, fill: 'var(--text-muted)' }}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
                  }
                />
                <RechartsTooltip
                  isAnimationActive={false}
                  wrapperStyle={{ zIndex: 30, pointerEvents: 'none', outline: 'none' }}
                  cursor={{ fill: 'var(--surface-muted)', opacity: 0.55 }}
                  content={({ active, payload }) => (
                    <DemographicChartTooltip
                      active={active}
                      payload={payload as ReadonlyArray<{ payload?: DemographicAgeGroup }>}
                      totalPopulation={totalPopulation}
                      selectedAgeBracket={selectedAgeBracket}
                      chartType="bar"
                      clickTarget={clickTarget}
                    />
                  )}
                />
                <Bar
                  dataKey="count"
                  radius={[10, 10, 4, 4]}
                  maxBarSize={48}
                  onClick={(_, index) => {
                    const target = demographicGroups[index];
                    if (target) handleToggleBracket(target.group);
                  }}
                  onMouseEnter={(_, index) => {
                    const target = demographicGroups[index];
                    if (target) setHoveredBracket(target.group);
                  }}
                  onMouseLeave={() => setHoveredBracket(null)}
                >
                  {demographicGroups.map((entry) => {
                    const isSelected = selectedAgeBracket === entry.group;
                    const isHovered = hoveredBracket === entry.group;
                    const isDimmed = Boolean(
                      (selectedAgeBracket && !isSelected && !isHovered) ||
                        (!selectedAgeBracket && hoveredBracket && !isHovered)
                    );
                    return (
                      <Cell
                        key={entry.group}
                        fill={entry.color}
                        fillOpacity={isDimmed ? 0.38 : 1}
                        stroke={isSelected || isHovered ? 'var(--text-primary)' : 'none'}
                        strokeWidth={isSelected || isHovered ? 1.5 : 0}
                        style={{
                          cursor: 'pointer',
                          transition: 'fill-opacity 180ms ease',
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Donut Center Readout Overlay */}
          {chartType === 'donut' && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              {selectedCohortData ? (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                    {selectedCohortData.group} yrs
                  </span>
                  <strong className="text-lg font-bold font-mono tabular-nums text-[var(--text-primary)] leading-tight">
                    {selectedCohortData.percentage}%
                  </strong>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {selectedCohortData.count.toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <strong className="text-lg font-bold font-mono tabular-nums text-[var(--text-primary)] leading-tight">
                    {(totalPopulation / 1000).toFixed(1)}k
                  </strong>
                  <span className="text-[10px] text-[var(--text-muted)]">profiles</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Clickable 4-Band Demographic Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {demographicGroups.map((item) => {
            const isSelected = selectedAgeBracket === item.group;
            const isHovered = hoveredBracket === item.group;
            return (
              <button
                key={item.group}
                id={`demographics-bracket-tile-${item.group}`}
                type="button"
                onClick={() => handleToggleBracket(item.group)}
                onMouseEnter={() => setHoveredBracket(item.group)}
                onMouseLeave={() => setHoveredBracket(null)}
                aria-pressed={isSelected}
                className={`p-2.5 rounded-[14px] border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? 'bg-[var(--surface-elevated)] border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 shadow-xs'
                    : isHovered
                    ? 'bg-[var(--surface-elevated)] border-[var(--border)] shadow-xs'
                    : 'bg-[var(--surface-muted)]/65 border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] hover:border-[var(--border)]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-[11px] font-bold text-[var(--text-primary)] font-mono">
                    {item.group}
                  </span>
                </div>
                <div className="text-xs font-bold font-mono tabular-nums text-[var(--text-primary)] leading-none">
                  {item.count.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {item.percentage.toFixed(1)}% share
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Strip */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {selectedAgeBracket && onOpenDirectoryForBracket ? (
          <button
            type="button"
            onClick={() => onOpenDirectoryForBracket(selectedAgeBracket)}
            className="font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
            style={{ color: 'var(--accent-text)' }}
          >
            <span>View all {selectedAgeBracket} yrs in Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[var(--text-muted)]">
            Interactive 4-band population filter
          </span>
        )}
        <button
          type="button"
          onClick={onOpenReports}
          className="font-semibold hover:underline cursor-pointer inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <span>Full demographics</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
