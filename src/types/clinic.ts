/**
 * Dr. J.S. Pandey Clinic - Forensic Legacy Data Intelligence Types
 * Strict Read-Only Forensic Architecture
 */

export type TableRole = 'CORE' | 'LOOKUP' | 'DUMP' | 'ERROR';

export type ClinicTheme =
  | 'sky-blue'
  | 'neon-modern-blue'
  | 'bone-white-blue'
  | 'eco-green'
  | 'cherry-red'
  | 'warm-pastel'
  | 'night-galaxy'
  | 'midnight-clinical';

export type PatientClinicalStatus = 'Active' | 'Pending Review' | 'Discharged';

export interface TableMetadata {
  tableName: string;
  role: TableRole;
  approxRows: number;
  columnsCount: number;
  description: string;
  doctorVisible: boolean;
  sourceFile: string;
  verificationStatus: 'MATCH' | 'VERIFIED' | 'DIFFERS';
}

export interface PatientRecord {
  sno: number; // Registration number / Serial
  firstName: string;
  lastName: string;
  guardianName: string;
  ageYears: number;
  ageMonths: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  phone: string;
  dobirth?: string;
  allergy?: string;
  history?: string;
  firstVisitDate: string;
  lastVisitDate: string;
  totalVisits: number;
  currentAgeYears?: number;
  currentAgeDisplay?: string;
  isAgeInferred?: boolean;
}

export interface TreatmentMedicineItem {
  type: 'TAB' | 'CAP' | 'SYP' | 'INJ' | 'OINT' | 'DROPS' | 'OTHER';
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructionsHindi?: string;
  rawText?: string;
}

export interface PrescriptionRecord {
  id: string;
  sno: number;
  date: string;
  time?: string;
  diagonisis: string;
  examination?: string;
  investigation?: string;
  treatmentRaw: string; // Raw RTF / Kruti-Dev
  treatmentFormatted: string; // Decoded readable text
  medicinesList: TreatmentMedicineItem[];
  instruction?: string;
  nextvisit?: string;
  feesrecived: number;
  phistory?: string;
  prevhist?: string;
  lastdt?: string;
  patientName?: string;
}

export interface DrugMasterRecord {
  id: number;
  tradeName: string;
  genericName: string;
  company: string;
  representative: string;
  cost: number;
  sideEffects: string;
  category: string;
}

export interface ShortcutRecord {
  id: number;
  code: string;
  expandedText: string;
  category: string;
  notes?: string;
}

export interface CertificateRecord {
  certNo: number;
  patientName: string;
  sno?: number;
  startDate: string;
  endDate: string;
  days: number;
  disease: string;
  issueDate: string;
  certType: 'Medical Fitness' | 'Sickness / Rest' | 'Fitness to Resume Duty' | 'Light Duty' | 'Immunization';
}

export interface CashbookRecord {
  id: number;
  date: string;
  refNo: string;
  description: string;
  category: 'Consultation Fees' | 'Certificate Fees' | 'Injection / Procedure' | 'ECG / Diagnostic' | 'Pharmacy' | 'Expense / Utility';
  type: 'RECEIPT' | 'PAYMENT';
  amount: number;
}

export interface ClinicMetrics {
  currentPatientsCount: number;
  highestSerialObserved: number;
  historicalVisitsCount: number;
  medicinesCount: number;
  shortcutsCount: number;
  certificatesCount: number;
  cashbookRecordsCount: number;
  mostRecentClinicDate: string;
  oldestClinicDate: string;
}

export interface ClinicSettings {
  doctorName: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicDegree: string;
  regNumber: string;
  theme: ClinicTheme;
  navOrientation: 'vertical' | 'horizontal';
  sidebarMode: 'expanded' | 'icon-rail' | 'hidden';
  collapsedBehavior: 'half-close' | 'full-close';
  hoverExpansion: boolean;
  sidebarAppearance: 'follow-theme' | 'force-light' | 'force-dark';
  autoScheduleDarkMode?: boolean;
  autoScheduleDayHour?: number;
  autoScheduleNightHour?: number;
  logoDataUrl?: string;
}

export type ActiveModule = 
  | 'dashboard'
  | 'today'
  | 'search'
  | 'medicines'
  | 'shortcuts'
  | 'certificates'
  | 'cashbook'
  | 'reports' // Clinical & Operational Analytics
  | 'calendar' // Clinic Calendar View
  | 'data-health'
  | 'data-explorer'
  | 'settings'
  | 'about';
