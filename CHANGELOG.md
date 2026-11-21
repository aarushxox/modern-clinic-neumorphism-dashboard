# Changelog — Dr. J.S. Pandey Clinic Forensic Intelligence & Modernization System

All notable changes to the forensic demonstration system are documented in this file.

## [2.0.0] - 2026-08-13

### Architecture & System Core
- **Portable Architecture:** Implemented completely offline, self-contained demonstration architecture requiring zero external runtime dependencies, zero Python, zero Node.js on client workstations.
- **Data Provider Abstraction:** Engineered `ClinicDataProvider` service layer isolating UI components from underlying storage engines, preparing the system for seamless SQLite transition in Phase 2.
- **Data Honesty Guardrails:** Implemented strict forensic separation between active profiles (43,488) and the highest registration serial ceiling (52,533).

### Clinical Modules
- **Clinic Dashboard:** Created Bento KPI grid displaying 43,488 profiles, 158,361 visits, 73 master drugs, 357 keyboard shortcuts, 2,709 certificates, and 6,693 cashbook records.
- **Today's Clinic Day View:** Defaulted view honestly to the latest recorded clinic date (`2026-08-12`) with interactive jump-to-date calendar picker.
- **Patient Search & Longitudinal Profile:** Multi-field deterministic search across registration numbers, names, guardian names, phone numbers, and addresses. Includes prominent allergy warnings and chronological encounter timeline.
- **RTF & Hindi Treatment Engine:** Implemented Kruti-Dev 010 and binary RTF converter parsing legacy Hindi instructions (e.g., *"१ गोली सुबह-शाम खाने के बाद"*) into structured dosage tables.
- **Formulary & Shortcuts:** Added master drugs catalog (73 records) and 357 clinical prescription keyboard shortcuts.
- **Certificates & Cashbook:** Added searchable medical fitness/sick leave certificates (2,709 records) and cashbook ledger entries (6,693 records).

### Forensic Audit & Analytics
- **Data Health & Lineage:** Built visual taxonomy classifying tables into CORE, LOOKUP, DUMP partitions, and ERROR remnants with 1999–2026 milestone timeline.
- **Technical Data Explorer:** Added schema inspector and data table browser for all 22 database tables with safe local CSV export.
- **Reports & Analytics:** Created pure SVG/CSS time-series charts for annual visit volumes, revenue estimates, patient registrations, and diagnosis distributions without external CDN dependencies.
- **Doctor Presentation Guide:** Integrated 10-step interactive walkthrough modal for live clinic demonstrations.
