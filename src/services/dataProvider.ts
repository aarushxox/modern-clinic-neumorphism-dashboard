/**
 * Dr. Marcus Johnson Clinical Suite - Data Provider Service
 * Decouples the UI layer from underlying storage (CSV/Forensic models)
 * Implements PRD Section 67/68 specifications + Quick Add Patient live onboarding
 */

import {
  PatientRecord,
  PrescriptionRecord,
  DrugMasterRecord,
  ShortcutRecord,
  CertificateRecord,
  CashbookRecord,
  TableMetadata,
  ClinicMetrics,
  PatientClinicalStatus,
} from '../types/clinic';
import {
  TABLE_METADATA_REGISTRY,
  CLINIC_METRICS,
  DRUGS_MASTER,
  SHORTCUTS_DATA,
  CERTIFICATES_DATA,
  CASHBOOK_DATA,
  FORENSIC_TIMELINE,
  getPatientBySerial,
  getVisitsForPatient,
  getClinicDayEncounters,
} from '../data/forensicDataset';
import { formatPrescriptionTreatment } from '../data/krutiDevConverter';
import { matchesConditionFilter } from '../utils/patientConditions';

const QUICK_PATIENTS_KEY = 'johnson_clinic_quick_patients_v1';
const PATIENT_STATUS_KEY = 'johnson_clinic_patient_statuses_v1';

interface QuickAddedStore {
  patients: PatientRecord[];
  encounters: PrescriptionRecord[];
}

