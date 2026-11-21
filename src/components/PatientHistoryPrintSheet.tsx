import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ClinicSettings, PatientRecord, PrescriptionRecord } from '../types/clinic';
import { computeCurrentAge } from '../utils/clinicalCalculations';
import { formatPrescriptionTreatment } from '../data/krutiDevConverter';
import {
  CLINICAL_VITALS_THRESHOLDS,
  evaluateVitalsThresholds,
  parseVitalsFromExamination,
  VitalsEvaluationResult,
} from '../constants/clinicalConstants';

export interface ArchivalVitalsRow {
  visitId: string;
  date: string;
  diagnosis: string;
  bpLabel: string;
  pulseLabel: string;
  examination: string;
  evaluation: VitalsEvaluationResult;
}

export interface PatientArchivalSummary {
  totalEncounters: number;
  vitalsRows: ArchivalVitalsRow[];
  meanSystolic: number | null;
  meanDiastolic: number | null;
  meanPulse: number | null;
  peakSystolic: number | null;
  breachCount: number;
  uniqueDiagnoses: string[];
  totalFees: number;
  medicalHistoryNotes: string[];
}

/**
 * Pure clinical aggregation used to produce the structured archival PDF history
 * summarizing all vitals, medical history, and chronological prescriptions.
 */
export function buildPatientArchivalSummary(
  patient: PatientRecord,
  visits: PrescriptionRecord[]
): PatientArchivalSummary {
  const vitalsRows: ArchivalVitalsRow[] = [];
  const systolicValues: number[] = [];
  const diastolicValues: number[] = [];
  const pulseValues: number[] = [];
  const diagnosesSet = new Set<string>();
  const historyNotesSet = new Set<string>();

  if (patient.history && patient.history.trim()) {
    historyNotesSet.add(patient.history.trim());
  }

  let totalFees = 0;

  visits.forEach((visit) => {
    totalFees += Number(visit.feesrecived) || 0;
    if (visit.diagonisis && visit.diagonisis.trim()) {
      diagnosesSet.add(visit.diagonisis.trim());
    }
    if (visit.phistory && visit.phistory.trim()) {
      historyNotesSet.add(visit.phistory.trim());
    }
    if (visit.prevhist && visit.prevhist.trim()) {
      historyNotesSet.add(visit.prevhist.trim());
    }

    const parsed = parseVitalsFromExamination(visit.examination);
    const evaluation = evaluateVitalsThresholds(parsed);

    if (typeof parsed.systolic === 'number') systolicValues.push(parsed.systolic);
    if (typeof parsed.diastolic === 'number') diastolicValues.push(parsed.diastolic);
    if (typeof parsed.pulse === 'number') pulseValues.push(parsed.pulse);

    vitalsRows.push({
      visitId: visit.id,
      date: visit.date,
      diagnosis: visit.diagonisis,
      bpLabel: evaluation.bpLabel,
      pulseLabel: evaluation.pulseLabel,
      examination: visit.examination || 'Not recorded',
      evaluation,
    });
  });

  const avg = (arr: number[]): number | null =>
    arr.length > 0 ? Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length) : null;

  return {
    totalEncounters: visits.length,
    vitalsRows,
    meanSystolic: avg(systolicValues),
    meanDiastolic: avg(diastolicValues),
    meanPulse: avg(pulseValues),
    peakSystolic: systolicValues.length > 0 ? Math.max(...systolicValues) : null,
    breachCount: vitalsRows.filter((r) => r.evaluation.isBreach).length,
    uniqueDiagnoses: Array.from(diagnosesSet),
    totalFees,
    medicalHistoryNotes: Array.from(historyNotesSet),
  };
}

interface PatientHistoryPrintSheetProps {
  patient: PatientRecord;
  visits: PrescriptionRecord[];
  settings?: ClinicSettings;
}

