import React, { useMemo } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { ClinicDataProvider } from '../services/dataProvider';
import { ShortcutRecord } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';

export const ShortcutsView: React.FC = () => {
  const shortcuts = useMemo(() => ClinicDataProvider.getShortcuts(), []);

  const columns: Column<ShortcutRecord>[] = [
    {
      key: 'code',
      header: 'Shortcut Code',
      width: 'w-32',
      render: (s) => (
        <span className="badge-blue inline-flex items-center font-mono font-bold px-3 py-1 text-xs">
          {s.code}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Clinical Category / Indication',
      width: 'w-48',
      render: (s) => (
        <span className="badge-neutral inline-flex items-center font-semibold px-2.5 py-0.5 text-xs">
          {s.category}
        </span>
      ),
    },
    {
      key: 'expandedText',
      header: 'Expanded Prescription Protocol (Auto-Typed)',
      render: (s) => (
        <div className="font-mono text-xs text-[var(--text-primary)] bg-[var(--surface-muted)] p-3 rounded-[14px] border border-[var(--border)] whitespace-pre-wrap leading-relaxed">
          {s.expandedText}
        </div>
      ),
    },
    {
      key: 'notes',
      header: 'Clinical Notes / Protocol Guidance',
      render: (s) => (
        <span className="text-xs text-[var(--text-muted)] italic">{s.notes || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-blue px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Keyboard Prescription Macros</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Table: shortcut.csv (LOOKUP)
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Clinical Shorthand &amp; Keyboard Shortcuts ({shortcuts.length} Defined Codes)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Historical keyboard shorthand codes used by the doctor to instantly populate multi-drug regimens during rapid consultation.
          </p>
        </div>

        <div className="badge-sage px-3.5 py-2 text-xs font-medium inline-flex items-center gap-2 self-start md:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>All 357 shortcut macros preserved in modern build</span>
        </div>
      </div>

      {/* Shortcuts Data Table */}
      <DataTable
        id="shortcuts-data-table"
        title="Shortcuts Directory"
        subtitle="357 Clinical Keyboard Prescription Shorthands"
        columns={columns}
        data={shortcuts}
        searchKeys={['code', 'category', 'expandedText', 'notes']}
        searchPlaceholder="Search code (e.g. URI1, AP1, HTN1), category, or drug name..."
        defaultPageSize={25}
        exportFilename="clinical_keyboard_shortcuts.csv"
      />
    </div>
  );
};