function loadQuickStore(): QuickAddedStore {
  try {
    const raw = localStorage.getItem(QUICK_PATIENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.patients) && Array.isArray(parsed.encounters)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return { patients: [], encounters: [] };
}

function saveQuickStore(store: QuickAddedStore): void {
  try {
    localStorage.setItem(QUICK_PATIENTS_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

function loadStatusOverrides(): Record<number, PatientClinicalStatus> {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(PATIENT_STATUS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<number, PatientClinicalStatus>;
      }
    }
  } catch {
    // ignore storage errors
  }
  return {};
}

function saveStatusOverrides(map: Record<number, PatientClinicalStatus>): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(PATIENT_STATUS_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export interface QuickAddPatientInput {
  fullName: string;
  ageYears: number;
  phone: string;
  sex?: 'Male' | 'Female' | 'Other';
  complaint?: string;
  clinicDate?: string;
}

export interface PatientSearchFilter {
  query?: string;
  condition?: string;
  sortBy?: 'serial-asc' | 'serial-desc' | 'name-asc' | 'name-desc' | 'recent-visit' | 'visits-desc';
  gender?: string;
  minAge?: number;
  maxAge?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ClinicDataProvider {
  // Get all registered table metadata
  public static getTableMetadata(): TableMetadata[] {
    return TABLE_METADATA_REGISTRY;
  }

  // Get high-level clinic metrics (including newly onboarded quick arrivals)
  public static getMetrics(): ClinicMetrics {
    const store = loadQuickStore();
    return {
      ...CLINIC_METRICS,
      currentPatientsCount: CLINIC_METRICS.currentPatientsCount + store.patients.length,
      highestSerialObserved: CLINIC_METRICS.highestSerialObserved + store.patients.length,
      historicalVisitsCount: CLINIC_METRICS.historicalVisitsCount + store.encounters.length,
    };
  }

  // Rapidly onboard a new walk-in patient and create today's OPD encounter
  public static addQuickPatient(input: QuickAddPatientInput): {
    patient: PatientRecord;
    encounter: PrescriptionRecord;
  } {
    const store = loadQuickStore();
    const parts = input.fullName.trim().split(/\s+/);
    const firstName = parts[0] || 'Patient';
    const lastName = parts.slice(1).join(' ') || 'Walk-in';
    const maxSno = store.patients.reduce((m, p) => Math.max(m, p.sno), 52533);
    const sno = maxSno + 1;
    const visitDate = input.clinicDate || '2026-08-12';
    const birthYear = Math.max(1920, 2026 - Math.round(input.ageYears));

    const patient: PatientRecord = {
      sno,
      firstName,
      lastName,
      guardianName: 'Walk-in OPD Registration',
      ageYears: Math.round(input.ageYears),
      ageMonths: 0,
      sex: input.sex || 'Male',
      address: 'OPD Front Desk Arrival',
      phone: input.phone.trim(),
      dobirth: `${birthYear}-01-01`,
      firstVisitDate: visitDate,
      lastVisitDate: visitDate,
      totalVisits: 1,
    };

    const complaint = input.complaint?.trim() || 'General OPD Consultation & Vitals Triage';
    const rawRx = 'TAB PARACIP 650 (SOS fever/pain)\nTAB PAN-D (1-0-0 Before Breakfast x 5 days)';
    const formatted = formatPrescriptionTreatment(rawRx);

    const encounter: PrescriptionRecord = {
      id: `quick-${sno}-${Date.now()}`,
      sno,
      date: visitDate,
      diagonisis: complaint,
      examination: 'BP: 122/78 mmHg, Pulse: 76/min, Wt: 68 kg, General Condition: Stable (Triage Checked)',
      investigation: 'Baseline vitals recorded at arrival',
      treatmentRaw: rawRx,
      treatmentFormatted: formatted.plainText,
      medicinesList: formatted.medicines,
      instruction: 'Follow up with Dr. Marcus Johnson after initial triage.',
      nextvisit: 'Review in 5 days or SOS',
      feesrecived: 200,
      phistory: 'New walk-in arrival',
      patientName: `${firstName} ${lastName}`.trim(),
    };

    store.patients.unshift(patient);
    store.encounters.unshift(encounter);
    saveQuickStore(store);

    return { patient, encounter };
  }

  // Get recent active patients (PRD Section 19)
  public static getRecentActivePatients(limit: number = 5): PatientRecord[] {
    const store = loadQuickStore();
    const list: PatientRecord[] = [...store.patients.slice(0, limit)];
    const candidateSerials = [52530, 52495, 52410, 52380, 52290, 52150, 51990, 51820];
    for (const sno of candidateSerials) {
      if (list.length >= limit) break;
      const p = getPatientBySerial(sno);
      if (p) {
        list.push(p);
      }
    }
    return list;
  }

  // Retrieve persisted patient clinical status override (if updated via bulk actions)
  public static getPatientStatusOverride(sno: number): PatientClinicalStatus | null {
    const map = loadStatusOverrides();
    return map[sno] || null;
  }

  // Derive default clinical status for a patient when no explicit override exists
  public static getPatientStatus(patient: PatientRecord): PatientClinicalStatus {
    const override = ClinicDataProvider.getPatientStatusOverride(patient.sno);
    if (override) return override;
    if (patient.history && /hypertension|diabetes|dm/i.test(patient.history)) {
      return 'Pending Review';
    }
    if (patient.sno % 5 === 0) {
      return 'Discharged';
    }
    return 'Active';
  }

  // Batch update clinical status for multiple patients at once (persisted locally)
  public static updatePatientStatusesBatch(
    snos: number[],
    status: PatientClinicalStatus
  ): number {
    if (snos.length === 0) return 0;
    const map = loadStatusOverrides();
    snos.forEach((sno) => {
      map[sno] = status;
    });
    saveStatusOverrides(map);
    return snos.length;
  }

  // Search patients with multi-field + Search by Condition filtering and ranking (PRD Section 20)
  public static searchPatients(
    filter: PatientSearchFilter,
    page: number = 1,
    pageSize: number = 25
  ): PaginatedResult<PatientRecord> {
    const q = (filter.query || '').trim().toLowerCase();
    const condition = (filter.condition || '').trim();
    const hasCondition = Boolean(condition && condition.toLowerCase() !== 'all');
    const genderFilter = filter.gender && filter.gender !== 'ALL' ? filter.gender : null;
    const store = loadQuickStore();

    const matchesGender = (p: PatientRecord) => !genderFilter || p.sex === genderFilter;

    // If both query and condition are empty, return recently active patients (including quick-added ones first)
    if (!q && !hasCondition) {
      const recentPool: PatientRecord[] = [...store.patients.filter(matchesGender)];
      for (let s = 52533; s >= 51400; s -= 7) {
        const p = getPatientBySerial(s);
        if (p && matchesGender(p)) {
          recentPool.push(p);
          if (recentPool.length >= 120) break;
        }
      }

      if (filter.sortBy === 'name-asc') {
        recentPool.sort((a, b) => a.firstName.localeCompare(b.firstName));
      } else if (filter.sortBy === 'name-desc') {
        recentPool.sort((a, b) => b.firstName.localeCompare(a.firstName));
      } else if (filter.sortBy === 'serial-asc') {
        recentPool.sort((a, b) => a.sno - b.sno);
      } else if (filter.sortBy === 'visits-desc') {
        recentPool.sort((a, b) => b.totalVisits - a.totalVisits);
      } else {
        recentPool.sort((a, b) => b.sno - a.sno);
      }

      const totalCount = CLINIC_METRICS.currentPatientsCount + store.patients.length;
      const startIndex = (page - 1) * pageSize;
      const items = recentPool.slice(startIndex, startIndex + pageSize);

      return {
        items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    }

    const numericMatch = q ? parseInt(q, 10) : NaN;
    const matches: PatientRecord[] = [];
    const seen = new Set<number>();

    const matchesTextQuery = (p: PatientRecord): boolean => {
      if (!q) return true;
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        p.guardianName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.sno.toString().includes(q)
      );
    };

    const matchesCondition = (p: PatientRecord): boolean => {
      if (!hasCondition) return true;
      const visits = ClinicDataProvider.getPatientVisits(p);
      return matchesConditionFilter(p, visits, condition);
    };

    const consider = (p: PatientRecord | null) => {
      if (!p || seen.has(p.sno)) return;
      if (!matchesGender(p)) return;
      if (!matchesTextQuery(p)) return;
      if (!matchesCondition(p)) return;
      seen.add(p.sno);
      matches.push(p);
    };

    // Search quick-added patients first
    for (const p of store.patients) {
      consider(p);
    }

    if (!isNaN(numericMatch) && numericMatch > 0 && numericMatch <= 52533) {
      consider(getPatientBySerial(numericMatch));
    }

    const scanStep = hasCondition && !q ? 19 : q.length > 3 ? 31 : 53;
    for (let sno = 52533; sno >= 1; sno -= scanStep) {
      consider(getPatientBySerial(sno));
      if (matches.length >= 150) break;
    }

    if (filter.sortBy === 'name-asc') {
      matches.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (filter.sortBy === 'name-desc') {
      matches.sort((a, b) => b.firstName.localeCompare(a.firstName));
    } else if (filter.sortBy === 'serial-asc') {
      matches.sort((a, b) => a.sno - b.sno);
    } else if (filter.sortBy === 'visits-desc') {
      matches.sort((a, b) => b.totalVisits - a.totalVisits);
    } else {
      matches.sort((a, b) => b.sno - a.sno);
    }

    const totalCount = matches.length;
    const startIndex = (page - 1) * pageSize;
    const items = matches.slice(startIndex, startIndex + pageSize);

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  }

  // Get specific patient profile by Serial Number
  public static getPatient(sno: number): PatientRecord | null {
    const store = loadQuickStore();
    const custom = store.patients.find((p) => p.sno === sno);
    if (custom) return custom;
    return getPatientBySerial(sno);
  }

  // Get all visits for a patient (chronological, newest first)
  public static getPatientVisits(patient: PatientRecord): PrescriptionRecord[] {
    const store = loadQuickStore();
    const customVisits = store.encounters.filter((e) => e.sno === patient.sno);
    if (customVisits.length > 0) return customVisits;
    return getVisitsForPatient(patient);
  }

  // Get encounters for a clinic day (defaulting to latest recorded date 2026-08-12)
  public static getTodayEncounters(dateStr: string = '2026-08-12'): PrescriptionRecord[] {
    const store = loadQuickStore();
    const customDay = store.encounters.filter((e) => e.date === dateStr);
    return [...customDay, ...getClinicDayEncounters(dateStr)];
  }

  // Retrieve critical clinical reminders derived from the active clinic date schedule
  public static getClinicalReminders(dateStr: string = '2026-08-12'): {
    id: string;
    severity: 'critical' | 'urgent' | 'upcoming';
    headline: string;
    detail: string;
    timeTag: string;
    scheduleDate: string;
    patientSno?: number;
    targetModule: 'today' | 'calendar' | 'dashboard' | 'search';
    actionLabel: string;
  }[] {
    const dayEncounters = ClinicDataProvider.getTodayEncounters(dateStr);
    const nextEncounter = dayEncounters[0];
    const urgentLabEncounter =
      dayEncounters.find((rx, idx) => {
        const dx = rx.diagonisis.toLowerCase();
        return (
          idx > 0 &&
          (dx.includes('diabetes') ||
            dx.includes('hypertension') ||
            dx.includes('typhoid') ||
            dx.includes('workup') ||
            dx.includes('fever') ||
            dx.includes('asthma'))
        );
      }) || dayEncounters[1];
    const followUpEncounter = dayEncounters[2] || dayEncounters[0];

    const pendingLabCount = dayEncounters.filter((rx, idx) => {
      const dx = rx.diagonisis.toLowerCase();
      return (
        dx.includes('diabetes') ||
        dx.includes('hypertension') ||
        dx.includes('typhoid') ||
        dx.includes('workup') ||
        idx % 4 === 1
      );
    }).length;

    const reminders: {
      id: string;
      severity: 'critical' | 'urgent' | 'upcoming';
      headline: string;
      detail: string;
      timeTag: string;
      scheduleDate: string;
      patientSno?: number;
      targetModule: 'today' | 'calendar' | 'dashboard' | 'search';
      actionLabel: string;
    }[] = [];

    if (nextEncounter) {
      reminders.push({
        id: `rem-upcoming-${dateStr}-${nextEncounter.sno}`,
        severity: 'upcoming',
        headline: 'Upcoming Appointment in 10 minutes',
        detail: `${nextEncounter.patientName || `Patient #${nextEncounter.sno}`} (#${nextEncounter.sno}) · ${nextEncounter.diagonisis}`,
        timeTag: 'In 10 min',
        scheduleDate: dateStr,
        patientSno: nextEncounter.sno,
        targetModule: 'today',
        actionLabel: 'Open Chart',
      });
    }

    if (urgentLabEncounter) {
      reminders.push({
        id: `rem-lab-${dateStr}-${urgentLabEncounter.sno}`,
        severity: 'critical',
        headline: 'Urgent Lab Report Pending',
        detail: `${urgentLabEncounter.patientName || `Patient #${urgentLabEncounter.sno}`} (#${urgentLabEncounter.sno}) · ${
          urgentLabEncounter.investigation || 'CBC, HbA1c & metabolic panel awaiting review'
        }`,
        timeTag: 'Urgent',
        scheduleDate: dateStr,
        patientSno: urgentLabEncounter.sno,
        targetModule: 'today',
        actionLabel: 'Review Lab',
      });
    }

    if (followUpEncounter && followUpEncounter.sno !== nextEncounter?.sno) {
      reminders.push({
        id: `rem-vitals-${dateStr}-${followUpEncounter.sno}`,
        severity: 'urgent',
        headline: 'Vitals & Dosage Verification Due',
        detail: `${followUpEncounter.patientName || `Patient #${followUpEncounter.sno}`} (#${followUpEncounter.sno}) · ${followUpEncounter.diagonisis}`,
        timeTag: 'Due 25 min',
        scheduleDate: dateStr,
        patientSno: followUpEncounter.sno,
        targetModule: 'today',
        actionLabel: 'Inspect Vitals',
      });
    }

    reminders.push({
      id: `rem-schedule-${dateStr}`,
      severity: 'upcoming',
      headline: `${dayEncounters.length} OPD Encounters on Schedule (${dateStr})`,
      detail: `${pendingLabCount} clinical reviews pending sign-off across today's clinic roster`,
      timeTag: dateStr,
      scheduleDate: dateStr,
      targetModule: 'calendar',
      actionLabel: 'View Schedule',
    });

    return reminders;
  }

  // Get Drug Master Catalog
  public static getDrugs(): DrugMasterRecord[] {
    return DRUGS_MASTER;
  }

  // Get Clinical Shortcuts
  public static getShortcuts(): ShortcutRecord[] {
    return SHORTCUTS_DATA;
  }

  // Get Issued Certificates
  public static getCertificates(): CertificateRecord[] {
    return CERTIFICATES_DATA;
  }

  // Get Cashbook Journal
  public static getCashbook(): CashbookRecord[] {
    return CASHBOOK_DATA;
  }

  // Get Forensic Timeline
  public static getTimeline() {
    return FORENSIC_TIMELINE;
  }

  // Get Analytics Summary by Year for Reports module (PRD Section 52)
  public static getHistoricalReports() {
    return {
      visitsByYear: [
        { year: '1999', visits: 1820, fees: 91000, newPatients: 1450 },
        { year: '2001', visits: 3420, fees: 171000, newPatients: 1980 },
        { year: '2003', visits: 4850, fees: 242500, newPatients: 2150 },
        { year: '2005', visits: 5900, fees: 295000, newPatients: 2320 },
        { year: '2007', visits: 6420, fees: 385200, newPatients: 2450 },
        { year: '2009', visits: 6980, fees: 488600, newPatients: 2390 },
        { year: '2011', visits: 7450, fees: 596000, newPatients: 2210 },
        { year: '2013', visits: 7890, fees: 789000, newPatients: 2100 },
        { year: '2015', visits: 8120, fees: 974400, newPatients: 1980 },
        { year: '2017', visits: 8450, fees: 1183000, newPatients: 1890 },
        { year: '2019', visits: 8720, fees: 1308000, newPatients: 1750 },
        { year: '2020', visits: 6150, fees: 922500, newPatients: 1120 }, // COVID pandemic variance
        { year: '2021', visits: 7640, fees: 1146000, newPatients: 1420 },
        { year: '2022', visits: 8920, fees: 1427200, newPatients: 1830 },
        { year: '2023', visits: 9350, fees: 1589500, newPatients: 1910 },
        { year: '2024', visits: 9810, fees: 1765800, newPatients: 2020 },
        { year: '2025', visits: 10240, fees: 1945600, newPatients: 2090 },
        { year: '2026', visits: 6480, fees: 1296000, newPatients: 1250 }, // YTD Aug 2026
      ],
      diagnosisDistribution: [
        { label: 'Upper Respiratory Infection / Cough', count: 48210, percentage: 30.4 },
        { label: 'Essential Hypertension', count: 26450, percentage: 16.7 },
        { label: 'Type 2 Diabetes Mellitus', count: 21320, percentage: 13.5 },
        { label: 'Acute Gastroenteritis & Dyspepsia', count: 18940, percentage: 12.0 },
        { label: 'Musculoskeletal & Arthralgia', count: 14650, percentage: 9.2 },
        { label: 'Bronchial Asthma & Allergies', count: 12480, percentage: 7.9 },
        { label: 'Dermatological / Fungal', count: 8710, percentage: 5.5 },
        { label: 'Other Fevers & Clinical Workup', count: 7601, percentage: 4.8 },
      ],
      certificatesByType: [
        { type: 'Medical Fitness Certificate', count: 1184 },
        { type: 'Sickness & Medical Leave', count: 892 },
        { type: 'Fitness to Resume Duty', count: 412 },
        { type: 'Light Duty / Exemption', count: 145 },
        { type: 'Immunization & Health Check', count: 76 },
      ]
    };
  }
}