export const PatientHistoryPrintSheet: React.FC<PatientHistoryPrintSheetProps> = ({
  patient,
  visits,
  settings,
}) => {
  const computedAge = useMemo(() => computeCurrentAge(patient), [patient]);
  const summary = useMemo(
    () => buildPatientArchivalSummary(patient, visits),
    [patient, visits]
  );

  const generatedTimestamp = useMemo(() => {
    return new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [patient.sno, visits.length]);

  const content = (
    <div
      id="patient-pdf-history-sheet"
      className="patient-history-print-sheet hidden"
      aria-hidden="true"
    >
      {/* Formal Archival Clinical Letterhead */}
      <div className="pdf-header-block">
        <div>
          <div className="pdf-eyebrow">LONGITUDINAL PATIENT MEDICAL ARCHIVE</div>
          <h1 className="pdf-clinic-title">
            {settings?.clinicName || 'Dr. Marcus Johnson Clinical Suite'}
          </h1>
          <div className="pdf-clinic-meta">
            Attending Physician: {settings?.doctorName || 'Dr. Marcus Johnson'} (
            {settings?.clinicDegree || 'M.B.B.S., M.D. (Internal Medicine)'})
          </div>
          <div className="pdf-clinic-meta">
            Reg. No.: {settings?.regNumber || 'GMC-1998-4421'} |{' '}
            {settings?.clinicAddress || 'Main Avenue, Medical Plaza, Suite 204'} | Tel:{' '}
            {settings?.clinicPhone || '9839000000'}
          </div>
        </div>
        <div className="pdf-doc-meta">
          <div>
            <strong>Archive ID:</strong> ARCH-REG-{patient.sno}
          </div>
          <div>
            <strong>Generated:</strong> {generatedTimestamp}
          </div>
          <div>
            <strong>Encounters:</strong> {summary.totalEncounters}
          </div>
        </div>
      </div>

      {/* Section 1: Patient Identification & Demographics */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">1. Patient Identification &amp; Demographics</h2>
        <table className="pdf-kv-table">
          <tbody>
            <tr>
              <th>Full Name</th>
              <td>
                <strong>
                  {patient.firstName} {patient.lastName}
                </strong>
              </td>
              <th>Registration Serial</th>
              <td>#{patient.sno}</td>
            </tr>
            <tr>
              <th>Current Age / Sex</th>
              <td>
                {computedAge.currentAge} yrs ({patient.sex})
                {computedAge.isEstimated ? ` [Reg. age: ${computedAge.recordedAge}y]` : ''}
              </td>
              <th>Guardian / Relative</th>
              <td>{patient.guardianName || 'Not specified'}</td>
            </tr>
            <tr>
              <th>Contact Telephone</th>
              <td>{patient.phone || 'Not recorded'}</td>
              <th>Residential Address</th>
              <td>{patient.address || 'Not recorded'}</td>
            </tr>
            <tr>
              <th>First Recorded Visit</th>
              <td>{patient.firstVisitDate}</td>
              <th>Last Recorded Visit</th>
              <td>{patient.lastVisitDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: Allergy Profile & Medical History */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">2. Allergy Profile &amp; Clinical Medical History</h2>
        <div className={patient.allergy ? 'pdf-alert-box pdf-alert-danger' : 'pdf-alert-box'}>
          <strong>Known Drug / Clinical Allergies: </strong>
          {patient.allergy
            ? patient.allergy
            : 'No specific drug allergies recorded in demographic archive.'}
        </div>

        <div className="pdf-history-grid">
          <div className="pdf-box">
            <div className="pdf-box-label">Longitudinal Medical History &amp; Background</div>
            {summary.medicalHistoryNotes.length > 0 ? (
              <ul className="pdf-list">
                {summary.medicalHistoryNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="pdf-muted">
                No chronic background history notes documented in baseline intake file.
              </p>
            )}
          </div>

          <div className="pdf-box">
            <div className="pdf-box-label">Recorded Primary Diagnoses ({summary.uniqueDiagnoses.length})</div>
            {summary.uniqueDiagnoses.length > 0 ? (
              <ul className="pdf-list">
                {summary.uniqueDiagnoses.map((dx, idx) => (
                  <li key={idx}>{dx}</li>
                ))}
              </ul>
            ) : (
              <p className="pdf-muted">No diagnoses recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Patient Vitals Summary & Safety Audit */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">3. Longitudinal Vitals Summary &amp; Threshold Audit</h2>
        <div className="pdf-kpi-row">
          <div className="pdf-kpi-cell">
            <div className="pdf-box-label">Mean Blood Pressure</div>
            <div className="pdf-kpi-value">
              {summary.meanSystolic !== null && summary.meanDiastolic !== null
                ? `${summary.meanSystolic}/${summary.meanDiastolic} mmHg`
                : 'N/A'}
            </div>
          </div>
          <div className="pdf-kpi-cell">
            <div className="pdf-box-label">Peak Systolic BP</div>
            <div className="pdf-kpi-value">
              {summary.peakSystolic !== null ? `${summary.peakSystolic} mmHg` : 'N/A'}
            </div>
          </div>
          <div className="pdf-kpi-cell">
            <div className="pdf-box-label">Mean Pulse Rate</div>
            <div className="pdf-kpi-value">
              {summary.meanPulse !== null ? `${summary.meanPulse} bpm` : 'N/A'}
            </div>
          </div>
          <div className="pdf-kpi-cell">
            <div className="pdf-box-label">Threshold Alerts</div>
            <div className="pdf-kpi-value">
              {summary.breachCount} / {summary.vitalsRows.length} visits
            </div>
          </div>
        </div>

        <p className="pdf-threshold-note">
          Clinical Reference Bounds: BP &lt; {CLINICAL_VITALS_THRESHOLDS.systolic.maxSafe}/
          {CLINICAL_VITALS_THRESHOLDS.diastolic.maxSafe} mmHg | Pulse{' '}
          {CLINICAL_VITALS_THRESHOLDS.pulse.minSafe}-{CLINICAL_VITALS_THRESHOLDS.pulse.maxSafe} bpm
        </p>

        {summary.vitalsRows.length > 0 ? (
          <table className="print-vitals-table">
            <thead>
              <tr>
                <th>Visit Date</th>
                <th>Blood Pressure</th>
                <th>Pulse</th>
                <th>Threshold Status</th>
                <th>Clinical Examination Findings</th>
              </tr>
            </thead>
            <tbody>
              {summary.vitalsRows.map((row) => (
                <tr key={row.visitId}>
                  <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.bpLabel}</td>
                  <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.pulseLabel}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {row.evaluation.isBreach
                      ? `${row.evaluation.severity.toUpperCase()}`
                      : 'Within Range'}
                  </td>
                  <td>{row.examination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="pdf-muted">No clinical vitals recorded across archive visits.</p>
        )}
      </div>

      {/* Section 4: Chronological Prescriptions & Past Encounters */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">
          4. Complete Past Prescriptions &amp; Clinical Encounters ({visits.length})
        </h2>

        {visits.length === 0 ? (
          <p className="pdf-muted">No historical encounters found for this patient.</p>
        ) : (
          <div className="pdf-encounters-list">
            {visits.map((visit, idx) => {
              const parsedTreatment = formatPrescriptionTreatment(visit.treatmentRaw);
              return (
                <div key={visit.id} className="pdf-encounter-card">
                  <div className="pdf-encounter-header">
                    <div>
                      <strong>
                        Encounter #{visits.length - idx} — {visit.date}
                      </strong>
                      <span className="pdf-encounter-dx"> | Diagnosis: {visit.diagonisis}</span>
                    </div>
                    <div className="pdf-encounter-fee">Fee: INR {visit.feesrecived}</div>
                  </div>

                  {visit.examination && (
                    <div className="pdf-encounter-line">
                      <strong>Examination &amp; Vitals:</strong> {visit.examination}
                    </div>
                  )}

                  {visit.investigation && (
                    <div className="pdf-encounter-line">
                      <strong>Investigations / Labs:</strong> {visit.investigation}
                    </div>
                  )}

                  {parsedTreatment.medicines.length > 0 ? (
                    <table className="print-vitals-table pdf-rx-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage &amp; Frequency</th>
                          <th>Duration</th>
                          <th>Patient Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedTreatment.medicines.map((med, mIdx) => (
                          <tr key={mIdx}>
                            <td style={{ fontWeight: 600 }}>
                              {med.type} {med.name}
                            </td>
                            <td>
                              {med.dosage} ({med.frequency})
                            </td>
                            <td>{med.duration}</td>
                            <td>{med.instructionsHindi || 'As directed by physician'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="pdf-encounter-line">
                      <strong>Treatment Summary:</strong>{' '}
                      {visit.treatmentFormatted || visit.treatmentRaw || 'No medications listed'}
                    </div>
                  )}

                  <div className="pdf-encounter-footer-row">
                    <span>
                      <strong>Advice:</strong> {visit.instruction || 'Routine follow-up advice.'}
                    </span>
                    <span>
                      <strong>Next Visit:</strong> {visit.nextvisit || 'SOS as needed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archival Sign-off Footer */}
      <div className="pdf-archival-footer">
        <div>
          <div className="pdf-footer-strong">
            Confidential Medical Record — Archival Copy Only
          </div>
          <div className="pdf-muted">
            Generated from verified longitudinal clinic ledger (Reg #{patient.sno} ·{' '}
            {summary.totalEncounters} encounters · Total recorded fees INR{' '}
            {summary.totalFees.toLocaleString()}).
          </div>
        </div>
        <div className="pdf-signature-block">
          <div className="pdf-signature-line" />
          <div className="pdf-footer-strong">
            {settings?.doctorName || 'Dr. Marcus Johnson'}
          </div>
          <div className="pdf-muted">
            {settings?.clinicDegree || 'M.B.B.S., M.D. (Internal Medicine)'} ·{' '}
            {settings?.regNumber || 'GMC-1998-4421'}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};
