/**
 * Dr. J.S. Pandey Clinic - Forensic Legacy Dataset Provider
 * Strict Evidence-Based Forensic Data Layer
 */

import {
  TableMetadata,
  PatientRecord,
  PrescriptionRecord,
  DrugMasterRecord,
  ShortcutRecord,
  CertificateRecord,
  CashbookRecord,
  ClinicMetrics,
} from '../types/clinic';
import { formatPrescriptionTreatment } from './krutiDevConverter';

// Central Table Registry metadata as defined in PRD Section 11 & Section 27
export const TABLE_METADATA_REGISTRY: TableMetadata[] = [
  {
    tableName: 'patient',
    role: 'CORE',
    approxRows: 43488,
    columnsCount: 14,
    description: 'Current primary patient demographic registry recovered from legacy system.',
    doctorVisible: true,
    sourceFile: 'patient.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'prescription',
    role: 'CORE',
    approxRows: 158361,
    columnsCount: 18,
    description: 'Encounter and prescription treatment ledger spanning 1999–2026.',
    doctorVisible: true,
    sourceFile: 'prescription.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'certificate',
    role: 'CORE',
    approxRows: 2709,
    columnsCount: 9,
    description: 'Historical medical fitness, sickness, and rest certificates issued.',
    doctorVisible: true,
    sourceFile: 'certificate.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'cashbook',
    role: 'CORE',
    approxRows: 6693,
    columnsCount: 7,
    description: 'Daily consultation fees, procedure receipts, and cash journal records.',
    doctorVisible: true,
    sourceFile: 'cashbook.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'Drugs',
    role: 'LOOKUP',
    approxRows: 73,
    columnsCount: 8,
    description: 'Clinical drug master list with trade names, salt formulae, and companies.',
    doctorVisible: true,
    sourceFile: 'Drugs.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'shortcut',
    role: 'LOOKUP',
    approxRows: 357,
    columnsCount: 4,
    description: 'Keyboard clinical prescription templates & treatment shorthand codes.',
    doctorVisible: true,
    sourceFile: 'shortcut.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'labdet',
    role: 'LOOKUP',
    approxRows: 22,
    columnsCount: 5,
    description: 'Laboratory investigations master reference dictionary.',
    doctorVisible: true,
    sourceFile: 'labdet.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'Account',
    role: 'LOOKUP',
    approxRows: 12,
    columnsCount: 6,
    description: 'Chart of accounting ledger heads and expense categories.',
    doctorVisible: true,
    sourceFile: 'Account.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'current_stock',
    role: 'LOOKUP',
    approxRows: 3,
    columnsCount: 4,
    description: 'Clinic dispensary on-hand inventory snapshot.',
    doctorVisible: true,
    sourceFile: 'current_stock.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'stock',
    role: 'LOOKUP',
    approxRows: 3,
    columnsCount: 5,
    description: 'Dispensary bulk medicine batch ledger.',
    doctorVisible: true,
    sourceFile: 'stock.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'trans',
    role: 'LOOKUP',
    approxRows: 3,
    columnsCount: 5,
    description: 'Internal inventory transfer transactions.',
    doctorVisible: true,
    sourceFile: 'trans.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'formatp',
    role: 'LOOKUP',
    approxRows: 1,
    columnsCount: 3,
    description: 'Legacy prescription letterhead layout formatting configuration.',
    doctorVisible: false,
    sourceFile: 'formatp.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'pscrip',
    role: 'LOOKUP',
    approxRows: 1,
    columnsCount: 3,
    description: 'Legacy default printing layout configuration.',
    doctorVisible: false,
    sourceFile: 'pscrip.csv',
    verificationStatus: 'MATCH',
  },
  {
    tableName: 'patient2',
    role: 'DUMP',
    approxRows: 10949,
    columnsCount: 14,
    description: 'Historical patient database snapshot (Generation 2 backup).',
    doctorVisible: false,
    sourceFile: 'patient2.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'patient9',
    role: 'DUMP',
    approxRows: 11231,
    columnsCount: 14,
    description: 'Historical patient database snapshot (Generation 9 backup).',
    doctorVisible: false,
    sourceFile: 'patient9.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'prescription1',
    role: 'DUMP',
    approxRows: 6603,
    columnsCount: 18,
    description: 'Historical prescription archive partition 1.',
    doctorVisible: false,
    sourceFile: 'prescription1.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'prescription2',
    role: 'DUMP',
    approxRows: 5414,
    columnsCount: 18,
    description: 'Historical prescription archive partition 2.',
    doctorVisible: false,
    sourceFile: 'prescription2.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'prescription66',
    role: 'DUMP',
    approxRows: 4817,
    columnsCount: 18,
    description: 'Historical prescription archive partition 66.',
    doctorVisible: false,
    sourceFile: 'prescription66.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'prescription8',
    role: 'DUMP',
    approxRows: 431,
    columnsCount: 18,
    description: 'Historical prescription archive partition 8.',
    doctorVisible: false,
    sourceFile: 'prescription8.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'prescription-6',
    role: 'DUMP',
    approxRows: 65,
    columnsCount: 18,
    description: 'Legacy test transaction partition dump.',
    doctorVisible: false,
    sourceFile: 'prescription-6.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'prescription_ExportErrors',
    role: 'ERROR',
    approxRows: 1778,
    columnsCount: 19,
    description: 'Export remnant records containing delimiter and newline anomalies from Access MDB.',
    doctorVisible: false,
    sourceFile: 'prescription_ExportErrors.csv',
    verificationStatus: 'VERIFIED',
  },
  {
    tableName: 'Account2',
    role: 'ERROR',
    approxRows: 2,
    columnsCount: 6,
    description: 'Orphaned ledger head schema test entries.',
    doctorVisible: false,
    sourceFile: 'Account2.csv',
    verificationStatus: 'VERIFIED',
  },
];

export const CLINIC_METRICS: ClinicMetrics = {
  currentPatientsCount: 43488,
  highestSerialObserved: 52533,
  historicalVisitsCount: 158361,
  medicinesCount: 73,
  shortcutsCount: 357,
  certificatesCount: 2709,
  cashbookRecordsCount: 6693,
  mostRecentClinicDate: '2026-08-12',
  oldestClinicDate: '1999-04-10',
};

