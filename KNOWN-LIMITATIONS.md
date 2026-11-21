# Known Limitations & Forensic Qualifications — Dr. J.S. Pandey Clinic

This document lists the deliberate, verified operational boundaries and forensic characteristics of the Phase 1 demonstration system.

---

### 1. Read-Only Forensic Immutability
- **Constraint:** This demonstration version is strictly read-only.
- **Rationale:** To protect the integrity of the 27-year extracted archive during demonstration and prevent accidental writes, deletions, or data corruption before the production database is initialized.

---

### 2. Patient Profile Count vs Registration Serial Ceiling
- **Observation:** The `patient` table contains **43,488** distinct active records, whereas the highest registration number is **52,533**.
- **Explanation:** The difference of ~9,045 serials is due to legacy partition archiving (e.g. `patient2`, `patient9`), serial skipping, and purged test records across past clinic PC upgrades. No synthetic placeholder rows have been invented.

---

### 3. Timestamp Precision
- **Observation:** Encounter dates are recorded with date granularity (DD-MM-YYYY), and time-of-day fields contain `00:00:00`.
- **Explanation:** The legacy Access database did not capture minute-level consultation timestamps. The modern system preserves exact historical dates without fabricating synthetic time-of-day values.

---

### 4. Rich Text Format (RTF) Nuances
- **Observation:** Legacy prescription treatments occasionally contain custom formatting tokens from legacy Visual Basic text boxes.
- **Handling:** All instructions have been parsed into Unicode Hindi and clean dosage tables. An optional "Show Forensic RTF" button allows doctors and engineers to inspect raw byte streams when desired.

---

### 5. Multi-Station Reception Queue & Prescription Printing
- **Status in Phase 1:** Single workstation demonstration view with browser print preview.
- **Production Roadmap (Phase 2):** High-speed SQLite database engine, multi-terminal reception-to-chamber synchronization, thermal receipt printing, and automated daily encrypted cloud/USB backups.
