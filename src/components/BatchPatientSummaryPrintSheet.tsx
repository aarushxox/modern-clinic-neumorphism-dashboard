import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ClinicSettings,
  PatientClinicalStatus,
  PatientRecord,
  PrescriptionRecord,
} from '../types/clinic';
import { computeCurrentAge } from '../utils/clinicalCalculations';
import {
  evaluateVitalsThresholds,
  parseVitalsFromExamination,
} from '../constants/clinicalConstants';
import { getPatientConditionTags } from '../utils/patientConditions';

export interface BatchSummaryPatientRow {
  patient: PatientRecord;
  status: PatientClinicalStatus;
  visits: PrescriptionRecord[];
}

interface BatchPatientSummaryPrintSheetProps {
  rows: BatchSummaryPatientRow[];
  settings?: ClinicSettings;
  contextLabel?: string;
}

export const BatchPatientSummaryPrintSheet: React.FC<BatchPatientSummaryPrintSheetProps> = ({
  rows,
  settings,
  contextLabel = 'Selected Patient Cohort',
}) => {
  const generatedAt = useMemo(
    () =>
      new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [rows.length]
  );

  const enrichedRows = useMemo(
    () =>
      rows.map(({ patient, status, visits }) => {
        const computedAge = computeCurrentAge(patient);
        const latestVisit = visits[0];
        const parsedVitals = parseVitalsFromExamination(latestVisit?.examination);
        const evaluation = evaluateVitalsThresholds(parsedVitals);
        const conditionTags = getPatientConditionTags(patient, visits);

        return {
          patient,
          status,
          visitsCount: visits.length,
          computedAge,
          latestVisit,
          evaluation,
          conditionTags,
        };
      }),
    [rows]
  );

  if (typeof document === 'undefined' || rows.length === 0) return null;

  const content = (
    <div
      id="batch-patient-summaries-sheet"
      className="batch-summaries-print-sheet hidden"
      aria-hidden="true"
    >
      <div className="pdf-header-block">
        <div>
          <div className="pdf-eyebrow">BATCH PATIENT CLINICAL SUMMARY ARCHIVE</div>
          <h1 className="pdf-clinic-title">
            {settings?.clinicName || 'Dr. Marcus Johnson Clinical Suite'}
          </h1>
          <div className="pdf-clinic-meta">
            Attending: {settings?.doctorName || 'Dr. Marcus Johnson'} (
            {settings?.clinicDegree || 'M.B.B.S., M.D. (Internal Medicine)'}) | Reg:{' '}
            {settings?.regNumber || 'GMC-1998-4421'}
          </div>
        </div>
        <div className="pdf-doc-meta">
          <div>
            <strong>Scope:</strong> {contextLabel}
          </div>
          <div>
            <strong>Selected Records:</strong> {rows.length}
          </div>
          <div>
            <strong>Generated:</strong> {generatedAt}
          </div>
        </div>
      </div>

      <table className="print-vitals-table">
        <thead>
          <tr>
            <th>Reg #</th>
            <th>Patient &amp; Demographics</th>
            <th>Status</th>
            <th>Conditions &amp; Allergies</th>
            <th>Latest Vitals</th>
            <th>Last Encounter</th>
          </tr>
        </thead>
        <tbody>
          {enrichedRows.map((item) => (
            <tr key={item.patient.sno}>
              <td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>#{item.patient.sno}</td>
              <td>
                <div style={{ fontWeight: 700 }}>
                  {item.patient.firstName} {item.patient.lastName}
                </div>
                <div style={{ fontSize: '8.2pt', color: '#475569' }}>
                  {item.computedAge.currentAge}y {item.patient.sex} · {item.patient.phone}
                </div>
              </td>
              <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{item.status}</td>
              <td>
                <div>
                  {item.conditionTags.length > 0
                    ? item.conditionTags.slice(0, 3).join(', ')
                    : 'General OPD'}
                </div>
                {item.patient.allergy && (
                  <div style={{ fontSize: '8pt', color: '#991b1b', fontWeight: 600 }}>
                    Allergy: {item.patient.allergy}
                  </div>
                )}
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                <div>BP: {item.evaluation.bpLabel}</div>
                <div>Pulse: {item.evaluation.pulseLabel}</div>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>
                  {item.latestVisit?.date || item.patient.lastVisitDate}
                </div>
                <div style={{ fontSize: '8.2pt', color: '#475569' }}>
                  {item.latestVisit?.diagonisis || `${item.visitsCount} visits recorded`}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pdf-archival-footer">
        <div>
          <div className="pdf-footer-strong">
            Confidential Clinic Batch Summary — {rows.length} Selected Patient Profiles
          </div>
          <div className="pdf-muted">
            Printed from local read-only clinical workspace for physician review and archival.
          </div>
        </div>
        <div className="pdf-signature-block">
          <div className="pdf-signature-line" />
          <div className="pdf-footer-strong">
            {settings?.doctorName || 'Dr. Marcus Johnson'}
          </div>
          <div className="pdf-muted">
            {settings?.regNumber || 'GMC-1998-4421'}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
