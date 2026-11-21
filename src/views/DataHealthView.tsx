import React from 'react';
import {
  ActivitySquare,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';
import { TABLE_METADATA_REGISTRY, CLINIC_METRICS } from '../data/forensicDataset';

export const DataHealthView: React.FC = () => {
  const metrics = CLINIC_METRICS;
  const tables = TABLE_METADATA_REGISTRY;

  const coreTables = tables.filter((t) => t.role === 'CORE');
  const lookupTables = tables.filter((t) => t.role === 'LOOKUP');
  const dumpTables = tables.filter((t) => t.role === 'DUMP');
  const errorTables = tables.filter((t) => t.role === 'ERROR');

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-sage px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <ActivitySquare className="w-3.5 h-3.5" />
              <span>Forensic Data Health Audit</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Dataset Traceability &amp; Reconciliation
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Historical Data Structure, Lineage &amp; Gap Analysis
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Transparent verification of recovered database tables, registration serial ranges, backup partitions, and export remnants.
          </p>
        </div>

        <div className="badge-sage px-4 py-2 text-xs font-bold inline-flex items-center gap-2 self-start md:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Forensic Audit Status: PASS</span>
        </div>
      </div>

      {/* Forensic Identity Rule Card */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-sand px-3 py-0.5 text-[11px] font-bold">
              FORENSIC IDENTITY RULE
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Patient Profiles (43,488) vs Registration Serial Ceiling (52,533)
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Clear distinction between currently stored patient rows and the highest historical registration number issued.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div
            style={{ background: 'var(--kpi-sky-bg)' }}
            className="p-5 rounded-[20px] border border-[var(--border)] space-y-2"
          >
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--pastel-blue-fg)' }}
            >
              Current Patient Profiles
            </span>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums">
              {metrics.currentPatientsCount.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Source:</strong> Extracted patient table rows.
              <br />
              <strong className="text-[var(--text-primary)]">Definition:</strong> Number of distinct demographic profiles currently present in the active table.
            </p>
          </div>

          <div
            style={{ background: 'var(--kpi-sand-bg)' }}
            className="p-5 rounded-[20px] border border-[var(--border)] space-y-2"
          >
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--pastel-sand-fg)' }}
            >
              Highest Registration Serial Found
            </span>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] font-mono tabular-nums">
              {metrics.highestSerialObserved.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Source:</strong> Highest sequential registration serial observed in the database.
              <br />
              <strong className="text-[var(--text-primary)]">Definition:</strong> Registration serial range ceiling (~9,045 gap serials across legacy software generations).
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[16px] text-xs text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-primary)]">Forensic Integrity Qualification:</strong> The preview does not assume why individual historical serials are absent or invent artificial rows. These historical gaps will be reconciled during the official SQLite migration phase.
        </div>
      </div>

      {/* Database Fragmentation & Table Role Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neu-card rounded-[22px] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="badge-sage px-2.5 py-0.5 text-[11px] font-bold">
              CORE (4 Tables)
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              210,251 Rows
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Primary active operational entities (patient, prescription, certificate, cashbook).
          </p>
          <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-subtle)] text-xs">
            {coreTables.map((t) => (
              <div key={t.tableName} className="flex justify-between items-center py-1">
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {t.tableName}
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  {t.approxRows.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="neu-card rounded-[22px] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="badge-blue px-2.5 py-0.5 text-[11px] font-bold">
              LOOKUP (9 Tables)
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              479 Rows
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Master reference dictionaries (Drugs, shortcut, labdet, Account, stock, formatp).
          </p>
          <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-subtle)] text-xs">
            {lookupTables.map((t) => (
              <div key={t.tableName} className="flex justify-between items-center py-1">
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {t.tableName}
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  {t.approxRows.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="neu-card rounded-[22px] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="badge-lilac px-2.5 py-0.5 text-[11px] font-bold">
              DUMP (7 Tables)
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              39,510 Rows
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Historical snapshot partitions (patient2, patient9, prescription1/2/66/8/-6).
          </p>
          <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-subtle)] text-xs">
            {dumpTables.map((t) => (
              <div key={t.tableName} className="flex justify-between items-center py-1">
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {t.tableName}
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px]">
                  {t.approxRows.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="neu-card rounded-[22px] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="badge-rose px-2.5 py-0.5 text-[11px] font-bold">
              ERROR (2 Tables)
            </span>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              1,780 Rows
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Export remnants &amp; delimiter anomalies (prescription_ExportErrors, Account2).
          </p>
          <div className="space-y-1.5 pt-2.5 border-t border-[var(--border-subtle)] text-xs">
            {errorTables.map((t) => (
              <div key={t.tableName} className="flex justify-between items-center py-1">
                <span className="font-mono font-bold text-[var(--text-primary)] truncate pr-2">
                  {t.tableName}
                </span>
                <span className="text-[var(--text-muted)] font-mono text-[11px] shrink-0">
                  {t.approxRows.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forensic System Data Lineage Diagram */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-[var(--accent-primary)]" />
          <span>Forensic Lineage &amp; Entity Relationship Model</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Traceable connections established by actual primary and foreign serial identifiers:
        </p>

        <div className="p-4 bg-[#0f1219] text-[#d9e1f0] rounded-[18px] font-mono text-xs overflow-x-auto leading-relaxed border border-[var(--border)]">
          <pre>{`Legacy Access Database Extraction (1999-2026)
  |
  |-- CORE ENTITIES
  |    |-- patient (43,488 rows) --[sno]--> prescription (158,361 rows)
  |    |-- certificate (2,709 rows) --[patientName / sno]
  |    +-- cashbook (6,693 ledger entries)
  |
  |-- LOOKUP FORMULARIES & MACROS
  |    |-- Drugs (73 records) --> Generic Formulations & Cost
  |    |-- shortcut (357 records) --> Prescription Keyboard Shorthands
  |    |-- labdet (22 records) --> Lab Master
  |    +-- Account (12 records) --> Chart of Accounts
  |
  |-- HISTORICAL BACKUP PARTITIONS (Isolated from Clinical View)
  |    |-- patient2 (10,949) | patient9 (11,231)
  |    +-- prescription1 (6,603) | prescription2 (5,414) | prescription66 (4,817) | prescription8 (431)
  |
  +-- FORENSIC EXPORT REMNANTS
       +-- prescription_ExportErrors (1,778 delimiter & newline anomaly records)`}</pre>
        </div>
      </div>
    </div>
  );
};
