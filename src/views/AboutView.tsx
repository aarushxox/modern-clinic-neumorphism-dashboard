import React from 'react';
import {
  ShieldCheck,
  Printer,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="badge-lilac px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Forensic Verification &amp; Modernization</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Dr. J.S. Pandey Clinic Intelligence System
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Prepared by HexAtom Engineering for Dr. J.S. Pandey Clinic Legacy Modernization.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="neu-pill-btn h-9 px-4 text-xs font-semibold text-[var(--text-primary)] rounded-full flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>Print Audit Report</span>
        </button>
      </div>

      {/* Forensic Verification Summary */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2.5">
          Forensic Demonstration Purpose &amp; Provenance
        </h3>
        <p>
          This demonstration system is a{' '}
          <strong className="text-[var(--text-primary)]">read-only forensic artifact</strong>{' '}
          developed to allow the clinic owner to visually audit and verify that 27 years of clinical history (1999–2026) have been accurately extracted, decoded, and indexed from the legacy Microsoft Access / Visual Basic clinic management system.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--surface-muted)] p-4 rounded-[18px] border border-[var(--border)] font-mono text-center">
          <div>
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans font-semibold">
              Active Profiles
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">43,488</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans font-semibold">
              Total Encounters
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">158,361</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans font-semibold">
              Drugs Master
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">73 Formulations</div>
          </div>
          <div>
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans font-semibold">
              Keyboard Codes
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] mt-0.5">357 Macros</div>
          </div>
        </div>
      </div>

      {/* Verified Known Limitations */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--pastel-sand-fg)]" />
          <span>Verified Forensic Scope &amp; Known Limitations</span>
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
          <li>
            <strong className="text-[var(--text-primary)]">Read-Only Forensic Mode:</strong> No record creation, update, or deletion is permitted in this phase to prevent accidental corruption of historical evidence.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Registration Serial Gaps:</strong> Current patient profiles total 43,488 while the highest observed registration serial is 52,533. Missing sequential numbers represent legacy partition gaps.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Time-of-Day Fields:</strong> Historical database records store midnight (00:00:00) timestamps for encounter times; hence arbitrary time-of-day values are omitted.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Offline Local Architecture:</strong> Operates 100% locally on the doctor&apos;s workstation without cloud APIs, remote servers, or internet dependencies.
          </li>
        </ul>
      </div>

      {/* Proposed Modernization Architecture Comparison Matrix */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-full grid place-items-center shrink-0"
            style={{ background: 'var(--pastel-blue-bg)', color: 'var(--pastel-blue-fg)' }}
          >
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Modernization Roadmap: Phase 1 (Forensic Demo) vs Phase 2 (Production)
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Clear distinction between this forensic demonstration and the proposed future clinic software
            </p>
          </div>
        </div>

        <div className="border border-[var(--border)] rounded-[18px] overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-bold uppercase text-[10.5px] border-b border-[var(--border)]">
              <tr>
                <th className="p-3.5">Functional Capability</th>
                <th className="p-3.5 w-1/3" style={{ color: 'var(--pastel-sand-fg)' }}>
                  Phase 1: Current Forensic Demo
                </th>
                <th className="p-3.5 w-1/3" style={{ color: 'var(--pastel-blue-fg)' }}>
                  Phase 2: Proposed Production System
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              <tr>
                <td className="p-3.5 font-semibold text-[var(--text-primary)]">Database Engine</td>
                <td className="p-3.5 text-[var(--text-secondary)]">Read-Only Forensic CSV Cache</td>
                <td className="p-3.5 font-bold" style={{ color: 'var(--pastel-blue-fg)' }}>
                  High-Speed ACID SQLite 3 Engine
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[var(--text-primary)]">
                  Record Modification (CRUD)
                </td>
                <td className="p-3.5 font-medium" style={{ color: 'var(--pastel-rose-fg)' }}>
                  Strictly Prohibited (Read-Only)
                </td>
                <td className="p-3.5 font-semibold" style={{ color: 'var(--pastel-sage-fg)' }}>
                  Full Create, Edit, Follow-up &amp; Delete
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[var(--text-primary)]">
                  Prescription Printing
                </td>
                <td className="p-3.5 text-[var(--text-secondary)]">Browser Print Preview Report</td>
                <td className="p-3.5 font-semibold" style={{ color: 'var(--pastel-blue-fg)' }}>
                  Custom Thermal &amp; Letterhead Printer Engine
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[var(--text-primary)]">
                  Automated Backup System
                </td>
                <td className="p-3.5 text-[var(--text-secondary)]">Not active in demo</td>
                <td className="p-3.5 font-semibold" style={{ color: 'var(--pastel-blue-fg)' }}>
                  One-click &amp; Daily Scheduled Encrypted Backups
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-[var(--text-primary)]">
                  Multi-Station Reception Queue
                </td>
                <td className="p-3.5 text-[var(--text-secondary)]">Single Doctor View</td>
                <td className="p-3.5 font-semibold" style={{ color: 'var(--pastel-blue-fg)' }}>
                  Reception Token Queue + Doctor Chamber Sync
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className="p-3.5 rounded-[16px] text-xs border flex items-center gap-2.5"
          style={{
            background: 'var(--pastel-blue-bg)',
            color: 'var(--pastel-blue-fg)',
            borderColor: 'var(--pastel-blue-border)',
          }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Ready to proceed with official SQLite database schema creation upon doctor approval.
          </span>
        </div>
      </div>
    </div>
  );
};
