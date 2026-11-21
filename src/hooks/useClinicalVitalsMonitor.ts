import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useToast } from '../components/Toast';
import {
  evaluateVitalsThresholds,
  parseVitalsFromExamination,
  VitalsEvaluationResult,
} from '../constants/clinicalConstants';

export interface IncomingClinicalVitalsRecord {
  id: string;
  patientSno: number;
  patientName: string;
  date?: string;
  examination?: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
}

export interface ClinicalVitalsAlert {
  recordId: string;
  patientSno: number;
  patientName: string;
  date?: string;
  evaluation: VitalsEvaluationResult;
}

interface UseClinicalVitalsMonitorOptions {
  /** Scope identifier (e.g., active clinic date or patient serial) to cleanly track alerted items */
  scopeKey: string;
  /** Disable automatic toast firing while still computing live alerts */
  enabled?: boolean;
  /** Maximum urgent toasts emitted in a single incoming batch */
  maxToastsPerBatch?: number;
}

/**
 * Monitors incoming clinical records against CLINICAL_VITALS_THRESHOLDS (BP / Pulse)
 * and emits an urgent, styled toast notification whenever safe bounds are exceeded.
 */
export function useClinicalVitalsMonitor(
  records: IncomingClinicalVitalsRecord[],
  options: UseClinicalVitalsMonitorOptions
) {
  const { showToast } = useToast();
  const { scopeKey, enabled = true, maxToastsPerBatch = 1 } = options;
  const alertedKeysRef = useRef<Set<string>>(new Set());

  const alerts = useMemo<ClinicalVitalsAlert[]>(() => {
    const breaches: ClinicalVitalsAlert[] = [];

    for (const rec of records) {
      const parsed = parseVitalsFromExamination(rec.examination);
      const systolic = rec.systolic ?? parsed.systolic;
      const diastolic = rec.diastolic ?? parsed.diastolic;
      const pulse = rec.pulse ?? parsed.pulse;

      const evaluation = evaluateVitalsThresholds({ systolic, diastolic, pulse });
      if (evaluation.isBreach) {
        breaches.push({
          recordId: rec.id,
          patientSno: rec.patientSno,
          patientName: rec.patientName,
          date: rec.date,
          evaluation,
        });
      }
    }

    // Prioritize critical breaches over urgent breaches
    return breaches.sort((a, b) => {
      if (a.evaluation.severity === b.evaluation.severity) return 0;
      return a.evaluation.severity === 'critical' ? -1 : 1;
    });
  }, [records]);

  const emitUrgentAlert = useCallback(
    (breachesToNotify: ClinicalVitalsAlert[]) => {
      if (breachesToNotify.length === 0) return;

      if (breachesToNotify.length === 1 || maxToastsPerBatch === 1) {
        const primary = breachesToNotify[0];
        const additionalCount = breachesToNotify.length - 1;
        const suffix =
          additionalCount > 0
            ? ` (+${additionalCount} other patient${additionalCount > 1 ? 's' : ''} above safe limits)`
            : '';

        showToast(
          `${primary.patientName} (#${primary.patientSno}): ${primary.evaluation.reasons.join(' · ')}.${suffix}`,
          'urgent',
          primary.evaluation.severity === 'critical'
            ? 'Critical Vitals Threshold Exceeded'
            : 'Urgent Vitals Alert (BP / Pulse)',
          7500
        );
        return;
      }

      breachesToNotify.slice(0, maxToastsPerBatch).forEach((item) => {
        showToast(
          `${item.patientName} (#${item.patientSno}): ${item.evaluation.reasons.join(' · ')}.`,
          'urgent',
          item.evaluation.severity === 'critical'
            ? 'Critical Vitals Threshold Exceeded'
            : 'Urgent Vitals Alert (BP / Pulse)',
          7500
        );
      });
    },
    [maxToastsPerBatch, showToast]
  );

  useEffect(() => {
    if (!enabled || alerts.length === 0) return;

    const unseen: ClinicalVitalsAlert[] = [];
    for (const alert of alerts) {
      const dedupeKey = `${scopeKey}::${alert.recordId}::${alert.evaluation.bpLabel}::${alert.evaluation.pulseLabel}`;
      if (!alertedKeysRef.current.has(dedupeKey)) {
        alertedKeysRef.current.add(dedupeKey);
        unseen.push(alert);
      }
    }

    if (unseen.length > 0) {
      emitUrgentAlert(unseen);
    }
  }, [alerts, enabled, scopeKey, emitUrgentAlert]);

  const triggerVitalsAuditToast = useCallback(() => {
    if (alerts.length === 0) {
      showToast(
        'All monitored BP and Pulse readings are within safe clinical thresholds.',
        'success',
        'Vitals Monitor Clear'
      );
      return;
    }
    emitUrgentAlert(alerts);
  }, [alerts, emitUrgentAlert, showToast]);

  return {
    alerts,
    urgentCount: alerts.length,
    criticalCount: alerts.filter((a) => a.evaluation.severity === 'critical').length,
    triggerVitalsAuditToast,
  };
}