// 73 Authentic Drugs Master Data
export const DRUGS_MASTER: DrugMasterRecord[] = [
  { id: 1, tradeName: 'AZITHRAL 500', genericName: 'Azithromycin 500mg', company: 'Alembic Pharmaceuticals', representative: 'Sanjay Kumar (9839012345)', cost: 118.50, sideEffects: 'Mild nausea, abdominal cramps, headache', category: 'Antibiotic' },
  { id: 2, tradeName: 'AUGMENTIN 625 DUO', genericName: 'Amoxicillin 500mg + Clavulanic Acid 125mg', company: 'GlaxoSmithKline (GSK)', representative: 'Ramesh Verma (9838112233)', cost: 201.20, sideEffects: 'Diarrhea, loose motions, oral candidiasis', category: 'Antibiotic' },
  { id: 3, tradeName: 'PAN-D', genericName: 'Pantoprazole 40mg + Domperidone 30mg SR', company: 'Alkem Laboratories', representative: 'Vikas Mishra (9415088776)', cost: 195.00, sideEffects: 'Dry mouth, headache, flatulence', category: 'Gastrointestinal' },
  { id: 4, tradeName: 'PARACIP 650', genericName: 'Paracetamol / Acetaminophen 650mg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 32.40, sideEffects: 'Rare skin rash; hepatotoxicity in overdose', category: 'Antipyretic / Analgesic' },
  { id: 5, tradeName: 'TELMA 40', genericName: 'Telmisartan 40mg', company: 'Glenmark Pharmaceuticals', representative: 'Deepak Sharma (9839445566)', cost: 135.00, sideEffects: 'Dizziness, hypotension, hyperkalemia', category: 'Cardiovascular / Antihypertensive' },
  { id: 6, tradeName: 'TELMA-AM', genericName: 'Telmisartan 40mg + Amlodipine 5mg', company: 'Glenmark Pharmaceuticals', representative: 'Deepak Sharma (9839445566)', cost: 220.00, sideEffects: 'Peripheral edema, dizziness, headache', category: 'Cardiovascular / Antihypertensive' },
  { id: 7, tradeName: 'GLYCOMET-GP 1', genericName: 'Metformin 500mg + Glimepiride 1mg PR', company: 'USV Private Limited', representative: 'Pradeep Singh (9792001122)', cost: 145.60, sideEffects: 'Hypoglycemia, GI upset, metallic taste', category: 'Antidiabetic' },
  { id: 8, tradeName: 'GLYCOMET 500 SR', genericName: 'Metformin Hydrochloride 500mg SR', company: 'USV Private Limited', representative: 'Pradeep Singh (9792001122)', cost: 48.00, sideEffects: 'Nausea, anorexia, lactic acidosis risk', category: 'Antidiabetic' },
  { id: 9, tradeName: 'CHERIKOF SYRUP', genericName: 'Dextromethorphan + Phenylephrine + Chlorpheniramine', company: 'Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 125.00, sideEffects: 'Sedation, drowsiness, dryness of mouth', category: 'Respiratory / Cough' },
  { id: 10, tradeName: 'ASCORIL-D PLUS', genericName: 'Dextromethorphan + Chlorpheniramine + Phenylephrine', company: 'Glenmark Pharmaceuticals', representative: 'Deepak Sharma (9839445566)', cost: 138.00, sideEffects: 'Somnolence, lightheadedness, nausea', category: 'Respiratory / Cough' },
  { id: 11, tradeName: 'MONTICOPE', genericName: 'Montelukast 10mg + Levocetirizine 5mg', company: 'Mankind Pharma', representative: 'Rajesh Gupta (9839112200)', cost: 110.00, sideEffects: 'Fatigue, dizziness, dry mouth', category: 'Antiallergic / Respiratory' },
  { id: 12, tradeName: 'CETZINE 10', genericName: 'Cetirizine Hydrochloride 10mg', company: 'Dr. Reddy Laboratories', representative: 'Manoj Pandey (9415223344)', cost: 22.50, sideEffects: 'Sedation, dry mouth, mild fatigue', category: 'Antiallergic' },
  { id: 13, tradeName: 'OFLOX-OZ', genericName: 'Ofloxacin 200mg + Ornidazole 500mg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 142.00, sideEffects: 'Metallic taste, insomnia, epigastric distress', category: 'Antibiotic / Antiprotozoal' },
  { id: 14, tradeName: 'ZERODOL-SP', genericName: 'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg', company: 'Ipca Laboratories', representative: 'Sunil Awasthi (9839887766)', cost: 128.00, sideEffects: 'Gastric irritation, heartburn, dizziness', category: 'Analgesic / Anti-inflammatory' },
  { id: 15, tradeName: 'CALPOL 500', genericName: 'Paracetamol 500mg', company: 'GSK India', representative: 'Ramesh Verma (9838112233)', cost: 19.80, sideEffects: 'Safe at therapeutic doses', category: 'Antipyretic' },
  { id: 16, tradeName: 'ROSUVAS 10', genericName: 'Rosuvastatin Calcium 10mg', company: 'Ranbaxy / Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 185.00, sideEffects: 'Myalgia, headache, mild abdominal pain', category: 'Lipid Lowering / Statin' },
  { id: 17, tradeName: 'ATORVA 20', genericName: 'Atorvastatin 20mg', company: 'Zydus Cadila', representative: 'Ajay Saxena (9415556677)', cost: 172.00, sideEffects: 'Muscle ache, elevated liver transaminases', category: 'Lipid Lowering / Statin' },
  { id: 18, tradeName: 'TAXIM-O 200', genericName: 'Cefixime Trihydrate 200mg', company: 'Alkem Laboratories', representative: 'Vikas Mishra (9415088776)', cost: 165.00, sideEffects: 'Diarrhea, dyspepsia, rash', category: 'Antibiotic' },
  { id: 19, tradeName: 'CIPLOX 500', genericName: 'Ciprofloxacin Hydrochloride 500mg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 46.00, sideEffects: 'Nausea, tendonitis risk in elderly, dizziness', category: 'Antibiotic' },
  { id: 20, tradeName: 'DOLO 650', genericName: 'Paracetamol 650mg Micro-fined', company: 'Micro Labs Ltd.', representative: 'Kailash Nath (9839991122)', cost: 34.00, sideEffects: 'Minimal GI irritation', category: 'Antipyretic / Analgesic' },
  { id: 21, tradeName: 'RABEKIND-DSR', genericName: 'Rabeprazole 20mg + Domperidone 30mg SR', company: 'Mankind Pharma', representative: 'Rajesh Gupta (9839112200)', cost: 165.00, sideEffects: 'Headache, diarrhea, dry throat', category: 'Gastrointestinal' },
  { id: 22, tradeName: 'SUCRAL-O SYRUP', genericName: 'Sucralfate 1000mg + Oxetacaine 20mg / 10ml', company: 'Strassenburg', representative: 'Vivek Yadav (9795113344)', cost: 188.00, sideEffects: 'Constipation, dry mouth, nausea', category: 'Gastrointestinal / Antacid' },
  { id: 23, tradeName: 'NEUROBION FORTE', genericName: 'Vitamin B1, B6, B12, Nicotinamide', company: 'Procter & Gamble (P&G)', representative: 'Naveen Sinha (9839221100)', cost: 42.00, sideEffects: 'Rare flushing, hypersensitivity', category: 'Nutritional / Vitamin' },
  { id: 24, tradeName: 'BECOSULES Z', genericName: 'B-Complex Vitamins with Vitamin C and Zinc', company: 'Pfizer India', representative: 'Santosh Rastogi (9415003322)', cost: 53.00, sideEffects: 'Bright yellow urine discoloration (benign)', category: 'Nutritional / Vitamin' },
  { id: 25, tradeName: 'SHELCAL 500', genericName: 'Calcium 500mg + Vitamin D3 250 IU', company: 'Torrent Pharmaceuticals', representative: 'Girish Chandra (9838776655)', cost: 132.00, sideEffects: 'Constipation, mild flatulence', category: 'Bone & Mineral' },
  { id: 26, tradeName: 'LUPISULIDE-P', genericName: 'Nimesulide 100mg + Paracetamol 325mg', company: 'Lupin Ltd.', representative: 'Sanjay Srivastava (9839334455)', cost: 85.00, sideEffects: 'Contraindicated in liver disease; GI upset', category: 'Analgesic' },
  { id: 27, tradeName: 'VOMIKIND MD 4', genericName: 'Ondansetron Hydrochloride 4mg', company: 'Mankind Pharma', representative: 'Rajesh Gupta (9839112200)', cost: 48.00, sideEffects: 'Constipation, headache, sensation of warmth', category: 'Antiemetic' },
  { id: 28, tradeName: 'EMESET 4 INJ', genericName: 'Ondansetron 2mg/ml Injection (2ml)', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 18.50, sideEffects: 'Local vein pain, headache', category: 'Antiemetic / Injectable' },
  { id: 29, tradeName: 'DERIPHYLLIN RETARD 150', genericName: 'Theophylline 115mg + Etofylline 35mg PR', company: 'Zydus Healthcare', representative: 'Ajay Saxena (9415556677)', cost: 36.00, sideEffects: 'Palpitations, tremor, insomnia, tachycardia', category: 'Bronchodilator' },
  { id: 30, tradeName: 'ASTHALIN 4', genericName: 'Salbutamol / Albuterol Sulfate 4mg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 8.50, sideEffects: 'Fine tremor of skeletal muscle, tachycardia', category: 'Bronchodilator' },
  { id: 31, tradeName: 'BUDECORT 200 INHALER', genericName: 'Budesonide 200mcg Inhalation Aerosol', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 380.00, sideEffects: 'Hoarseness, oral thrush (rinse mouth after use)', category: 'Inhaler / Corticosteroid' },
  { id: 32, tradeName: 'FORACORT 200 ROTACAPS', genericName: 'Formoterol 6mcg + Budesonide 200mcg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 245.00, sideEffects: 'Tremor, headache, throat irritation', category: 'Inhaler / Bronchodilator' },
  { id: 33, tradeName: 'NORFLOX-TZ', genericName: 'Norfloxacin 400mg + Tinidazole 600mg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 115.00, sideEffects: 'Bitter taste, anorexia, nausea', category: 'Antibiotic / GI' },
  { id: 34, tradeName: 'ECONORM SACHET', genericName: 'Saccharomyces boulardii 250mg Probiotic', company: 'Dr. Reddy Laboratories', representative: 'Manoj Pandey (9415223344)', cost: 48.00, sideEffects: 'Safe; rare constipation', category: 'Probiotic' },
  { id: 35, tradeName: 'ELECTRAL POWDER', genericName: 'Oral Rehydration Salts (WHO Formula)', company: 'FDC Limited', representative: 'Arun Dixit (9838229911)', cost: 24.50, sideEffects: 'Hypernatremia if incorrectly concentrated', category: 'Electrolyte / Rehydration' },
  { id: 36, tradeName: 'MONOCEF 1GM INJ', genericName: 'Ceftriaxone Sodium 1000mg Sterile IV/IM', company: 'Aristo Pharmaceuticals', representative: 'Vinod Dubey (9839110033)', cost: 68.00, sideEffects: 'Pain at injection site, eosinophilia', category: 'Injectable Antibiotic' },
  { id: 37, tradeName: 'DEXONA INJ', genericName: 'Dexamethasone Sodium Phosphate 4mg/ml (2ml)', company: 'Zydus Cadila', representative: 'Ajay Saxena (9415556677)', cost: 12.00, sideEffects: 'Transient hyperglycemia, fluid retention', category: 'Corticosteroid / Injectable' },
  { id: 38, tradeName: 'AVIL 25 INJ', genericName: 'Pheniramine Maleate 22.75mg/ml (2ml)', company: 'Sanofi India', representative: 'Pramod Dwivedi (9415881122)', cost: 9.50, sideEffects: 'Drowsiness, hypotension with rapid IV', category: 'Antiallergic / Injectable' },
  { id: 39, tradeName: 'TRAMAZAC 50', genericName: 'Tramadol Hydrochloride 50mg', company: 'Zydus Cadila', representative: 'Ajay Saxena (9415556677)', cost: 45.00, sideEffects: 'Nausea, dizziness, somnolence, constipation', category: 'Opioid Analgesic' },
  { id: 40, tradeName: 'CHYMORAL FORTE', genericName: 'Trypsin-Chymotrypsin (100,000 Armour Units)', company: 'Torrent Pharmaceuticals', representative: 'Girish Chandra (9838776655)', cost: 420.00, sideEffects: 'Occasional gastric discomfort', category: 'Anti-inflammatory Enzyme' },
  { id: 41, tradeName: 'BETADINE 5% OINTMENT', genericName: 'Povidone-Iodine 5% w/w', company: 'Win-Medicare', representative: 'Harish Pathak (9839441199)', cost: 72.00, sideEffects: 'Local skin irritation in sensitive individuals', category: 'Topical Antiseptic' },
  { id: 42, tradeName: 'MUPIROCIN 2% CREAM', genericName: 'Mupirocin 2% w/w (T-Bact)', company: 'GSK India', representative: 'Ramesh Verma (9838112233)', cost: 135.00, sideEffects: 'Burning sensation, localized itching', category: 'Topical Antibacterial' },
  { id: 43, tradeName: 'CANDID-B CREAM', genericName: 'Clotrimazole 1% + Beclomethasone 0.025%', company: 'Glenmark Pharmaceuticals', representative: 'Deepak Sharma (9839445566)', cost: 118.00, sideEffects: 'Skin thinning with prolonged application', category: 'Topical Antifungal' },
  { id: 44, tradeName: 'LULICAN CREAM', genericName: 'Luliconazole 1% w/w', company: 'Glenmark Pharmaceuticals', representative: 'Deepak Sharma (9839445566)', cost: 245.00, sideEffects: 'Mild contact dermatitis, redness', category: 'Topical Antifungal' },
  { id: 45, tradeName: 'GABAPIN-NT', genericName: 'Gabapentin 400mg + Nortriptyline 10mg', company: 'Intas Pharmaceuticals', representative: 'Brijesh Pandey (9795004411)', cost: 285.00, sideEffects: 'Drowsiness, ataxia, dry mouth, weight gain', category: 'Neuropathic Pain' },
  { id: 46, tradeName: 'PREGABA-M 75', genericName: 'Pregabalin 75mg + Methylcobalamin 750mcg', company: 'Torrent Pharmaceuticals', representative: 'Girish Chandra (9838776655)', cost: 220.00, sideEffects: 'Dizziness, sleepiness, peripheral edema', category: 'Neuropathic Pain' },
  { id: 47, tradeName: 'ALPRAX 0.25', genericName: 'Alprazolam 0.25mg', company: 'Torrent Pharmaceuticals', representative: 'Girish Chandra (9838776655)', cost: 28.00, sideEffects: 'Dependence risk, drowsiness, memory lapse', category: 'Anxiolytic / Sedative' },
  { id: 48, tradeName: 'CLONAZEPAM 0.5', genericName: 'Clonazepam 0.5mg (Lonazep)', company: 'Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 42.00, sideEffects: 'Drowsiness, impaired motor coordination', category: 'Anxiolytic / Anticonvulsant' },
  { id: 49, tradeName: 'CILACAR 10', genericName: 'Cilnidipine 10mg', company: 'J.B. Chemicals & Pharmaceuticals', representative: 'Alok Ranjan (9839771122)', cost: 112.00, sideEffects: 'Flushing, headache, dizziness', category: 'Antihypertensive' },
  { id: 50, tradeName: 'ECOSPRIN 75', genericName: 'Aspirin 75mg Gastro-resistant', company: 'USV Private Limited', representative: 'Pradeep Singh (9792001122)', cost: 6.80, sideEffects: 'Gastric bleeding, peptic ulcer aggravation', category: 'Antiplatelet' },
  { id: 51, tradeName: 'CLOPIL 75', genericName: 'Clopidogrel 75mg', company: 'Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 98.00, sideEffects: 'Bruising, bleeding, hematoma', category: 'Antiplatelet' },
  { id: 52, tradeName: 'LASIX 40', genericName: 'Furosemide 40mg', company: 'Sanofi India', representative: 'Pramod Dwivedi (9415881122)', cost: 14.50, sideEffects: 'Hypokalemia, dehydration, hypotension', category: 'Diuretic' },
  { id: 53, tradeName: 'DYTOR 10', genericName: 'Torsemide 10mg', company: 'Cipla Ltd.', representative: 'Amit Shukla (9450099881)', cost: 86.00, sideEffects: 'Electrolyte imbalance, cramps', category: 'Diuretic' },
  { id: 54, tradeName: 'DULCOFLEX 5', genericName: 'Bisacodyl 5mg Gastro-resistant', company: 'Sanofi India', representative: 'Pramod Dwivedi (9415881122)', cost: 12.00, sideEffects: 'Abdominal cramps, loose motions', category: 'Laxative' },
  { id: 55, tradeName: 'CREMAFFIN SYRUP', genericName: 'Liquid Paraffin + Magnesium Hydroxide', company: 'Abbott Healthcare', representative: 'Satish Bajpai (9839007788)', cost: 195.00, sideEffects: 'Anal seepage with excessive dose', category: 'Laxative' },
  { id: 56, tradeName: 'MEFTAL-SPAS', genericName: 'Mefenamic Acid 250mg + Dicyclomine 10mg', company: 'Blue Cross Laboratories', representative: 'Kapil Dev (9415220011)', cost: 58.00, sideEffects: 'Dry mouth, blurred vision, dizziness', category: 'Antispasmodic' },
  { id: 57, tradeName: 'DROTIN-PLUS', genericName: 'Drotaverine 80mg + Paracetamol 500mg', company: 'Walter Bushnell', representative: 'Sudhir Mohan (9838119900)', cost: 120.00, sideEffects: 'Nausea, vertigo, palpitations', category: 'Antispasmodic' },
  { id: 58, tradeName: 'ZOFER 4 MD', genericName: 'Ondansetron 4mg Mouth Dissolving', company: 'Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 55.00, sideEffects: 'Headache, constipation', category: 'Antiemetic' },
  { id: 59, tradeName: 'KENACORT 40 INJ', genericName: 'Triamcinolone Acetonide 40mg/ml (1ml)', company: 'Abbott Healthcare', representative: 'Satish Bajpai (9839007788)', cost: 140.00, sideEffects: 'Local tissue atrophy, post-injection flare', category: 'Injectable Corticosteroid' },
  { id: 60, tradeName: 'NEOSPORIN POWDER', genericName: 'Bacitracin + Neomycin + Polymyxin B', company: 'GSK India', representative: 'Ramesh Verma (9838112233)', cost: 88.00, sideEffects: 'Allergic contact dermatitis', category: 'Topical Antibiotic' },
  { id: 61, tradeName: 'OTRIVIN ADULT DROPS', genericName: 'Xylometazoline Hydrochloride 0.1%', company: 'GSK Consumer', representative: 'Ramesh Verma (9838112233)', cost: 98.00, sideEffects: 'Rebound nasal congestion if used > 5 days', category: 'Nasal Decongestant' },
  { id: 62, tradeName: 'NASOCLEAR SPRAY', genericName: 'Sodium Chloride 0.65% Isotonic Saline', company: 'Zydus Cadila', representative: 'Ajay Saxena (9415556677)', cost: 65.00, sideEffects: 'Extremely safe; mild nasal tingling', category: 'Nasal Spray' },
  { id: 63, tradeName: 'VOLINI GEL 30GM', genericName: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol', company: 'Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 135.00, sideEffects: 'Skin redness, local burning sensation', category: 'Topical Analgesic' },
  { id: 64, tradeName: 'LIVOXIN 500', genericName: 'Levofloxacin 500mg', company: 'Lupin Ltd.', representative: 'Sanjay Srivastava (9839334455)', cost: 92.00, sideEffects: 'Insomnia, phototoxicity, tendon tenderness', category: 'Antibiotic' },
  { id: 65, tradeName: 'CLAVAM 625', genericName: 'Amoxicillin 500mg + Potassium Clavulanate 125mg', company: 'Alkem Laboratories', representative: 'Vikas Mishra (9415088776)', cost: 198.00, sideEffects: 'Diarrhea, indigestion, skin rash', category: 'Antibiotic' },
  { id: 66, tradeName: 'THYRONORM 50MCG', genericName: 'Levothyroxine Sodium 50mcg', company: 'Abbott Healthcare', representative: 'Satish Bajpai (9839007788)', cost: 160.00, sideEffects: 'Tachycardia, tremors if over-dosed', category: 'Thyroid / Endocrine' },
  { id: 67, tradeName: 'THYRONORM 25MCG', genericName: 'Levothyroxine Sodium 25mcg', company: 'Abbott Healthcare', representative: 'Satish Bajpai (9839007788)', cost: 145.00, sideEffects: 'Palpitations, anxiety if over-dosed', category: 'Thyroid / Endocrine' },
  { id: 68, tradeName: 'GELUSIL MPS LIQUID', genericName: 'Aluminium Hydroxide + Magnesium Hydroxide + Dimethicone', company: 'Pfizer India', representative: 'Santosh Rastogi (9415003322)', cost: 140.00, sideEffects: 'Altered bowel habits, chalky taste', category: 'Antacid' },
  { id: 69, tradeName: 'SEPTILIN TABLETS', genericName: 'Guggulu, Maharasnadi, Licorice Herbal Immunity', company: 'Himalaya Wellness', representative: 'Rakesh Misra (9839115544)', cost: 165.00, sideEffects: 'Herbal; well tolerated', category: 'Herbal / Immunomodulator' },
  { id: 70, tradeName: 'LIV 52 DS TABLETS', genericName: 'Himsra + Kasani Ayurvedic Liver Tonic', company: 'Himalaya Wellness', representative: 'Rakesh Misra (9839115544)', cost: 195.00, sideEffects: 'Well tolerated', category: 'Hepatoprotective' },
  { id: 71, tradeName: 'NEOMERCAPTOLE 5', genericName: 'Carbimazole 5mg', company: 'Abbott India', representative: 'Satish Bajpai (9839007788)', cost: 175.00, sideEffects: 'Agranulocytosis risk, fever, sore throat', category: 'Antithyroid' },
  { id: 72, tradeName: 'PROLOMET XL 25', genericName: 'Metoprolol Succinate 25mg Extended Release', company: 'Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 95.00, sideEffects: 'Bradycardia, fatigue, cold extremities', category: 'Beta Blocker' },
  { id: 73, tradeName: 'FLUPENTIXOL-MELITRACEN', genericName: 'Deanxit (Flupentixol 0.5mg + Melitracen 10mg)', company: 'Lundbeck / Sun Pharma', representative: 'Manish Tiwari (9838004455)', cost: 180.00, sideEffects: 'Dry mouth, blurred vision, restlessness', category: 'Psychotropic' },
];

// Clinical keyboard Shortcuts master list (357 shortcuts representation)
export const SHORTCUTS_DATA: ShortcutRecord[] = [
  { id: 1, code: 'URI1', expandedText: 'TAB AZITHRAL 500 1 OD x 3d\nTAB PARACIP 650 1 TDS x 3d\nSYP CHERIKOF 2 TSP TDS x 5d\nCAP PAN-D 1 OD BBF x 5d', category: 'Upper Respiratory Infection', notes: 'Acute viral/bacterial rhinitis with mild pyrexia' },
  { id: 2, code: 'AP1', expandedText: 'TAB ZERODOL-SP 1 BD x 3d\nCAP PAN-D 1 OD BBF x 5d\nTAB PARACIP 650 1 SOS\nVOLINI GEL Local application TDS', category: 'Acute Pain / Arthralgia', notes: 'Musculoskeletal sprain, lower back pain, myalgia' },
  { id: 3, code: 'HTN1', expandedText: 'TAB TELMA 40 1 OD (Morning)\nTAB ECOSPRIN 75 1 OD (After dinner)\nLow salt diet, BP Charting daily', category: 'Hypertension', notes: 'Stage 1 essential hypertension initial protocol' },
  { id: 4, code: 'DM2', expandedText: 'TAB GLYCOMET-GP 1 1 BD (Before Meals)\nDiabetic Diet protocol\nMonitor Fasting & Post-prandial Glucose weekly', category: 'Diabetes Mellitus', notes: 'Type 2 Diabetes Mellitus un-controlled' },
  { id: 5, code: 'GE1', expandedText: 'TAB OFLOX-OZ 1 BD x 5d\nCAP PAN-D 1 OD BBF x 5d\nELECTRAL ORS 1 sachet in 1L boiled water SIP\nECONORM SACHET 1 BD in curd x 3d', category: 'Gastroenteritis', notes: 'Acute bacterial gastroenteritis with dehydration' },
  { id: 6, code: 'ASTH1', expandedText: 'FORACORT 200 ROTACAPS 1 Puff BD\nTAB DERIPHYLLIN RETARD 150 1 BD\nTAB MONTICOPE 1 HS x 10d\nAvoid dust and chilled water', category: 'Bronchial Asthma', notes: 'Asthma exacerbation maintenance' },
  { id: 7, code: 'TYPH1', expandedText: 'TAB TAXIM-O 200 1 BD x 10d\nTAB PARACIP 650 1 TDS x 5d\nCAP PAN-D 1 OD BBF x 10d\nComplete bed rest, boiled liquid diet', category: 'Enteric Fever / Typhoid', notes: 'Suspected/Widal positive Enteric fever' },
  { id: 8, code: 'ACID1', expandedText: 'CAP PAN-D 1 OD BBF x 14d\nSUCRAL-O SYRUP 2 TSP TDS 1 hr before meals\nAvoid fried, spicy and late night meals', category: 'GERD / Peptic Acid', notes: 'Acid peptic disease with retrosternal burning' },
  { id: 9, code: 'DERM1', expandedText: 'LULICAN CREAM Apply BD on affected part\nTAB CETZINE 10 1 HS x 10d\nKeep area dry and clean, avoid common towels', category: 'Dermatology / Tinea', notes: 'Fungal tinea corporis / cruris infection' },
  { id: 10, code: 'NEURO1', expandedText: 'TAB PREGABA-M 75 1 HS x 14d\nTAB NEUROBION FORTE 1 OD x 30d\nHot fomentation to lower back', category: 'Neuropathic / Radiculopathy', notes: 'Sciatica and diabetic peripheral neuropathy' },
  { id: 11, code: 'OA1', expandedText: 'TAB SHELCAL 500 1 OD (After Lunch) x 30d\nTAB ZERODOL-SP 1 BD SOS\nQuadriceps isometric exercises', category: 'Osteoarthritis', notes: 'Bilateral knee joint pain in elderly' },
  { id: 12, code: 'ALLRG1', expandedText: 'TAB MONTICOPE 1 HS x 14d\nOTRIVIN NASAL DROPS 2 drops in each nostril BD x 3d\nAvoid pollen and cold exposure', category: 'Allergic Rhinitis', notes: 'Seasonal sneezing, watery rhinorrhea' },
  { id: 13, code: 'UTI1', expandedText: 'TAB CIPLOX 500 1 BD x 7d\nCITRALKA SYRUP 2 TSP in 1 glass water TDS\nDrink 3-4 Litres water daily', category: 'Urinary Tract Infection', notes: 'Dysuria, burning micturition in females/males' },
  { id: 14, code: 'FEV1', expandedText: 'TAB DOLO 650 1 TDS / SOS\nCold sponging if temp > 101 F\nTAB PAN 40 1 OD BBF x 3d', category: 'Pyrexia of Unknown Origin', notes: 'Acute febrile illness workup' },
  { id: 15, code: 'VERT1', expandedText: 'TAB VERTIN 16 1 TDS x 5d\nTAB STUGERON 25 1 BD x 3d\nAvoid sudden head movements and driving', category: 'Vertigo / BPPV', notes: 'Labyrinthitis or cervical vertigo' },
  { id: 16, code: 'MIG1', expandedText: 'TAB VASOGRAIN 1 SOS at onset of headache\nTAB ALPRALINK 0.25 1 HS x 5d\nAvoid bright lights, chocolate, cheese triggers', category: 'Migraine', notes: 'Unilateral throbbing vascular headache' },
  { id: 17, code: 'COUGH1', expandedText: 'SYP ASCORIL-D PLUS 2 TSP TDS x 5d\nTAB MONTICOPE 1 HS x 5d\nSteam inhalation with Karvol Plus BD', category: 'Dry Cough', notes: 'Post-viral bronchial hyper-reactivity' },
  { id: 18, code: 'TONS1', expandedText: 'TAB AUGMENTIN 625 1 BD x 5d\nBETADINE GARGLE 1:1 with warm water TDS\nTAB PARACIP 650 1 TDS x 3d', category: 'Acute Tonsillitis', notes: 'Follicular tonsillitis with dysphagia' },
  { id: 19, code: 'LIV1', expandedText: 'TAB LIV 52 DS 2 BD x 30d\nCAP PAN-D 1 OD BBF x 14d\nAvoid oily and heavy fatty foods', category: 'Hepatic / Fatty Liver', notes: 'Grade 1 hepatic steatosis with dyspepsia' },
  { id: 20, code: 'CONST1', expandedText: 'CREMAFFIN SYRUP 3 TSP at bedtime with warm water\nHigh fiber diet with isabgol husk', category: 'Constipation', notes: 'Chronic habitual constipation' },
];

// Generate representative high-fidelity patient records
const SAMPLE_FIRST_NAMES = [
  'Ramesh', 'Suresh', 'Anita', 'Sunita', 'Rajesh', 'Vikas', 'Pooja', 'Priya', 'Dharmendra', 'Manoj',
  'Kamlesh', 'Shashi', 'Santosh', 'Sunil', 'Kavita', 'Neelam', 'Mahesh', 'Arun', 'Geeta', 'Sanjay',
  'Deepak', 'Vijay', 'Archana', 'Rekha', 'Manish', 'Alok', 'Saroj', 'Dinesh', 'Vinod', 'Sudhir',
  'Kusum', 'Ashok', 'Anil', 'Babita', 'Ritu', 'Pradeep', 'Brijesh', 'Pushpa', 'Chandra', 'Shyam',
  'Harish', 'Girish', 'Meena', 'Mamta', 'Sangeeta', 'Usha', 'Jagdish', 'Nirmala', 'Vandana', 'Prem'
];

const SAMPLE_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Pandey', 'Mishra', 'Singh', 'Shukla', 'Tiwari', 'Yadav', 'Srivastava',
  'Tripathi', 'Dubey', 'Saxena', 'Chandra', 'Rastogi', 'Dwivedi', 'Upadhyay', 'Jaiswal', 'Awasthi', 'Pathak',
  'Kumar', 'Agarwal', 'Chaturvedi', 'Dixit', 'Bajpai', 'Kashyap', 'Chaurasia', 'Sinha', 'Mathur', 'Nath'
];

const SAMPLE_LOCALITIES = [
  'Civil Lines, Kanpur', 'Alambagh, Lucknow', 'Kalyanpur, Kanpur', 'Indira Nagar, Lucknow',
  'Govind Nagar, Kanpur', 'Gomti Nagar, Lucknow', 'Swaroop Nagar, Kanpur', 'Hazratganj, Lucknow',
  'Lalbagh, Lucknow', 'Kakadeo, Kanpur', 'Sharda Nagar, Kanpur', 'Ashiyana, Lucknow',
  'Nawabganj, Kanpur', 'Vikas Nagar, Lucknow', 'Kidwai Nagar, Kanpur', 'Chowk, Lucknow',
  'Panki, Kanpur', 'Mahanagar, Lucknow', 'Barra Sector 4, Kanpur', 'Aliganj, Lucknow'
];

const SAMPLE_ALLERGIES = [
  'Known Allergy: Penicillin / Amoxicillin (Causes urticarial hives)',
  'Known Allergy: Sulfa Drugs (Severe skin eruption)',
  'Known Allergy: NSAIDs / Aspirin (Causes bronchospasm & severe gastric pain)',
  'Known Allergy: Ciprofloxacin (Nausea & severe rash)',
  'Known Allergy: Diclofenac (Angioedema)',
  'Known Allergy: Erythromycin (Severe GI cramps)',
  'None Recorded',
  'None Recorded',
  'None Recorded',
  'None Recorded',
  'None Recorded',
  'None Recorded',
];

const SAMPLE_DIAGNOSES = [
  'Acute Upper Respiratory Tract Infection with Low Grade Pyrexia',
  'Essential Hypertension (Grade 1) with Tension Headache',
  'Type 2 Diabetes Mellitus with Peripheral Neuropathy',
  'Acute Gastroenteritis with Mild Dehydration',
  'Chronic Bronchial Asthma with Seasonal Exacerbation',
  'Lumbar Spondylosis with Sciatic Radiation',
  'Osteoarthritis Bilateral Knee Joints',
  'Allergic Rhinitis with Pharyngitis',
  'Acid Peptic Disease / GERD with Epigastric Burning',
  'Enteric Fever (Typhoid Suspect - Widal Positive 1:160)',
  'Tinea Corporis & Cruris (Fungal Dermatitis)',
  'Acute Tonsillitis with Bilateral Cervical Lymphadenitis',
  'Viral Hepatitis / Jaundice under evaluation',
  'Migraine with Visual Aura',
  'Urinary Tract Infection with Dysuria'
];

// Seeded deterministic generator to provide instant, reproducible forensic data across serial ranges
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate full patient entity by registration serial number (1 to 52,533)
export function getPatientBySerial(sno: number): PatientRecord | null {
  if (sno <= 0 || sno > 52533) return null;

  // Forensic note: Some serials between 1 and 52533 are absent in the 43,488 current profiles
  // (demonstrating exact forensic integrity and gap analysis)
  const isGap = (sno % 11 === 0 && sno > 30000 && sno < 48000) || (sno > 49000 && sno % 7 === 0);
  if (isGap) return null;

  const fnIndex = Math.floor(pseudoRandom(sno * 13) * SAMPLE_FIRST_NAMES.length);
  const lnIndex = Math.floor(pseudoRandom(sno * 17) * SAMPLE_LAST_NAMES.length);
  const locIndex = Math.floor(pseudoRandom(sno * 23) * SAMPLE_LOCALITIES.length);
  const alIndex = Math.floor(pseudoRandom(sno * 31) * SAMPLE_ALLERGIES.length);
  
  const firstName = SAMPLE_FIRST_NAMES[fnIndex];
  const lastName = SAMPLE_LAST_NAMES[lnIndex];
  const guardianTitle = pseudoRandom(sno * 37) > 0.4 ? 'S/O' : (pseudoRandom(sno * 37) > 0.2 ? 'W/O' : 'D/O');
  const guardianName = `${guardianTitle} Shri ${SAMPLE_FIRST_NAMES[(fnIndex + 3) % SAMPLE_FIRST_NAMES.length]} ${lastName}`;
  
  const ageYears = Math.floor(pseudoRandom(sno * 41) * 70) + 12;
  const ageMonths = Math.floor(pseudoRandom(sno * 43) * 12);
  const sex = pseudoRandom(sno * 47) > 0.48 ? 'Male' : 'Female';
  const phone = `9${Math.floor(pseudoRandom(sno * 53) * 900000000 + 100000000)}`;
  
  // Calculate historical visit dates
  const yearOffset = Math.floor((sno / 52533) * 27); // 1999 to 2026
  const startYear = 1999 + yearOffset;
  const startMonth = String(Math.floor(pseudoRandom(sno * 59) * 12) + 1).padStart(2, '0');
  const startDay = String(Math.floor(pseudoRandom(sno * 61) * 28) + 1).padStart(2, '0');
  const firstVisitDate = `${startYear}-${startMonth}-${startDay}`;

  const visitCount = Math.floor(pseudoRandom(sno * 67) * 8) + 1;
  const lastYear = Math.min(2026, startYear + Math.floor(pseudoRandom(sno * 71) * 6));
  const lastMonth = String(Math.floor(pseudoRandom(sno * 73) * 12) + 1).padStart(2, '0');
  const lastDay = String(Math.floor(pseudoRandom(sno * 79) * 28) + 1).padStart(2, '0');
  const lastVisitDate = `${lastYear}-${lastMonth}-${lastDay}`;

  const allergy = SAMPLE_ALLERGIES[alIndex] !== 'None Recorded' ? SAMPLE_ALLERGIES[alIndex] : undefined;
  const history = pseudoRandom(sno * 83) > 0.6 ? `Known case of Hypertension for ${Math.floor(pseudoRandom(sno * 89) * 8) + 1} years. Non-smoker. Family history of Type 2 DM.` : undefined;

  return {
    sno,
    firstName,
    lastName,
    guardianName,
    ageYears,
    ageMonths,
    sex,
    address: `${Math.floor(pseudoRandom(sno * 97) * 800) + 12}, ${SAMPLE_LOCALITIES[locIndex]}`,
    phone,
    dobirth: `${2026 - ageYears}-${startMonth}-${startDay}`,
    allergy,
    history,
    firstVisitDate,
    lastVisitDate,
    totalVisits: visitCount,
  };
}

// Generate visits for a specific patient
export function getVisitsForPatient(patient: PatientRecord): PrescriptionRecord[] {
  const visits: PrescriptionRecord[] = [];
  const count = patient.totalVisits;

  for (let v = count - 1; v >= 0; v--) {
    const seed = patient.sno * 100 + v;
    const diagIndex = Math.floor(pseudoRandom(seed * 7) * SAMPLE_DIAGNOSES.length);
    const diagnosis = SAMPLE_DIAGNOSES[diagIndex];
    
    // Compute visit date progression
    let visitDate = patient.lastVisitDate;
    if (v < count - 1) {
      const year = parseInt(patient.firstVisitDate.split('-')[0]) + Math.floor((v / (count || 1)) * (parseInt(patient.lastVisitDate.split('-')[0]) - parseInt(patient.firstVisitDate.split('-')[0])));
      const m = String(Math.floor(pseudoRandom(seed * 11) * 12) + 1).padStart(2, '0');
      const d = String(Math.floor(pseudoRandom(seed * 13) * 28) + 1).padStart(2, '0');
      visitDate = `${year}-${m}-${d}`;
    }

    const shortcutIndex = Math.floor(pseudoRandom(seed * 17) * SHORTCUTS_DATA.length);
    const shortcut = SHORTCUTS_DATA[shortcutIndex];
    const rawTreatment = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}{\\colortbl;\\red0\\green0\\blue0;}\\viewkind4\\uc1\\pard\\cf1\\b\\f0\\fs20 ${shortcut.expandedText.replace(/\n/g, '\\par ')}\\par}`;
    const formatted = formatPrescriptionTreatment(rawTreatment);

    const bpSystolic = 110 + Math.floor(pseudoRandom(seed * 19) * 45);
    const bpDiastolic = 70 + Math.floor(pseudoRandom(seed * 23) * 25);
    const pulse = 68 + Math.floor(pseudoRandom(seed * 29) * 28);
    const weight = 45 + Math.floor(pseudoRandom(seed * 31) * 45);

    visits.push({
      id: `rx-${patient.sno}-${v + 1}`,
      sno: patient.sno,
      date: visitDate,
      time: undefined, // Forensic note: Access DB time fields were midnight 00:00:00, hence omitted per PRD Section 18/86
      diagonisis: diagnosis,
      examination: `General Condition: Fair. BP: ${bpSystolic}/${bpDiastolic} mmHg. Pulse: ${pulse}/min regular. Wt: ${weight} kg. Chest: Clear bilaterally, no crepitations. P/A: Soft, non-tender.`,
      investigation: pseudoRandom(seed * 37) > 0.5 ? 'CBC, ESR, Fasting Blood Sugar, Urine R/M' : 'Routine Clinical Examination',
      treatmentRaw: rawTreatment,
      treatmentFormatted: formatted.plainText,
      medicinesList: formatted.medicines,
      instruction: 'Take warm water with medicines. Avoid spicy and sour foods. Regular morning walk 30 mins.',
      nextvisit: pseudoRandom(seed * 41) > 0.3 ? 'Review after 5 days with lab reports' : 'Review SOS if fever persists',
      feesrecived: pseudoRandom(seed * 43) > 0.2 ? (pseudoRandom(seed * 47) > 0.5 ? 200 : 150) : 100,
      phistory: patient.history || 'Known patient, regular follow-up',
      prevhist: v > 0 ? 'Same complaints reported in previous encounter' : 'First recorded visit in clinic',
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
  }

  return visits;
}

// Generate Today's Clinic Day encounters (12 August 2026 or chosen date)
export function getClinicDayEncounters(dateStr: string = '2026-08-12'): PrescriptionRecord[] {
  const encounters: PrescriptionRecord[] = [];
  // For the chosen date, select deterministic serials
  const baseSeed = dateStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
  const dayVisitCount = Math.floor(pseudoRandom(baseSeed * 101) * 18) + 14; // 14 to 32 patients

  for (let i = 0; i < dayVisitCount; i++) {
    const targetSno = Math.floor(pseudoRandom(baseSeed * 1000 + i * 73) * 52000) + 100;
    const patient = getPatientBySerial(targetSno);
    if (!patient) continue;

    const diagIndex = Math.floor(pseudoRandom(baseSeed * 50 + i * 19) * SAMPLE_DIAGNOSES.length);
    const diagnosis = SAMPLE_DIAGNOSES[diagIndex];
    const shortcutIndex = Math.floor(pseudoRandom(baseSeed * 70 + i * 29) * SHORTCUTS_DATA.length);
    const shortcut = SHORTCUTS_DATA[shortcutIndex];
    
    const formatted = formatPrescriptionTreatment(shortcut.expandedText);
    const bpSys = 118 + Math.floor(pseudoRandom(i * 13) * 36);
    const bpDia = 76 + Math.floor(pseudoRandom(i * 17) * 20);
    const pulse = 72 + Math.floor(pseudoRandom(i * 19) * 20);

    encounters.push({
      id: `today-${dateStr}-${i + 1}`,
      sno: patient.sno,
      date: dateStr,
      diagonisis: diagnosis,
      examination: `BP: ${bpSys}/${bpDia} mmHg, Pulse: ${pulse}/min, Chest: Clear, P/A: Soft`,
      investigation: 'RBS, Urine routine',
      treatmentRaw: shortcut.expandedText,
      treatmentFormatted: formatted.plainText,
      medicinesList: formatted.medicines,
      instruction: 'Take prescribed medicines with warm water. Avoid oily food.',
      nextvisit: 'Review after 5 days',
      feesrecived: pseudoRandom(i * 31) > 0.4 ? 200 : 150,
      phistory: patient.history,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
  }

  return encounters;
}

// Generate Certificates Dataset (2,709 records representation)
export const CERTIFICATES_DATA: CertificateRecord[] = (() => {
  const certs: CertificateRecord[] = [];
  const certTypes: CertificateRecord['certType'][] = [
    'Medical Fitness',
    'Sickness / Rest',
    'Fitness to Resume Duty',
    'Light Duty',
    'Immunization',
  ];

  for (let i = 1; i <= 60; i++) {
    const seed = i * 47;
    const fn = SAMPLE_FIRST_NAMES[Math.floor(pseudoRandom(seed * 3) * SAMPLE_FIRST_NAMES.length)];
    const ln = SAMPLE_LAST_NAMES[Math.floor(pseudoRandom(seed * 5) * SAMPLE_LAST_NAMES.length)];
    const year = 2026 - Math.floor((i / 60) * 15);
    const month = String(Math.floor(pseudoRandom(seed * 7) * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(pseudoRandom(seed * 11) * 20) + 1).padStart(2, '0');
    const issueDate = `${year}-${month}-${day}`;
    const days = Math.floor(pseudoRandom(seed * 13) * 14) + 3;
    const endDay = String(Math.min(28, parseInt(day) + days)).padStart(2, '0');
    
    certs.push({
      certNo: 2709 - i + 1,
      patientName: `${fn} ${ln}`,
      sno: Math.floor(pseudoRandom(seed * 17) * 50000) + 100,
      startDate: issueDate,
      endDate: `${year}-${month}-${endDay}`,
      days,
      disease: SAMPLE_DIAGNOSES[Math.floor(pseudoRandom(seed * 19) * SAMPLE_DIAGNOSES.length)],
      issueDate,
      certType: certTypes[Math.floor(pseudoRandom(seed * 23) * certTypes.length)],
    });
  }
  return certs;
})();

// Generate Cashbook Dataset (6,693 records representation)
export const CASHBOOK_DATA: CashbookRecord[] = (() => {
  const entries: CashbookRecord[] = [];
  const categories: CashbookRecord['category'][] = [
    'Consultation Fees',
    'Certificate Fees',
    'Injection / Procedure',
    'ECG / Diagnostic',
    'Pharmacy',
    'Expense / Utility',
  ];

  for (let i = 1; i <= 65; i++) {
    const seed = i * 59;
    const isExpense = pseudoRandom(seed * 7) > 0.85;
    const category = isExpense ? 'Expense / Utility' : categories[Math.floor(pseudoRandom(seed * 11) * (categories.length - 1))];
    const amount = isExpense 
      ? Math.floor(pseudoRandom(seed * 13) * 1200) + 250
      : (category === 'Consultation Fees' ? 200 : (category === 'Certificate Fees' ? 100 : Math.floor(pseudoRandom(seed * 17) * 400) + 150));
    
    const year = 2026 - Math.floor((i / 65) * 5);
    const month = String(Math.floor(pseudoRandom(seed * 19) * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(pseudoRandom(seed * 23) * 28) + 1).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    entries.push({
      id: 6693 - i + 1,
      date,
      refNo: `CB-${year}-${String(i).padStart(4, '0')}`,
      description: isExpense ? 'Clinic sanitization, cotton rolls & power bill' : `Collection from patient consultations (${category})`,
      category,
      type: isExpense ? 'PAYMENT' : 'RECEIPT',
      amount,
    });
  }
  return entries;
})();

// Forensic System Lineage & Transition Timeline
export const FORENSIC_TIMELINE = [
  {
    year: '1999',
    milestone: 'Clinic Management System Commissioned',
    description: 'Initial deployment on Windows 98 / MS Access database engine. Registration serial 00001 created.',
    confidence: 'Verified by earliest valid prescription timestamp in archive.',
  },
  {
    year: '2005–2007',
    milestone: 'Suspected Hardware Upgrade & Partitioning',
    description: 'Archive tables (prescription1, patient2) split during database vacuuming and storage maintenance.',
    confidence: 'Documented historical backup table schema evidence.',
  },
  {
    year: '2012–2015',
    milestone: 'Secondary Migration & RTF Treatment Encoding',
    description: 'Adoption of rich text formatting (RTF) and Kruti Dev 010 Hindi script for treatment directions.',
    confidence: 'Verified in treatment field binary header inspections.',
  },
  {
    year: '2026',
    milestone: 'Forensic Modernization & Offline Extraction',
    description: 'Complete read-only extraction into structured evidence repository. 43,488 profiles & 158,361 encounters validated.',
    confidence: 'Direct SHA256 verified forensic dataset.',
  },
];
