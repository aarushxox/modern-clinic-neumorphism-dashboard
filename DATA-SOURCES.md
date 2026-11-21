# Data Sources & Forensic Provenance Registry — Dr. J.S. Pandey Clinic

This registry documents all 22 database tables recovered from the Microsoft Access MDB clinic archive and explains their roles, row counts, and classification.

## 1. Summary Statistics
- **Total Recovered Tables:** 22 Tables
- **Total Forensic Rows:** 252,020 Rows across all tables
- **Active Operational Profiles:** 43,488 Patients
- **Active Operational Encounters:** 158,361 Prescriptions
- **Historical Era:** 1999–2026 (27 Years)

---

## 2. Table Taxonomy & Classifications

### A. CORE Operational Tables (4 Tables / 210,251 Rows)
Primary active clinic entities used in daily consultations:
1. `patient` (43,488 rows) — Primary patient master registry (sno, name, age, guardian, contact, address, allergy, history).
2. `prescription` (158,361 rows) — Clinical encounter ledger (sno, date, diagonisis, examination, investigation, treatment, feesrecived, nextvisit).
3. `certificate` (2,709 rows) — Issued medical fitness, rest, and resumption certificates.
4. `cashbook` (6,693 rows) — Daily financial cash journal and expense vouchers.

### B. LOOKUP Reference Dictionaries (9 Tables / 479 Rows)
Master formularies, clinical shorthand macros, and system dictionaries:
1. `Drugs` (73 rows) — Pharmaceutical drug master (brand, generic salt, company, MR, cost, side effects).
2. `shortcut` (357 rows) — Clinical prescription keyboard shortcuts (URI1, AP1, HTN1, etc.).
3. `labdet` (22 rows) — Master lab investigation tests list.
4. `Account` (12 rows) — Primary chart of financial accounts.
5. `stock` (6 rows) — Clinic inventory stock categories.
6. `formatp` (4 rows) — Prescription print layout formats.
7. `dept` (2 rows) — Department classification.
8. `company` (2 rows) — Corporate accounts.
9. `users` (1 row) — Legacy administrator credentials record.

### C. DUMP / Historical Backup Partitions (7 Tables / 39,510 Rows)
Historical snapshot partitions from legacy PC upgrades and system backups:
1. `patient9` (11,231 rows) — 2009 historical patient master snapshot.
2. `patient2` (10,949 rows) — 2002 historical patient master snapshot.
3. `prescription1` (6,603 rows) — Historical prescription archive partition 1.
4. `prescription2` (5,414 rows) — Historical prescription archive partition 2.
5. `prescription66` (4,817 rows) — Historical prescription archive partition 66.
6. `prescription8` (431 rows) — Historical prescription archive partition 8.
7. `prescription-6` (65 rows) — Legacy archive partition.

### D. ERROR / Remnant Tables (2 Tables / 1,780 Rows)
Export delimiter anomalies and corrupted legacy remnants:
1. `prescription_ExportErrors` (1,778 rows) — Remnants from legacy Access text exports where embedded newlines or unescaped commas broke row parsing.
2. `Account2` (2 rows) — Legacy test table remnant.
