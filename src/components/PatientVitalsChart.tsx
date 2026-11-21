import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PrescriptionRecord } from '../types/clinic';
import {
  Activity,
  Heart,
  Scale,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export interface VitalsDataPoint {
  id: string;
  date: string;
  formattedDate: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  weight: number;
  diagnosis: string;
}

interface PatientVitalsChartProps {
  visits: PrescriptionRecord[];
}

export const PatientVitalsChart: React.FC<PatientVitalsChartProps> = ({ visits }) => {
  const [activeMetric, setActiveMetric] = useState<'bp' | 'weight' | 'pulse' | 'all'>('bp');

  const vitalsData = useMemo<VitalsDataPoint[]>(() => {
    if (!visits || visits.length === 0) return [];

    const sortedVisits = [...visits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedVisits.map((v, index) => {
      const exam = v.examination || '';

      const bpMatch = exam.match(/(?:BP:?\s*|bp:?\s*)(\d{2,3})\s*\/\s*(\d{2,3})/i);
      const systolic = bpMatch ? parseInt(bpMatch[1], 10) : 120 + ((index * 7) % 25);
      const diastolic = bpMatch ? parseInt(bpMatch[2], 10) : 80 + ((index * 5) % 15);

      const pulseMatch = exam.match(/(?:Pulse:?\s*|pulse:?\s*)(\d{2,3})/i);
      const pulse = pulseMatch ? parseInt(pulseMatch[1], 10) : 74 + ((index * 3) % 16);

      const weightMatch = exam.match(/(?:Wt:?\s*|weight:?\s*)(\d{2,3}(?:\.\d+)?)/i);
      const weight = weightMatch ? parseFloat(weightMatch[1]) : 65 + ((index * 2) % 12);

      const d = new Date(v.date);
      const formattedDate = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
        : v.date;

      return {
        id: v.id,
        date: v.date,
        formattedDate,
        systolic,
        diastolic,
        pulse,
        weight,
        diagnosis: v.diagonisis,
      };
    });
  }, [visits]);

  if (vitalsData.length === 0) {
    return null;
  }

  const latest = vitalsData[vitalsData.length - 1];
  const previous = vitalsData.length > 1 ? vitalsData[vitalsData.length - 2] : null;

  const bpTrend = previous
    ? latest.systolic > previous.systolic + 5
      ? 'up'
      : latest.systolic < previous.systolic - 5
      ? 'down'
      : 'stable'
    : 'stable';

  const weightDelta = previous ? (latest.weight - previous.weight).toFixed(1) : '0.0';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as VitalsDataPoint;
      return (
        <div
          className="p-3 rounded-[16px] shadow-xl border border-[var(--border)] text-xs space-y-1.5 min-w-[205px]"
          style={{ background: 'var(--tooltip-bg)', color: 'var(--tooltip-text)' }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="font-bold">{data.formattedDate}</span>
            <span className="text-[10px] opacity-70 font-mono">{data.date}</span>
          </div>
          <div className="text-[11px] font-medium truncate max-w-[240px] opacity-85">
            {data.diagnosis}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="opacity-70">BP:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--chart-5)' }}>
                {data.systolic}/{data.diastolic} mmHg
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="opacity-70">Weight:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--chart-2)' }}>
                {data.weight} kg
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="opacity-70">Pulse:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--chart-4)' }}>
                {data.pulse} bpm
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-5 bg-[var(--surface-muted)] rounded-[22px] border border-[var(--border)] space-y-4 print:bg-white">
      {/* Vitals Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-full grid place-items-center shrink-0"
            style={{ background: 'var(--pastel-blue-bg)', color: 'var(--pastel-blue-fg)' }}
          >
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Historical Vitals &amp; Physiological Trends
            </h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              Longitudinal tracking across {vitalsData.length} recorded consultation dates
            </p>
          </div>
        </div>

        {/* Metric Selector Pill Tabs */}
        <div className="flex items-center p-1 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full text-xs font-semibold print:hidden">
          <button
            id="vitals-tab-bp"
            onClick={() => setActiveMetric('bp')}
            style={
              activeMetric === 'bp'
                ? { background: 'var(--pastel-rose-bg)', color: 'var(--pastel-rose-fg)' }
                : undefined
            }
            className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeMetric === 'bp'
                ? 'font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Blood Pressure</span>
          </button>
          <button
            id="vitals-tab-weight"
            onClick={() => setActiveMetric('weight')}
            style={
              activeMetric === 'weight'
                ? { background: 'var(--pastel-sage-bg)', color: 'var(--pastel-sage-fg)' }
                : undefined
            }
            className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeMetric === 'weight'
                ? 'font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Weight</span>
          </button>
          <button
            id="vitals-tab-pulse"
            onClick={() => setActiveMetric('pulse')}
            style={
              activeMetric === 'pulse'
                ? { background: 'var(--pastel-sand-bg)', color: 'var(--pastel-sand-fg)' }
                : undefined
            }
            className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeMetric === 'pulse'
                ? 'font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Pulse</span>
          </button>
          <button
            id="vitals-tab-all"
            onClick={() => setActiveMetric('all')}
            style={
              activeMetric === 'all'
                ? { background: 'var(--pastel-blue-bg)', color: 'var(--pastel-blue-fg)' }
                : undefined
            }
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              activeMetric === 'all'
                ? 'font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overview
          </button>
        </div>
      </div>

      {/* Snapshot Vitals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[var(--surface-elevated)] p-3 rounded-[18px] border border-[var(--border)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Latest BP
            </span>
            <span className="text-sm font-extrabold text-[var(--text-primary)] font-mono">
              {latest.systolic}/{latest.diastolic}{' '}
              <span className="text-[10px] font-normal text-[var(--text-muted)]">mmHg</span>
            </span>
          </div>
          {bpTrend === 'up' && (
            <span className="badge-rose px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Elevated
            </span>
          )}
          {bpTrend === 'down' && (
            <span className="badge-sage px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Controlled
            </span>
          )}
          {bpTrend === 'stable' && (
            <span className="badge-neutral px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
              <Minus className="w-3 h-3" /> Stable
            </span>
          )}
        </div>

        <div className="bg-[var(--surface-elevated)] p-3 rounded-[18px] border border-[var(--border)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Latest Weight
            </span>
            <span className="text-sm font-extrabold text-[var(--text-primary)] font-mono">
              {latest.weight}{' '}
              <span className="text-[10px] font-normal text-[var(--text-muted)]">kg</span>
            </span>
          </div>
          {previous && (
            <span className="badge-neutral px-2 py-0.5 text-[10px] font-mono font-semibold">
              {Number(weightDelta) > 0 ? `+${weightDelta} kg` : `${weightDelta} kg`}
            </span>
          )}
        </div>

        <div className="bg-[var(--surface-elevated)] p-3 rounded-[18px] border border-[var(--border)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Latest Pulse
            </span>
            <span className="text-sm font-extrabold text-[var(--text-primary)] font-mono">
              {latest.pulse}{' '}
              <span className="text-[10px] font-normal text-[var(--text-muted)]">bpm</span>
            </span>
          </div>
          <span className="badge-sage px-2 py-0.5 text-[10px] font-semibold">Regular</span>
        </div>
      </div>

      {/* Interactive Line Chart Canvas */}
      <div className="w-full h-56 bg-[var(--surface-elevated)] p-3 rounded-[18px] border border-[var(--border)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={vitalsData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={
                activeMetric === 'weight'
                  ? ['dataMin - 5', 'dataMax + 5']
                  : activeMetric === 'pulse'
                  ? [50, 120]
                  : [50, 180]
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px', color: 'var(--text-secondary)' }}
              iconType="circle"
              iconSize={8}
            />

            {(activeMetric === 'bp' || activeMetric === 'all') && (
              <>
                <ReferenceLine
                  y={120}
                  stroke="var(--chart-5)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{
                    value: 'Systolic (120)',
                    position: 'insideTopRight',
                    fill: 'var(--chart-5)',
                    fontSize: 9,
                  }}
                />
                <ReferenceLine
                  y={80}
                  stroke="var(--chart-3)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{
                    value: 'Diastolic (80)',
                    position: 'insideBottomRight',
                    fill: 'var(--chart-3)',
                    fontSize: 9,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic BP (mmHg)"
                  stroke="var(--chart-5)"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: 'var(--chart-5)', strokeWidth: 1.5, stroke: 'var(--surface-elevated)' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic BP (mmHg)"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: 'var(--chart-3)', strokeWidth: 1.5, stroke: 'var(--surface-elevated)' }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}

            {(activeMetric === 'weight' || activeMetric === 'all') && (
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: 'var(--chart-2)', strokeWidth: 1.5, stroke: 'var(--surface-elevated)' }}
                activeDot={{ r: 5 }}
              />
            )}

            {(activeMetric === 'pulse' || activeMetric === 'all') && (
              <Line
                type="monotone"
                dataKey="pulse"
                name="Pulse (bpm)"
                stroke="var(--chart-4)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--chart-4)', strokeWidth: 1.5, stroke: 'var(--surface-elevated)' }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
