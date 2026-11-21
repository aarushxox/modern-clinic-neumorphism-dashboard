/**
 * Dr. J.S. Pandey Clinic - Data Provider Service
 * Decouples the UI layer from underlying storage (CSV/Forensic models)
 * Implements PRD Section 67/68 specifications
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

export interface PatientSearchFilter {
  query?: string;
  sortBy?: 'serial-asc' | 'serial-desc' | 'name-asc' | 'name-desc' | 'recent-visit';
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

  // Get high-level clinic metrics
  public static getMetrics(): ClinicMetrics {
    return CLINIC_METRICS;
  }

  // Get recent active patients (PRD Section 19)
  public static getRecentActivePatients(limit: number = 5): PatientRecord[] {
    const list: PatientRecord[] = [];
    // Select top distinct patients active in latest periods
    const candidateSerials = [52530, 52495, 52410, 52380, 52290, 52150, 51990, 51820];
    for (const sno of candidateSerials) {
      const p = getPatientBySerial(sno);
      if (p) {
        list.push(p);
        if (list.length >= limit) break;
      }
    }
    return list;
  }

  // Search patients with multi-field search and ranking (PRD Section 20)
  public static searchPatients(
    filter: PatientSearchFilter,
    page: number = 1,
    pageSize: number = 25
  ): PaginatedResult<PatientRecord> {
    const q = (filter.query || '').trim().toLowerCase();

    // If empty query, show recently active patients
    if (!q) {
      const recentPool: PatientRecord[] = [];
      for (let s = 52533; s >= 52200; s -= 7) {
        const p = getPatientBySerial(s);
        if (p) {
          recentPool.push(p);
          if (recentPool.length >= 50) break;
        }
      }

      const totalCount = CLINIC_METRICS.currentPatientsCount;
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

    // If query is an exact or partial serial number
    const numericMatch = parseInt(q, 10);
    const matches: PatientRecord[] = [];

    if (!isNaN(numericMatch) && numericMatch > 0 && numericMatch <= 52533) {
      const exact = getPatientBySerial(numericMatch);
      if (exact) matches.push(exact);
    }

    // Scan sample index of diverse patients matching name, phone, address, guardian
    // Search across realistic representative serial intervals
    const scanStep = q.length > 3 ? 31 : 53;
    for (let sno = 1; sno <= 52533; sno += scanStep) {
      const p = getPatientBySerial(sno);
      if (!p) continue;

      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchName = fullName.includes(q);
      const matchGuardian = p.guardianName.toLowerCase().includes(q);
      const matchPhone = p.phone.includes(q);
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchSno = p.sno.toString().includes(q);

      if (matchName || matchGuardian || matchPhone || matchAddress || matchSno) {
        if (!matches.some(m => m.sno === p.sno)) {
          matches.push(p);
        }
      }

      if (matches.length >= 150) break;
    }

    // Apply sorting
    if (filter.sortBy === 'name-asc') {
      matches.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (filter.sortBy === 'name-desc') {
      matches.sort((a, b) => b.firstName.localeCompare(a.firstName));
    } else if (filter.sortBy === 'serial-desc') {
      matches.sort((a, b) => b.sno - a.sno);
    } else {
      matches.sort((a, b) => a.sno - b.sno);
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
    return getPatientBySerial(sno);
  }

  // Get all visits for a patient (chronological, newest first)
  public static getPatientVisits(patient: PatientRecord): PrescriptionRecord[] {
    return getVisitsForPatient(patient);
  }

  // Get encounters for a clinic day (defaulting to latest recorded date 2026-08-12)
  public static getTodayEncounters(dateStr: string = '2026-08-12'): PrescriptionRecord[] {
    return getClinicDayEncounters(dateStr);
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
