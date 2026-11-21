import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  Stethoscope,
  IndianRupee,
  Pill,
} from 'lucide-react';
import { ClinicDataProvider } from '../services/dataProvider';
import { PrescriptionRecord, PatientRecord } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';
import { formatPrescriptionTreatment } from '../data/krutiDevConverter';

interface TodayClinicViewProps {
  onSelectPatient: (patient: PatientRecord) => void;
  initialDate?: string;
}

export const TodayClinicView: React.FC<TodayClinicViewProps> = ({
  onSelectPatient,
  initialDate = '2026-08-12',
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [dateInput, setDateInput] = useState<string>(initialDate);

  const encounters = useMemo(() => {
    return ClinicDataProvider.getTodayEncounters(selectedDate);
  }, [selectedDate]);

  const totalPatients = encounters.length;
  const totalFees = encounters.reduce((acc, rx) => acc + (rx.feesrecived || 0), 0);
  const isMostRecent = selectedDate === '2026-08-12';

  const handleDateChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateInput) {
      setSelectedDate(dateInput);
    }
  };

  const columns: Column<PrescriptionRecord>[] = [
    {
      key: 'sno',
      header: 'Reg. No.',
      width: 'w-24',
      render: (rx) => (
        <span className="badge-neutral inline-flex items-center font-bold px-2.5 py-0.5 font-mono text-xs">
          #{rx.sno}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient Name',
      render: (rx) => (
        <span className="font-bold text-xs text-[var(--text-primary)]">
          {rx.patientName || `Patient #${rx.sno}`}
        </span>
      ),
    },
    {
      key: 'diagonisis',
      header: 'Clinical Diagnosis',
      render: (rx) => (
        <span className="text-xs text-[var(--text-secondary)] font-medium">
          {rx.diagonisis}
        </span>
      ),
    },
    {
      key: 'treatmentFormatted',
      header: 'Prescribed Medicines / Treatment',
      render: (rx) => {
        const parsed = formatPrescriptionTreatment(rx.treatmentRaw);
        return (
          <div className="max-w-md space-y-1.5">
            <div className="text-xs text-[var(--text-primary)] font-medium flex items-center gap-1.5 truncate">
              <Pill className="w-3.5 h-3.5 text-[var(--pastel-lilac-fg)] shrink-0" />
              <span className="truncate">
                {parsed.medicines.map((m) => `${m.name} (${m.dosage})`).join(' · ') ||
                  rx.treatmentFormatted}
              </span>
            </div>
            {parsed.medicines.length > 0 && parsed.medicines[0].instructionsHindi && (
              <div className="badge-lilac inline-flex items-center text-[11px] px-2.5 py-0.5">
                {parsed.medicines[0].instructionsHindi}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'feesrecived',
      header: 'Consultation Fee',
      width: 'w-32',
      render: (rx) => (
        <span className="badge-sage inline-flex items-center font-bold px-2.5 py-0.5 text-xs font-mono tabular-nums">
          ₹{rx.feesrecived}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      width: 'w-32',
      render: (rx) => (
        <button
          id={`today-view-history-${rx.sno}`}
          onClick={(e) => {
            e.stopPropagation();
            const p = ClinicDataProvider.getPatient(rx.sno);
            if (p) onSelectPatient(p);
          }}
          className="neu-pill-btn px-3.5 py-1.5 text-[var(--accent-text)] font-bold text-xs rounded-full cursor-pointer"
        >
          View History
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Clinic Day Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-lilac px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>
                {isMostRecent ? 'Most Recent Recorded Clinic Day' : 'Historical Clinic Date'}
              </span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Forensic Date Snapshot
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Clinic Day View:{' '}
            {new Date(selectedDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {isMostRecent
              ? 'Showing the most recent recorded clinic day in the extracted database.'
              : `Inspecting historical clinic records for date: ${selectedDate}`}
          </p>
        </div>

        {/* Date Switcher Widget */}
        <form onSubmit={handleDateChange} className="flex items-center gap-2 w-full md:w-auto">
          <input
            id="today-date-picker-input"
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="h-9 px-3.5 text-xs border border-[var(--border)] rounded-full bg-[var(--surface-muted)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            className="btn-editorial-primary h-9 px-4 font-bold text-xs rounded-full cursor-pointer"
          >
            Load Date
          </button>
        </form>
      </div>

      {/* HavenMed-Style Soft Pastel KPI Cards for Selected Day */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          style={{ background: 'var(--kpi-lilac-bg)' }}
          className="neu-card rounded-[22px] p-4 flex items-center gap-3.5"
        >
          <span
            className="w-11 h-11 rounded-full grid place-items-center shrink-0"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--pastel-lilac-fg)',
              boxShadow: 'var(--neu-raised-sm)',
            }}
          >
            <Users className="w-5 h-5" />
          </span>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums leading-none">
              {totalPatients}
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Patients Attended
            </div>
          </div>
        </div>

        <div
          style={{ background: 'var(--kpi-sage-bg)' }}
          className="neu-card rounded-[22px] p-4 flex items-center gap-3.5"
        >
          <span
            className="w-11 h-11 rounded-full grid place-items-center shrink-0"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--pastel-sage-fg)',
              boxShadow: 'var(--neu-raised-sm)',
            }}
          >
            <IndianRupee className="w-5 h-5" />
          </span>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums leading-none">
              ₹{totalFees.toLocaleString()}
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Total Fees Recorded
            </div>
          </div>
        </div>

        <div
          style={{ background: 'var(--kpi-sky-bg)' }}
          className="neu-card rounded-[22px] p-4 flex items-center gap-3.5"
        >
          <span
            className="w-11 h-11 rounded-full grid place-items-center shrink-0"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--pastel-blue-fg)',
              boxShadow: 'var(--neu-raised-sm)',
            }}
          >
            <Stethoscope className="w-5 h-5" />
          </span>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums leading-none">
              100%
            </div>
            <div className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Prescriptions Verified
            </div>
          </div>
        </div>
      </div>

      {/* Main Encounters Data Table */}
      <DataTable
        id="today-encounters-table"
        data={encounters}
        columns={columns}
        defaultPageSize={25}
        exportFilename={`clinic_encounters_${selectedDate}`}
        onRowClick={(rx) => {
          const p = ClinicDataProvider.getPatient(rx.sno);
          if (p) onSelectPatient(p);
        }}
      />
    </div>
  );
};
