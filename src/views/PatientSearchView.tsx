import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Users,
  Sparkles,
  X,
  RotateCcw,
  Stethoscope,
  Printer,
  Download,
  CheckSquare,
} from 'lucide-react';
import { ClinicDataProvider, PatientSearchFilter } from '../services/dataProvider';
import {
  ClinicSettings,
  PatientClinicalStatus,
  PatientRecord,
  PrescriptionRecord,
} from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';
import {
  BatchPatientSummaryPrintSheet,
  BatchSummaryPatientRow,
} from '../components/BatchPatientSummaryPrintSheet';
import { useToast } from '../components/Toast';
import { computeCurrentAge } from '../utils/clinicalCalculations';
import {
  COMMON_CLINICAL_CONDITIONS,
  getPatientConditionTags,
} from '../utils/patientConditions';
import {
  evaluateVitalsThresholds,
  parseVitalsFromExamination,
} from '../constants/clinicalConstants';

interface PatientSearchViewProps {
  onSelectPatient: (patient: PatientRecord) => void;
  initialQuery?: string;
  initialAgeCohort?: string;
  settings?: ClinicSettings;
}

interface EnrichedDirectoryPatient extends PatientRecord {
  clinicalStatus: PatientClinicalStatus;
  conditionTags: string[];
  visits: PrescriptionRecord[];
}

