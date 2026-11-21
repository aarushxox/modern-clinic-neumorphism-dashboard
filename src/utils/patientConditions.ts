import { PatientRecord, PrescriptionRecord } from '../types/clinic';

export interface ClinicalConditionPreset {
  id: string;
  label: string;
  category: 'Chronic' | 'Acute' | 'Respiratory' | 'GI' | 'Musculoskeletal' | 'Other';
  keywords: string[];
}

/**
 * Common clinical diagnoses and symptom tags observed across the clinic ledger.
 * Used by the 'Search by Condition' filter in the Patient Directory.
 */
export const COMMON_CLINICAL_CONDITIONS: ClinicalConditionPreset[] = [
  {
    id: 'hypertension',
    label: 'Hypertension',
    category: 'Chronic',
    keywords: ['hypertension', 'htn', 'blood pressure', 'tension headache'],
  },
  {
    id: 'diabetes',
    label: 'Type 2 Diabetes',
    category: 'Chronic',
    keywords: ['diabetes', 'type 2 dm', 'dm', 'neuropathy', 'blood sugar'],
  },
  {
    id: 'uri-fever',
    label: 'URI / Fever',
    category: 'Acute',
    keywords: ['upper respiratory', 'uri', 'pyrexia', 'fever', 'pharyngitis', 'tonsillitis'],
  },
  {
    id: 'asthma',
    label: 'Bronchial Asthma',
    category: 'Respiratory',
    keywords: ['asthma', 'bronchial', 'exacerbation', 'allergic rhinitis'],
  },
  {
    id: 'gerd-gastritis',
    label: 'GERD / Gastritis',
    category: 'GI',
    keywords: ['acid peptic', 'gerd', 'epigastric', 'gastroenteritis', 'dyspepsia', 'dehydration'],
  },
  {
    id: 'joint-spine',
    label: 'Spine & Joint Pain',
    category: 'Musculoskeletal',
    keywords: ['spondylosis', 'sciatic', 'osteoarthritis', 'knee', 'arthralgia', 'joint'],
  },
  {
    id: 'typhoid',
    label: 'Enteric / Typhoid',
    category: 'Acute',
    keywords: ['enteric', 'typhoid', 'widal'],
  },
  {
    id: 'migraine',
    label: 'Migraine / Headache',
    category: 'Other',
    keywords: ['migraine', 'visual aura', 'headache'],
  },
  {
    id: 'uti',
    label: 'UTI / Dysuria',
    category: 'Acute',
    keywords: ['urinary tract', 'uti', 'dysuria'],
  },
  {
    id: 'dermatitis',
    label: 'Fungal / Skin',
    category: 'Other',
    keywords: ['tinea', 'fungal', 'dermatitis', 'skin'],
  },
  {
    id: 'hepatitis',
    label: 'Hepatitis / Jaundice',
    category: 'GI',
    keywords: ['hepatitis', 'jaundice', 'liver'],
  },
];

/**
 * Derives concise, human-readable condition tags for a patient from their
 * clinical encounter diagnoses and longitudinal medical history.
 */
export function getPatientConditionTags(
  patient: PatientRecord,
  visits: PrescriptionRecord[]
): string[] {
  const combined = [
    patient.history || '',
    ...visits.map((v) => v.diagonisis || ''),
  ]
    .join(' | ')
    .toLowerCase();

  const matchedLabels: string[] = [];
  for (const preset of COMMON_CLINICAL_CONDITIONS) {
    if (preset.keywords.some((kw) => combined.includes(kw))) {
      matchedLabels.push(preset.label);
    }
  }

  if (matchedLabels.length > 0) {
    return matchedLabels;
  }

  // Fall back to unique trimmed primary diagnosis names if no preset keyword matched
  const fallback = new Set<string>();
  visits.forEach((v) => {
    if (v.diagonisis && v.diagonisis.trim()) {
      fallback.add(v.diagonisis.split('(')[0].trim());
    }
  });
  return Array.from(fallback).slice(0, 3);
}

/**
 * Evaluates whether a patient record matches a 'Search by Condition' filter
 * (supports either a preset condition ID/label or free-text diagnosis/symptom query).
 */
export function matchesConditionFilter(
  patient: PatientRecord,
  visits: PrescriptionRecord[],
  conditionInput: string
): boolean {
  const trimmed = conditionInput.trim().toLowerCase();
  if (!trimmed || trimmed === 'all') return true;

  const corpus = [
    patient.history || '',
    patient.allergy || '',
    ...visits.flatMap((v) => [
      v.diagonisis || '',
      v.examination || '',
      v.investigation || '',
      v.phistory || '',
    ]),
  ]
    .join(' ')
    .toLowerCase();

  // Check if input matches a known preset id or label
  const matchedPreset = COMMON_CLINICAL_CONDITIONS.find(
    (p) => p.id === trimmed || p.label.toLowerCase() === trimmed
  );
  if (matchedPreset) {
    return matchedPreset.keywords.some((kw) => corpus.includes(kw));
  }

  // Free-text symptom/diagnosis matching (supports comma-separated or multi-word tokens)
  const terms = trimmed
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return terms.some((term) => corpus.includes(term));
}
