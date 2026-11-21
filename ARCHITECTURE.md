# Architecture Documentation — Dr. J.S. Pandey Clinic System

## 1. Architectural Philosophy
The system follows a strict **Decoupled Service-Oriented Architecture (SOA)** designed specifically for forensic integrity, zero-installation portability, and future migration readiness.

```text
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│  (Header, Multi-Mode Sidebar, Dynamic Views, Modals, Print) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Clinic Data Provider Service                │
│                     (dataProvider.ts)                       │
│  • Search Engine (Multi-field, case-insensitive, fuzzy)     │
│  • Timeline & Aggregator (1999–2026 Time Series)            │
│  • RTF & Kruti-Dev Converter (krutiDevConverter.ts)         │
│  • Pagination, Filtering & Safe CSV Exporter                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Forensic Data Layer                     │
│  • Phase 1 (Current): Read-Only In-Memory Forensic Cache    │
│  • Phase 2 (Production): High-Speed SQLite 3 ACID Database  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Decoupled Provider Layer (`dataProvider.ts`)
The UI components never query raw data structures directly. All requests pass through the `ClinicDataProvider` interface:
- `searchPatients(filter, page, pageSize)`
- `getPatientBySno(sno)`
- `getPatientVisits(patient)`
- `getClinicDayEncounters(date)`
- `getDrugs()`, `getShortcuts()`, `getCertificates()`, `getCashbook()`
- `getHistoricalReports()`

**Benefit:** Switching the underlying data store from in-memory CSV/JSON cache to a local SQLite database in Phase 2 requires changing only the internal implementation of `dataProvider.ts` without modifying a single UI component.

## 3. Legacy RTF & Kruti-Dev Conversion Pipeline
Legacy prescriptions contain text formatted with Microsoft RTF headers and Kruti-Dev 010 font encoding. The conversion pipeline:
1. Strips RTF control codes (`\rtf1`, `\ansi`, `\deff0`, `\fonttbl`, `\colortbl`).
2. Extracts plain text and identify Kruti-Dev code points.
3. Translates code points to Unicode Devanagari using an AST character mapping dictionary.
4. Parses structured dosage tokens (`TAB`, `CAP`, `SYP`, `1-0-1`, duration, Hindi instructions).

## 4. Security & Immutability Guarantees
- **Read-Only Enforced:** No write, update, or delete methods exist in the data provider.
- **Local Sandbox:** Operates entirely within the browser/embedded sandbox without network egress.