export const PatientSearchView: React.FC<PatientSearchViewProps> = ({
  onSelectPatient,
  initialQuery = '',
  initialAgeCohort = 'ALL',
  settings,
}) => {
  const { showToast } = useToast();
  const [query, setQuery] = useState<string>(initialQuery);
  const [conditionQuery, setConditionQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<PatientSearchFilter['sortBy']>('serial-desc');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [ageCohortFilter, setAgeCohortFilter] = useState<string>(initialAgeCohort);
  const [statusFilter, setStatusFilter] = useState<'ALL' | PatientClinicalStatus>('ALL');
  const [statusVersion, setStatusVersion] = useState<number>(0);

  // Bulk Action Selection State
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string | number>>(new Set());
  const [batchTargetStatus, setBatchTargetStatus] =
    useState<PatientClinicalStatus>('Pending Review');

  const searchResults: EnrichedDirectoryPatient[] = useMemo(() => {
    const res = ClinicDataProvider.searchPatients(
      {
        query,
        condition: conditionQuery.trim() || undefined,
        sortBy,
        gender: genderFilter !== 'ALL' ? genderFilter : undefined,
      },
      1,
      150
    );

    let items = res.items;

    if (ageCohortFilter !== 'ALL') {
      items = items.filter((p) => {
        const computed = computeCurrentAge(p);
        const age = computed.currentAge;
        if (ageCohortFilter === '0-18') return age >= 0 && age <= 18;
        if (ageCohortFilter === '19-35') return age >= 19 && age <= 35;
        if (ageCohortFilter === '36-60') return age >= 36 && age <= 60;
        if (ageCohortFilter === '0-10') return age <= 10;
        if (ageCohortFilter === '11-20') return age > 10 && age <= 20;
        if (ageCohortFilter === '21-40') return age > 20 && age <= 40;
        if (ageCohortFilter === '41-60') return age > 40 && age <= 60;
        if (ageCohortFilter === '60+') return age > 60;
        return true;
      });
    }

    const enriched: EnrichedDirectoryPatient[] = items.map((p) => {
      const visits = ClinicDataProvider.getPatientVisits(p);
      const clinicalStatus = ClinicDataProvider.getPatientStatus(p);
      const conditionTags = getPatientConditionTags(p, visits);
      return {
        ...p,
        clinicalStatus,
        conditionTags,
        visits,
      };
    });

    if (statusFilter !== 'ALL') {
      return enriched.filter((p) => p.clinicalStatus === statusFilter);
    }

    return enriched;
  }, [query, conditionQuery, sortBy, genderFilter, ageCohortFilter, statusFilter, statusVersion]);

  // Prune any selected IDs that are no longer in the filtered result set
  useEffect(() => {
    setSelectedRowIds((prev) => {
      if (prev.size === 0) return prev;
      const available = new Set<string | number>(searchResults.map((p) => p.sno));
      const next = new Set<string | number>();
      prev.forEach((id) => {
        if (available.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [searchResults]);

  const selectedPatients = useMemo(
    () => searchResults.filter((p) => selectedRowIds.has(p.sno)),
    [searchResults, selectedRowIds]
  );

  const batchPrintRows: BatchSummaryPatientRow[] = useMemo(
    () =>
      selectedPatients.map((p) => ({
        patient: p,
        status: p.clinicalStatus,
        visits: p.visits,
      })),
    [selectedPatients]
  );

  const isSearchEmpty = !query.trim() && !conditionQuery.trim();
  const recent5Patients = useMemo(() => searchResults.slice(0, 5), [searchResults]);

  const hasActiveFilters =
    query.trim() !== '' ||
    conditionQuery.trim() !== '' ||
    genderFilter !== 'ALL' ||
    ageCohortFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    sortBy !== 'serial-desc';

  const handleClearAllFilters = () => {
    setQuery('');
    setConditionQuery('');
    setGenderFilter('ALL');
    setAgeCohortFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('serial-desc');
    setSelectedRowIds(new Set());
  };

  const handleToggleRow = (rowId: string | number) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const handleToggleSelectAllVisible = (
    visibleIds: (string | number)[],
    shouldSelect: boolean
  ) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      visibleIds.forEach((id) => {
        if (shouldSelect) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleSelectAllMatching = () => {
    setSelectedRowIds(new Set(searchResults.map((p) => p.sno)));
  };

  const handleClearSelection = () => {
    setSelectedRowIds(new Set());
  };

  const handleBulkPrintSummaries = () => {
    if (selectedPatients.length === 0) return;
    const previousTitle = document.title;
    document.title = `Batch-Patient-Summaries-${selectedPatients.length}-Records`;
    document.body.classList.add('printing-batch-summaries');

    showToast(
      `Prepared print-ready clinical summary sheet for ${selectedPatients.length} selected patients.`,
      'info',
      'Batch Print Ready'
    );

    const cleanup = () => {
      document.body.classList.remove('printing-batch-summaries');
      document.title = previousTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.setTimeout(() => {
      window.print();
    }, 120);
    window.setTimeout(cleanup, 1800);
  };

  const handleBulkExportCsv = () => {
    if (selectedPatients.length === 0) return;

    const escapeCsv = (value: string | number | null | undefined): string => {
      const str = value === null || value === undefined ? '' : String(value);
      if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Serial No',
      'Patient Name',
      'Guardian',
      'Clinical Status',
      'Current Age',
      'Sex',
      'Phone',
      'Address',
      'Recorded Conditions',
      'Allergies',
      'Latest BP',
      'Latest Pulse',
      'Total Encounters',
      'Last Visit Date',
    ];

    const rows = selectedPatients.map((p) => {
      const computedAge = computeCurrentAge(p).currentAge;
      const latestVisit = p.visits[0];
      const evalVitals = evaluateVitalsThresholds(
        parseVitalsFromExamination(latestVisit?.examination)
      );
      return [
        p.sno,
        `${p.firstName} ${p.lastName}`,
        p.guardianName,
        p.clinicalStatus,
        computedAge,
        p.sex,
        p.phone,
        p.address,
        p.conditionTags.join('; '),
        p.allergy || 'None',
        evalVitals.bpLabel,
        evalVitals.pulseLabel,
        p.totalVisits,
        p.lastVisitDate,
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `selected-patients-batch-${selectedPatients.length}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Exported ${selectedPatients.length} selected patient records to ${fileName}.`,
      'success',
      'Batch CSV Exported'
    );
  };

  const handleBulkStatusUpdate = () => {
    if (selectedPatients.length === 0) return;
    const snos = selectedPatients.map((p) => p.sno);
    const updatedCount = ClinicDataProvider.updatePatientStatusesBatch(snos, batchTargetStatus);
    setStatusVersion((v) => v + 1);
    showToast(
      `Updated clinical status to "${batchTargetStatus}" for ${updatedCount} selected patients.`,
      'success',
      'Batch Status Updated'
    );
  };

  const getStatusBadgeClass = (status: PatientClinicalStatus) => {
    if (status === 'Active') return 'badge-sage';
    if (status === 'Pending Review') return 'badge-sand';
    return 'badge-neutral';
  };

  const columns: Column<EnrichedDirectoryPatient>[] = [
    {
      key: 'sno',
      header: 'Reg. No.',
      width: 'w-24',
      render: (p) => (
        <span className="badge-neutral inline-flex items-center font-bold px-2.5 py-0.5 font-mono text-xs">
          #{p.sno}
        </span>
      ),
    },
    {
      key: 'firstName',
      header: 'Patient Full Name & Guardian',
      render: (p) => (
        <div>
          <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 text-xs flex-wrap">
            <span>
              {p.firstName} {p.lastName}
            </span>
            {p.allergy && (
              <span className="badge-rose px-2 py-0.5 text-[9.5px] font-bold">
                ALLERGY
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">{p.guardianName}</div>
        </div>
      ),
    },
    {
      key: 'clinicalStatus',
      header: 'Status',
      width: 'w-32',
      render: (p) => (
        <span
          className={`${getStatusBadgeClass(
            p.clinicalStatus
          )} inline-flex items-center px-2.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap`}
        >
          {p.clinicalStatus}
        </span>
      ),
    },
    {
      key: 'conditionTags',
      header: 'Clinical Conditions',
      sortable: false,
      render: (p) => (
        <div className="flex flex-wrap gap-1 max-w-[230px]">
          {p.conditionTags.slice(0, 2).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConditionQuery(tag);
              }}
              className="badge-blue px-2 py-0.5 text-[10px] font-semibold cursor-pointer hover:opacity-85 transition-opacity"
              title={`Filter directory by ${tag}`}
            >
              {tag}
            </button>
          ))}
          {p.conditionTags.length > 2 && (
            <span className="badge-neutral px-1.5 py-0.5 text-[10px] font-medium">
              +{p.conditionTags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ageYears',
      header: 'Age & Sex',
      width: 'w-32',
      render: (p) => {
        const computed = computeCurrentAge(p);
        return (
          <div className="text-xs">
            <span className="font-bold text-[var(--text-primary)]">
              {computed.currentAge} yrs
            </span>
            <span className="text-[var(--text-muted)]"> ({p.sex})</span>
            {computed.isEstimated && (
              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                Reg: {p.ageYears}y
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Contact & Area',
      render: (p) => (
        <div className="text-xs space-y-0.5 max-w-[190px] truncate">
          <div className="font-mono text-[var(--text-primary)] font-medium">{p.phone}</div>
          <div className="truncate text-[var(--text-muted)] text-[11px]">{p.address}</div>
        </div>
      ),
    },
    {
      key: 'totalVisits',
      header: 'History',
      width: 'w-28',
      render: (p) => (
        <div className="text-xs">
          <div className="font-bold text-[var(--text-primary)]">
            {p.totalVisits} Visits
          </div>
          <div className="text-[var(--text-muted)] text-[10px] font-mono">
            {p.lastVisitDate}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      width: 'w-28',
      render: (p) => (
        <button
          id={`search-view-profile-${p.sno}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPatient(p);
          }}
          className="neu-pill-btn px-3 py-1.5 text-[var(--accent-text)] font-bold text-xs rounded-full cursor-pointer whitespace-nowrap"
        >
          View Profile
        </button>
      ),
    },
  ];

  const floatingBulkToolbar =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {selectedPatients.length > 0 && (
              <motion.div
                id="directory-floating-bulk-toolbar"
                role="region"
                aria-label="Bulk patient actions toolbar"
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  backgroundColor: 'var(--surface-elevated)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 18px 42px rgba(15, 23, 42, 0.22), var(--neu-raised)',
                }}
                className="no-print fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[min(calc(100vw-1.5rem),880px)] rounded-[24px] border px-4 sm:px-5 py-3 backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Selection Counter + Quick Select/Clear */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="badge-lilac px-3 py-1 font-bold inline-flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span className="font-mono tabular-nums">
                        {selectedPatients.length}
                      </span>
                      <span>
                        {selectedPatients.length === 1 ? 'patient selected' : 'patients selected'}
                      </span>
                    </span>

                    {selectedPatients.length < searchResults.length && (
                      <button
                        type="button"
                        onClick={handleSelectAllMatching}
                        className="text-[11px] font-semibold hover:underline cursor-pointer px-1"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        Select all {searchResults.length}
                      </button>
                    )}

                    <button
                      id="directory-bulk-clear-btn"
                      type="button"
                      onClick={handleClearSelection}
                      className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                      title="Clear selection"
                      aria-label="Clear selected patients"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right: Batch Operations (Print, Export CSV, Update Status) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="directory-bulk-print-btn"
                      type="button"
                      onClick={handleBulkPrintSummaries}
                      className="neu-pill-btn h-9 px-3.5 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer touch-manipulation"
                    >
                      <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Print</span>
                    </button>

                    <button
                      id="directory-bulk-csv-btn"
                      type="button"
                      onClick={handleBulkExportCsv}
                      className="neu-pill-btn h-9 px-3.5 rounded-full text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-1.5 cursor-pointer touch-manipulation"
                    >
                      <Download className="w-3.5 h-3.5 text-[var(--success)]" />
                      <span>Export CSV</span>
                    </button>

                    <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--border)]">
                      <select
                        id="directory-bulk-status-select"
                        value={batchTargetStatus}
                        onChange={(e) =>
                          setBatchTargetStatus(e.target.value as PatientClinicalStatus)
                        }
                        aria-label="Target batch clinical status"
                        className="h-9 px-3 rounded-full text-xs font-semibold bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                      >
                        <option value="Active">Set Active</option>
                        <option value="Pending Review">Set Pending Review</option>
                        <option value="Discharged">Set Discharged</option>
                      </select>
                      <button
                        id="directory-bulk-status-apply-btn"
                        type="button"
                        onClick={handleBulkStatusUpdate}
                        className="btn-editorial-primary h-9 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer touch-manipulation"
                      >
                        <span>Update Status</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <div className={`space-y-5 ${selectedPatients.length > 0 ? 'pb-24' : ''}`}>
      {/* Floating Bulk Action Toolbar (portaled to document.body for true viewport anchoring) */}
      {floatingBulkToolbar}

      {/* Portaled Print Sheet for Batch Patient Summaries */}
      <BatchPatientSummaryPrintSheet
        rows={batchPrintRows}
        settings={settings}
        contextLabel={
          conditionQuery.trim()
            ? `Directory Cohort (${conditionQuery.trim()})`
            : 'Patients Directory Selection'
        }
      />

      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-lilac px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Patients Directory</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              43,488 Total Master Profiles
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Patient Search &amp; Longitudinal Ledger
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Search by patient identity or clinical condition/symptoms, and select multiple rows for batch printing, CSV export, or status updates.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="badge-rose px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 self-start md:self-auto cursor-pointer hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="neu-card rounded-[24px] p-5 space-y-4">
        {/* Dual Search Row: General Identity + Search by Condition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="patient-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Name, Reg # (e.g. 52530), Guardian, Phone, or Area..."
              className="neu-inset w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                aria-label="Clear general search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <Stethoscope className="w-4 h-4 text-[var(--accent-primary)] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="patient-condition-search-input"
              type="text"
              value={conditionQuery}
              onChange={(e) => setConditionQuery(e.target.value)}
              placeholder="Search by Condition or Symptom (e.g. Hypertension, Diabetes, Typhoid, Dysuria)..."
              className="neu-inset w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
            />
            {conditionQuery && (
              <button
                type="button"
                onClick={() => setConditionQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
                aria-label="Clear condition filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Common Clinical Diagnoses & Symptom Quick-Filter Tags */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Search by Condition (Common Diagnoses &amp; Symptom Tags):</span>
            </span>
            {conditionQuery && (
              <button
                type="button"
                onClick={() => setConditionQuery('')}
                className="text-[11px] font-semibold hover:underline cursor-pointer"
                style={{ color: 'var(--accent-text)' }}
              >
                Clear condition
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {COMMON_CLINICAL_CONDITIONS.map((preset) => {
              const isSelected =
                conditionQuery.trim().toLowerCase() === preset.label.toLowerCase() ||
                conditionQuery.trim().toLowerCase() === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`condition-tag-${preset.id}`}
                  type="button"
                  onClick={() =>
                    setConditionQuery(isSelected ? '' : preset.label)
                  }
                  style={
                    isSelected
                      ? {
                          background: 'var(--accent-primary)',
                          color: '#ffffff',
                          borderColor: 'transparent',
                        }
                      : undefined
                  }
                  className={`px-3 py-1 rounded-full text-[11px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'font-bold shadow-xs'
                      : 'border-[var(--border)] bg-[var(--surface-muted)]/70 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] font-medium'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1 border-t border-[var(--border-subtle)]">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Sex Filter
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="ALL">All Sexes (Male &amp; Female)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Current Calculated Age
            </label>
            <select
              value={ageCohortFilter}
              onChange={(e) => setAgeCohortFilter(e.target.value)}
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="ALL">All Age Ranges</option>
              <option value="0-18">Pediatric &amp; Youth (0–18 yrs)</option>
              <option value="19-35">Young Adults (19–35 yrs)</option>
              <option value="36-60">Working Adults (36–60 yrs)</option>
              <option value="60+">Senior / Geriatric (60+ yrs)</option>
              <option value="0-10">Pediatric (0–10 yrs)</option>
              <option value="11-20">Adolescent (11–20 yrs)</option>
              <option value="21-40">Young Adult (21–40 yrs)</option>
              <option value="41-60">Middle Aged (41–60 yrs)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Clinical Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'ALL' | PatientClinicalStatus)
              }
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as PatientSearchFilter['sortBy'])
              }
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="serial-desc">Registration # (Newest to Oldest)</option>
              <option value="serial-asc">Registration # (Oldest to Newest)</option>
              <option value="name-asc">Patient Name (A to Z)</option>
              <option value="name-desc">Patient Name (Z to A)</option>
              <option value="visits-desc">Most Frequent Visits</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-subtle)] text-xs">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Active filters:
            </span>
            {query.trim() && (
              <span className="badge-lilac inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Query: &ldquo;{query}&rdquo;
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {conditionQuery.trim() && (
              <span className="badge-sage inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Condition: {conditionQuery.trim()}
                <button
                  type="button"
                  onClick={() => setConditionQuery('')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {genderFilter !== 'ALL' && (
              <span className="badge-blue inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Sex: {genderFilter}
                <button
                  type="button"
                  onClick={() => setGenderFilter('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {ageCohortFilter !== 'ALL' && (
              <span className="badge-sand inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Age: {ageCohortFilter} yrs
                <button
                  type="button"
                  onClick={() => setAgeCohortFilter('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="badge-lilac inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== 'serial-desc' && (
              <span className="badge-neutral inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Sort: {sortBy}
                <button
                  type="button"
                  onClick={() => setSortBy('serial-desc')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5 Most Recently Active Patients */}
      {isSearchEmpty && (
        <div className="neu-card rounded-[24px] p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Recently Active Patients (Latest August 2026 Encounters)
              </h3>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              5 Active Profiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {recent5Patients.map((p) => {
              const computed = computeCurrentAge(p);
              return (
                <div
                  key={p.sno}
                  onClick={() => onSelectPatient(p)}
                  className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="badge-neutral font-bold text-[10px] px-2 py-0.5 font-mono">
                      #{p.sno}
                    </span>
                    <span className="badge-sage text-[10px] font-bold px-2 py-0.5">
                      {p.totalVisits} visits
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)] truncate">
                    {computed.currentAge} yrs · {p.sex}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Patients Data Table with Multi-Select Checkboxes & Floating Bulk Action Toolbar */}
      <DataTable
        id="patients-search-table"
        title="Patient Records Ledger"
        subtitle={
          selectedPatients.length > 0
            ? `${searchResults.length.toLocaleString()} matching profiles · ${selectedPatients.length} selected in floating bulk toolbar`
            : `${searchResults.length.toLocaleString()} matching profiles · Select checkboxes to open the floating bulk action toolbar`
        }
        data={searchResults}
        columns={columns}
        defaultPageSize={25}
        exportFilename="patients_ledger_export.csv"
        onRowClick={(p) => onSelectPatient(p)}
        selectable={true}
        getRowId={(p) => p.sno}
        selectedRowIds={selectedRowIds}
        onToggleRow={handleToggleRow}
        onToggleSelectAllVisible={handleToggleSelectAllVisible}
      />
    </div>
  );
};
