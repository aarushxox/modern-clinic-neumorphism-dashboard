import React, { useMemo } from 'react';
import { Pill, Building2, ShieldCheck } from 'lucide-react';
import { ClinicDataProvider } from '../services/dataProvider';
import { DrugMasterRecord } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';

export const MedicinesView: React.FC = () => {
  const drugs = useMemo(() => ClinicDataProvider.getDrugs(), []);

  const columns: Column<DrugMasterRecord>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
      render: (d) => (
        <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
          #{d.id}
        </span>
      ),
    },
    {
      key: 'tradeName',
      header: 'Trade / Brand Name',
      render: (d) => (
        <div className="space-y-1">
          <div className="font-bold text-[var(--text-primary)] text-sm">
            {d.tradeName}
          </div>
          <span className="badge-lilac inline-flex items-center px-2.5 py-0.5 text-[10.5px] font-semibold">
            {d.category}
          </span>
        </div>
      ),
    },
    {
      key: 'genericName',
      header: 'Generic Chemical Formula',
      render: (d) => (
        <span className="font-medium text-[var(--text-secondary)] text-xs leading-relaxed">
          {d.genericName}
        </span>
      ),
    },
    {
      key: 'company',
      header: 'Pharmaceutical Company',
      render: (d) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <span>{d.company}</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">{d.representative}</div>
        </div>
      ),
    },
    {
      key: 'cost',
      header: 'Unit Cost / MRP',
      width: 'w-28',
      render: (d) => (
        <span className="badge-sage inline-flex items-center font-mono font-bold px-2.5 py-0.5 text-xs tabular-nums">
          ₹{d.cost.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'sideEffects',
      header: 'Reported Side Effects / Caution',
      render: (d) => (
        <span className="text-xs text-[var(--text-muted)] italic leading-relaxed">
          {d.sideEffects}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-lilac px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" />
              <span>Drugs Master Directory</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Table: Drugs.csv (LOOKUP)
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Master Formulary &amp; Medicine Registry ({drugs.length} Drugs)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Read-only master catalog of pharmaceutical brands, generic salt formulations, manufacturer representatives, and costs.
          </p>
        </div>

        <div className="badge-neutral px-3.5 py-2 text-xs font-medium inline-flex items-center gap-2 self-start md:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4 text-[var(--pastel-sage-fg)] shrink-0" />
          <span>
            <strong className="text-[var(--text-primary)]">Mode:</strong> Read-Only Demonstration
          </span>
        </div>
      </div>

      {/* Drugs Data Table */}
      <DataTable
        id="drugs-master-table"
        title="Formulary Catalog"
        subtitle={`${drugs.length} Verified Pharmaceutical Drugs`}
        columns={columns}
        data={drugs}
        searchKeys={['tradeName', 'genericName', 'company', 'category', 'representative']}
        searchPlaceholder="Search brand name, generic salt, company, or category..."
        defaultPageSize={25}
        exportFilename="drugs_master_formulary.csv"
      />
    </div>
  );
};
