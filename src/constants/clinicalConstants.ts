/**
 * Clinical Vitals Safety Thresholds & Evaluation Constants
 * Used by useClinicalVitalsMonitor hook, DashboardView, and print-ready summaries
 */

export const CLINICAL_VITALS_THRESHOLDS = {
  systolic: {
    minSafe: 90,
    maxSafe: 140,
    criticalHigh: 160,
    unit: 'mmHg',
  },
  diastolic: {
    minSafe: 60,
    maxSafe: 90,
    criticalHigh: 100,
    unit: 'mmHg',
  },
  pulse: {
    minSafe: 55,
    maxSafe: 100,
    criticalHigh: 115,
    unit: 'bpm',
  },
} as const;

export interface ParsedVitalsReading {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
}

export interface VitalsEvaluationResult {
  isBreach: boolean;
  severity: 'normal' | 'urgent' | 'critical';
  reasons: string[];
  bpLabel: string;
  pulseLabel: string;
}

/**
 * Extracts systolic/diastolic blood pressure and pulse rate from clinical examination strings
 */
export function parseVitalsFromExamination(examination?: string): ParsedVitalsReading {
  if (!examination) return {};
  const bpMatch = examination.match(/(?:BP:?\s*|bp:?\s*)(\d{2,3})\s*\/\s*(\d{2,3})/i);
  const pulseMatch = examination.match(/(?:Pulse:?\s*|pulse:?\s*|HR:?\s*)(\d{2,3})/i);

  const systolic = bpMatch ? parseInt(bpMatch[1], 10) : undefined;
  const diastolic = bpMatch ? parseInt(bpMatch[2], 10) : undefined;
  const pulse = pulseMatch ? parseInt(pulseMatch[1], 10) : undefined;

  return {
    systolic: Number.isFinite(systolic) ? systolic : undefined,
    diastolic: Number.isFinite(diastolic) ? diastolic : undefined,
    pulse: Number.isFinite(pulse) ? pulse : undefined,
  };
}

/**
 * Evaluates BP and Pulse against CLINICAL_VITALS_THRESHOLDS
 */
export function evaluateVitalsThresholds(
  reading: ParsedVitalsReading
): VitalsEvaluationResult {
  const reasons: string[] = [];
  let severity: 'normal' | 'urgent' | 'critical' = 'normal';

  const { systolic, diastolic, pulse } = reading;
  const T = CLINICAL_VITALS_THRESHOLDS;

  if (typeof systolic === 'number') {
    if (systolic >= T.systolic.criticalHigh) {
      reasons.push(`Critical Systolic BP ${systolic} ${T.systolic.unit} (>= ${T.systolic.criticalHigh})`);
      severity = 'critical';
    } else if (systolic >= T.systolic.maxSafe) {
      reasons.push(`Elevated Systolic BP ${systolic} ${T.systolic.unit} (>= ${T.systolic.maxSafe})`);
      if (severity === 'normal') severity = 'urgent';
    } else if (systolic < T.systolic.minSafe) {
      reasons.push(`Low Systolic BP ${systolic} ${T.systolic.unit} (< ${T.systolic.minSafe})`);
      severity = 'critical';
    }
  }

  if (typeof diastolic === 'number') {
    if (diastolic >= T.diastolic.criticalHigh) {
      reasons.push(`Critical Diastolic BP ${diastolic} ${T.diastolic.unit} (>= ${T.diastolic.criticalHigh})`);
      severity = 'critical';
    } else if (diastolic >= T.diastolic.maxSafe) {
      reasons.push(`Elevated Diastolic BP ${diastolic} ${T.diastolic.unit} (>= ${T.diastolic.maxSafe})`);
      if (severity === 'normal') severity = 'urgent';
    } else if (diastolic < T.diastolic.minSafe) {
      reasons.push(`Low Diastolic BP ${diastolic} ${T.diastolic.unit} (< ${T.diastolic.minSafe})`);
      if (severity === 'normal') severity = 'urgent';
    }
  }

  if (typeof pulse === 'number') {
    if (pulse >= T.pulse.criticalHigh) {
      reasons.push(`Critical Tachycardia ${pulse} ${T.pulse.unit} (>= ${T.pulse.criticalHigh})`);
      severity = 'critical';
    } else if (pulse > T.pulse.maxSafe) {
      reasons.push(`Elevated Pulse ${pulse} ${T.pulse.unit} (> ${T.pulse.maxSafe})`);
      if (severity === 'normal') severity = 'urgent';
    } else if (pulse < T.pulse.minSafe) {
      reasons.push(`Bradycardia ${pulse} ${T.pulse.unit} (< ${T.pulse.minSafe})`);
      severity = 'critical';
    }
  }

  const bpLabel =
    typeof systolic === 'number' && typeof diastolic === 'number'
      ? `${systolic}/${diastolic} mmHg`
      : 'N/A';
  const pulseLabel = typeof pulse === 'number' ? `${pulse} bpm` : 'N/A';

  return {
    isBreach: reasons.length > 0,
    severity,
    reasons,
    bpLabel,
    pulseLabel,
  };
}
