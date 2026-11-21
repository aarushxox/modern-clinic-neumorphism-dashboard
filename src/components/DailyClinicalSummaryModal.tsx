import React, { useMemo } from 'react';
import {
  FileText,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Users,
  Heart,
} from 'lucide-react';
import { Modal } from './Modal';
import { ClinicSettings, PatientRecord, PrescriptionRecord } from '../types/clinic';
import { computeCurrentAge } from '../utils/clinicalCalculations';
import {
  CLINICAL_VITALS_THRESHOLDS,
  evaluateVitalsThresholds,
} from '../constants/clinicalConstants';

export interface DailySummaryPatientEntry {
  rx: PrescriptionRecord;
  status: 'Active' | 'Pending Review' | 'Discharged';
  patient: PatientRecord | null;
  latestHr: number;
  latestBp: string;
  latestSystolic: number;
  latestDiastolic: number;
}

interface DailyClinicalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicDate: string;
  entries: DailySummaryPatientEntry[];
  settings?: ClinicSettings;
}

export const DailyClinicalSummaryModal: React.FC<DailyClinicalSummaryModalProps> = ({
  isOpen,
  onClose,
  clinicDate,
  entries,
  settings,
}) => {
  const summaryStats = useMemo(() => {
    const activeEntries = entries.filter((e) => e.status !== 'Discharged');
    const pendingCount = entries.filter((e) => e.status === 'Pending Review').length;
    const dischargedCount = entries.filter((e) => e.status === 'Discharged').length;

    const totalFees = entries.reduce((sum, e) => sum + (e.rx.feesrecived || 0), 0);
    const avgHr =
      entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.latestHr, 0) / entries.length)
        : 0;
    const avgSys =
      entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.latestSystolic, 0) / entries.length)
        : 0;
    const avgDia =
      entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.latestDiastolic, 0) / entries.length)
        : 0;

    const evaluatedRows = entries.map((entry) => {
      const evaluation = evaluateVitalsThresholds({
        systolic: entry.latestSystolic,
        diastolic: entry.latestDiastolic,
        pulse: entry.latestHr,
      });
      return {
        ...entry,
        evaluation,
        computedAge: entry.patient ? computeCurrentAge(entry.patient).currentAge : null,
      };
    });

    const thresholdBreaches = evaluatedRows.filter((r) => r.evaluation.isBreach);

    return {
      totalCount: entries.length,
      activeCount: activeEntries.length,
      pendingCount,
      dischargedCount,
      totalFees,
      avgHr,
      avgBp: entries.length > 0 ? `${avgSys}/${avgDia} mmHg` : 'N/A',
      evaluatedRows,
      thresholdBreaches,
    };
  }, [entries]);

  const formattedClinicDate = useMemo(() => {
    try {
      const d = new Date(clinicDate + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return clinicDate;
    }
  }, [clinicDate]);

  const handlePrintSummary = () => {
    document.body.classList.add('printing-clinical-summary');
    const cleanup = () => {
      document.body.classList.remove('printing-clinical-summary');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Fallback cleanup in case afterprint does not fire in certain preview iframes
    window.setTimeout(cleanup, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-full grid place-items-center shrink-0"
            style={{
              background: 'var(--pastel-lilac-bg)',
              color: 'var(--pastel-lilac-fg)',
            }}
          >
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <div className="text-base font-bold text-[var(--text-primary)] leading-tight">
              Daily Clinical Summary
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-normal">
              Print-ready active patient metrics for {formattedClinicDate}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            Safe Thresholds: BP &lt; {CLINICAL_VITALS_THRESHOLDS.systolic.maxSafe}/
            {CLINICAL_VITALS_THRESHOLDS.diastolic.maxSafe} mmHg · Pulse{' '}
            {CLINICAL_VITALS_THRESHOLDS.pulse.minSafe}–{CLINICAL_VITALS_THRESHOLDS.pulse.maxSafe} bpm
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="neu-pill-btn px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-full cursor-pointer"
            >
              Close
            </button>
            <button
              id="clinical-summary-print-btn"
              type="button"
              onClick={handlePrintSummary}
              className="btn-editorial-primary px-5 py-2 text-xs font-bold rounded-full inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Clinical Summary</span>
            </button>
          </div>
        </div>
      }
    >
      <div id="daily-clinical-summary-sheet" className="clinical-summary-print space-y-5">
        {/* Formal Clinical Letterhead Header */}
        <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent-primary)]">
              Daily Outpatient Metrics Report
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
              {settings?.clinicName || 'Dr. Marcus Johnson Clinical Suite'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Attending: {settings?.doctorName || 'Dr. Marcus Johnson'} ·{' '}
              {settings?.clinicDegree || 'M.B.B.S., M.D. (Internal Medicine)'} · Reg:{' '}
              {settings?.regNumber || 'GMC-1998-4421'}
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs font-bold font-mono text-[var(--text-primary)]">
              Clinic Date: {clinicDate}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {formattedClinicDate}
            </div>
          </div>
        </div>

        {/* Active Patient Aggregate Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className="p-3.5 rounded-[18px] border border-[var(--border-subtle)]"
            style={{ background: 'var(--kpi-lilac-bg)' }}
          >
            <div className="flex items-center justify-between text-[10.5px] font-semibold text-[var(--text-secondary)]">
              <span>Active / Scheduled</span>
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--pastel-lilac-fg)' }} />
            </div>
            <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
              {summaryStats.activeCount}{' '}
              <span className="text-[11px] font-sans font-medium text-[var(--text-muted)]">
                / {summaryStats.totalCount} total
              </span>
            </div>
            <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
              {summaryStats.pendingCount} pending · {summaryStats.dischargedCount} discharged
            </div>
          </div>

          <div
            className="p-3.5 rounded-[18px] border border-[var(--border-subtle)]"
            style={{ background: 'var(--kpi-sky-bg)' }}
          >
            <div className="flex items-center justify-between text-[10.5px] font-semibold text-[var(--text-secondary)]">
              <span>Mean Cohort BP</span>
              <Activity className="w-3.5 h-3.5" style={{ color: 'var(--pastel-blue-fg)' }} />
            </div>
            <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
              {summaryStats.avgBp}
            </div>
            <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
              Across {summaryStats.totalCount} daily encounters
            </div>
          </div>

          <div
            className="p-3.5 rounded-[18px] border border-[var(--border-subtle)]"
            style={{ background: 'var(--kpi-sage-bg)' }}
          >
            <div className="flex items-center justify-between text-[10.5px] font-semibold text-[var(--text-secondary)]">
              <span>Mean Heart Rate</span>
              <Heart className="w-3.5 h-3.5" style={{ color: 'var(--pastel-sage-fg)' }} />
            </div>
            <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
              {summaryStats.avgHr}{' '}
              <span className="text-[11px] font-sans font-medium text-[var(--text-muted)]">
                bpm
              </span>
            </div>
            <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
              OPD Receipts: INR {summaryStats.totalFees.toLocaleString()}
            </div>
          </div>

          <div
            className="p-3.5 rounded-[18px] border border-[var(--border-subtle)]"
            style={{
              background:
                summaryStats.thresholdBreaches.length > 0
                  ? 'var(--kpi-rose-bg)'
                  : 'var(--kpi-lime-bg)',
            }}
          >
            <div className="flex items-center justify-between text-[10.5px] font-semibold text-[var(--text-secondary)]">
              <span>Vitals Alerts</span>
              {summaryStats.thresholdBreaches.length > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--pastel-rose-fg)' }} />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--pastel-sage-fg)' }} />
              )}
            </div>
            <div className="text-xl font-bold font-mono text-[var(--text-primary)] mt-1">
              {summaryStats.thresholdBreaches.length}{' '}
              <span className="text-[11px] font-sans font-medium text-[var(--text-muted)]">
                flagged
              </span>
            </div>
            <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
              {summaryStats.thresholdBreaches.length > 0
                ? 'Requires physician vitals review'
                : 'All vitals within safe bounds'}
            </div>
          </div>
        </div>

        {/* Urgent Vitals Threshold Callout (when any patient exceeds safe thresholds) */}
        {summaryStats.thresholdBreaches.length > 0 && (
          <div
            className="p-3.5 rounded-[16px] border space-y-1.5"
            style={{
              background: 'var(--pastel-rose-bg)',
              borderColor: 'var(--pastel-rose-border)',
            }}
          >
            <div
              className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: 'var(--pastel-rose-fg)' }}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Patients Exceeding Safe Vitals Thresholds ({summaryStats.thresholdBreaches.length})
              </span>
            </div>
            <ul className="space-y-1 text-xs text-[var(--text-primary)]">
              {summaryStats.thresholdBreaches.map((item) => (
                <li key={item.rx.id} className="font-medium">
                  <strong className="font-mono">#{item.rx.sno}</strong>{' '}
                  {item.rx.patientName || `Patient #${item.rx.sno}`} —{' '}
                  <span className="text-[var(--text-secondary)]">
                    {item.evaluation.reasons.join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Print-Ready Active Patient Metrics Table */}
        <div className="vitals-summary-print overflow-x-auto rounded-[18px] border border-[var(--border)]">
          <table className="print-vitals-table w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-muted)] border-b border-[var(--border)] text-[10.5px] uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-2.5 px-3 font-bold">Serial</th>
                <th className="py-2.5 px-3 font-bold">Patient</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
                <th className="py-2.5 px-3 font-bold">Primary Diagnosis</th>
                <th className="py-2.5 px-3 font-bold text-right">BP (mmHg)</th>
                <th className="py-2.5 px-3 font-bold text-right">Pulse</th>
                <th className="py-2.5 px-3 font-bold">Vitals Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {summaryStats.evaluatedRows.map((row) => (
                <tr key={row.rx.id} className="hover:bg-[var(--surface-muted)]/40">
                  <td className="py-2.5 px-3 font-mono font-semibold text-[var(--text-primary)] whitespace-nowrap">
                    #{row.rx.sno}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[var(--text-primary)]">
                      {row.rx.patientName || `Patient #${row.rx.sno}`}
                    </div>
                    {row.computedAge !== null && row.patient && (
                      <div className="text-[10.5px] text-[var(--text-muted)]">
                        {row.computedAge}y · {row.patient.sex}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`${
                        row.status === 'Active'
                          ? 'badge-sage'
                          : row.status === 'Pending Review'
                          ? 'badge-sand'
                          : 'badge-neutral'
                      } px-2 py-0.5 text-[10px] font-semibold`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)] max-w-[220px] truncate">
                    {row.rx.diagonisis}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-right whitespace-nowrap text-[var(--text-primary)]">
                    {row.latestBp}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-right whitespace-nowrap text-[var(--text-primary)]">
                    {row.latestHr} bpm
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {row.evaluation.isBreach ? (
                      <span className="badge-rose px-2 py-0.5 text-[10px] font-bold uppercase">
                        {row.evaluation.severity}
                      </span>
                    ) : (
                      <span className="badge-sage px-2 py-0.5 text-[10px] font-semibold">
                        Within Range
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
