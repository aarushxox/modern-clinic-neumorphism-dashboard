import React, { useState, useMemo } from 'react';
import { PatientRecord } from '../types/clinic';
import { ClinicDataProvider } from '../services/dataProvider';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PatientVitalsChart } from '../components/PatientVitalsChart';
import { VitalsSummaryWidget } from '../components/VitalsSummaryWidget';
import {
  AlertTriangle,
  Calendar,
  Pill,
  ChevronDown,
  ChevronUp,
  Printer,
  History,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import { computeCurrentAge } from '../utils/clinicalCalculations';
import { formatPrescriptionTreatment } from '../data/krutiDevConverter';

interface PatientProfileModalProps {
  patient: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [showRawRtf, setShowRawRtf] = useState<boolean>(false);

  const visits = useMemo(() => {
    if (!patient) return [];
    const list = ClinicDataProvider.getPatientVisits(patient);
    if (list.length > 0 && !expandedVisitId) {
      setExpandedVisitId(list[0].id);
    }
    return list;
  }, [patient]);

  if (!patient) return null;

  const computedAge = computeCurrentAge(patient);

  const handleToggleVisit = (id: string) => {
    setExpandedVisitId((prev) => (prev === id ? null : id));
  };

  const handlePrintPatientReport = () => {
    showToast(
      `Opening formatted clinical report print dialog for Patient #${patient.sno} (${patient.firstName} ${patient.lastName})`,
      'info',
      'Clinical Report'
    );
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center justify-between w-full pr-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                background: 'var(--accent-soft)',
                color: 'var(--accent-text)',
              }}
            >
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight truncate">
                  {patient.firstName} {patient.lastName}
                </h2>
                <span className="badge-lilac px-2.5 py-0.5 text-xs font-bold font-mono shrink-0">
                  Reg #{patient.sno}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                <span className="font-bold text-[var(--text-primary)]">
                  {computedAge.displayAge}
                </span>{' '}
                ({computedAge.recordedAge}y at reg) · {patient.sex} · {patient.guardianName}
              </p>
            </div>
          </div>

          <button
            id="patient-header-print-btn"
            onClick={handlePrintPatientReport}
            className="neu-pill-btn hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[var(--text-primary)] rounded-full shrink-0 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Print Report</span>
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <div className="text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {visits.length} Historical Encounters
            </span>{' '}
            recorded in ledger
          </div>
          <div className="flex items-center gap-2">
            <button
              id="patient-print-report-btn"
              onClick={handlePrintPatientReport}
              className="neu-pill-btn px-4 py-2 text-xs font-bold text-[var(--text-primary)] rounded-full flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Print Patient Report</span>
            </button>
            <button
              id="patient-modal-close-action"
              onClick={onClose}
              className="btn-editorial-primary px-5 py-2 text-xs font-semibold rounded-full cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Prominent Allergy Alert Banner */}
        {patient.allergy ? (
          <div
            className="p-4 rounded-[20px] border flex items-start gap-3"
            style={{
              background: 'var(--pastel-rose-bg)',
              color: 'var(--pastel-rose-fg)',
              borderColor: 'var(--pastel-rose-border)',
            }}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-xs uppercase tracking-wide">
                Critical Known Patient Allergy
              </div>
              <p className="text-sm font-semibold">{patient.allergy}</p>
            </div>
          </div>
        ) : (
          <div
            className="p-3 rounded-[18px] border flex items-center gap-2.5 text-xs font-medium"
            style={{
              background: 'var(--pastel-sage-bg)',
              color: 'var(--pastel-sage-fg)',
              borderColor: 'var(--pastel-sage-border)',
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>No specific drug allergies recorded in historical demographic file.</span>
          </div>
        )}

        {/* Demographics Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--surface-muted)] p-4 rounded-[20px] border border-[var(--border)] text-xs">
          <div>
            <span className="text-[var(--text-muted)] font-medium block">
              Current Age (Calculated)
            </span>
            <span className="font-bold text-[var(--text-primary)]">
              {computedAge.currentAge} yrs
            </span>
            {computedAge.isEstimated && (
              <span className="text-[10px] text-[var(--text-muted)] block">
                (Reg age: {computedAge.recordedAge} yrs)
              </span>
            )}
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-medium block">
              Residential Address
            </span>
            <span
              className="font-semibold text-[var(--text-primary)] truncate block"
              title={patient.address}
            >
              {patient.address}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-medium block">
              First Recorded Visit
            </span>
            <span className="font-bold text-[var(--text-primary)] font-mono">
              {patient.firstVisitDate}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] font-medium block">
              Last Recorded Visit
            </span>
            <span className="font-bold text-[var(--text-primary)] font-mono">
              {patient.lastVisitDate}
            </span>
          </div>
        </div>

        {/* Medical History Note */}
        {patient.history && (
          <div
            className="p-4 rounded-[20px] border text-xs space-y-1"
            style={{
              background: 'var(--pastel-blue-bg)',
              color: 'var(--pastel-blue-fg)',
              borderColor: 'var(--pastel-blue-border)',
            }}
          >
            <span className="font-bold uppercase tracking-wide text-[10px] block">
              Patient Medical History &amp; Background
            </span>
            <p className="leading-relaxed text-[var(--text-primary)]">{patient.history}</p>
          </div>
        )}

        {/* Historical Vitals Recharts Visualization */}
        {visits.length > 0 && <PatientVitalsChart visits={visits} />}

        {/* Print-Optimized Clinical Vitals Summary Table */}
        {visits.length > 0 && (
          <VitalsSummaryWidget
            patient={patient}
            visits={visits}
            onPrint={handlePrintPatientReport}
          />
        )}

        {/* Visit History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Longitudinal Visit History ({visits.length} Encounters)
              </h3>
            </div>
            <button
              onClick={() => setShowRawRtf(!showRawRtf)}
              className="neu-pill-btn text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showRawRtf ? 'Hide Raw RTF' : 'Show Forensic RTF'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {visits.map((visit, idx) => {
              const isExpanded = expandedVisitId === visit.id;
              const isLatest = idx === 0;
              const prevVisit = idx < visits.length - 1 ? visits[idx + 1] : null;
              const isSameDiagnosis = prevVisit && prevVisit.diagonisis === visit.diagonisis;

              const parsedTreatment = formatPrescriptionTreatment(visit.treatmentRaw);

              return (
                <div
                  key={visit.id}
                  className={`rounded-[20px] border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-[var(--surface-elevated)] border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--surface-muted)] border-[var(--border)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  {/* Visit Header Bar */}
                  <div
                    onClick={() => handleToggleVisit(visit.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full grid place-items-center shrink-0"
                        style={
                          isLatest
                            ? {
                                background: 'var(--accent-soft)',
                                color: 'var(--accent-text)',
                              }
                            : {
                                background: 'var(--surface-elevated)',
                                color: 'var(--text-muted)',
                              }
                        }
                      >
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[var(--text-primary)] text-sm">
                            {new Date(visit.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {isLatest && (
                            <span className="badge-blue px-2.5 py-0.5 text-[10px] font-bold">
                              Latest Encounter
                            </span>
                          )}
                          {isSameDiagnosis && (
                            <span className="badge-sand px-2.5 py-0.5 text-[10px] font-semibold">
                              Same diagnosis as previous visit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 truncate max-w-md">
                          {visit.diagonisis}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="badge-sage text-xs font-mono font-bold px-2.5 py-0.5">
                        ₹{visit.feesrecived}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Encounter Details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-[var(--border-subtle)] space-y-4 text-xs bg-[var(--surface-elevated)] animate-in fade-in-50 duration-150">
                      {visit.examination && (
                        <div className="bg-[var(--surface-muted)] p-3.5 rounded-[16px] border border-[var(--border)] space-y-1">
                          <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                            Clinical Examination &amp; Vitals
                          </span>
                          <p className="text-[var(--text-primary)] font-medium">
                            {visit.examination}
                          </p>
                        </div>
                      )}

                      {visit.investigation && (
                        <div className="bg-[var(--surface-muted)] p-3.5 rounded-[16px] border border-[var(--border)] space-y-1">
                          <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                            Diagnostic Investigations &amp; Lab Tests
                          </span>
                          <p className="text-[var(--text-primary)]">{visit.investigation}</p>
                        </div>
                      )}

                      {/* Prescribed Treatment & Hindi Directions */}
                      <div className="space-y-2.5">
                        <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-[var(--pastel-lilac-fg)]" />
                          <span>Prescribed Treatment &amp; Hindi Directions</span>
                        </span>

                        <div className="grid grid-cols-1 gap-2.5">
                          {parsedTreatment.medicines.map((med, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-3.5 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-6 h-6 rounded-full grid place-items-center shrink-0"
                                    style={{
                                      background: 'var(--pastel-lilac-bg)',
                                      color: 'var(--pastel-lilac-fg)',
                                    }}
                                  >
                                    <Pill className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="font-bold text-xs text-[var(--text-primary)]">
                                    {med.type} {med.name}
                                  </span>
                                </div>
                                <span className="badge-lilac text-[10.5px] font-bold px-2.5 py-0.5">
                                  {med.dosage} · {med.frequency}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[var(--border-subtle)]">
                                <span className="badge-blue text-[11px] font-medium px-2.5 py-0.5">
                                  {med.instructionsHindi}
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                                  {med.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Doctor Instructions & Next Visit */}
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[16px] border"
                        style={{
                          background: 'var(--pastel-sand-bg)',
                          borderColor: 'var(--pastel-sand-border)',
                        }}
                      >
                        <div>
                          <span
                            className="font-bold uppercase tracking-wider text-[10px] block"
                            style={{ color: 'var(--pastel-sand-fg)' }}
                          >
                            Dietary &amp; General Advice
                          </span>
                          <p className="text-[var(--text-primary)] mt-1">
                            {visit.instruction || 'Routine follow-up advice.'}
                          </p>
                        </div>
                        <div>
                          <span
                            className="font-bold uppercase tracking-wider text-[10px] block"
                            style={{ color: 'var(--pastel-sand-fg)' }}
                          >
                            Next Follow-up Visit
                          </span>
                          <p className="text-[var(--text-primary)] font-semibold mt-1">
                            {visit.nextvisit || 'SOS as needed'}
                          </p>
                        </div>
                      </div>

                      {/* Forensic Raw RTF View */}
                      {showRawRtf && (
                        <div className="p-3.5 bg-[#0e1017] text-[#94dbb4] font-mono text-[11px] rounded-[16px] overflow-x-auto space-y-1 border border-[var(--border)]">
                          <div className="text-[#8b94a8] font-bold uppercase text-[9px]">
                            Raw Legacy RTF Stream
                          </div>
                          <pre>{visit.treatmentRaw}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
