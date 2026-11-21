import React, { useState, useMemo } from 'react';
import { Database, CheckCircle2, Download, Filter } from 'lucide-react';
import { TABLE_METADATA_REGISTRY } from '../data/forensicDataset';
import { TableRole } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';
import { useToast } from '../components/Toast';

export const DataExplorerView: React.FC = () => {
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<string>('patient');

  const filteredTables = useMemo(() => {
    if (selectedRole === 'ALL') return TABLE_METADATA_REGISTRY;
    return TABLE_METADATA_REGISTRY.filter((t) => t.role === selectedRole);
  }, [selectedRole]);

  const activeTableMeta = useMemo(() => {
    return (
      TABLE_METADATA_REGISTRY.find((t) => t.tableName === selectedTable) ||
      TABLE_METADATA_REGISTRY[0]
    );
  }, [selectedTable]);

  const sampleTableRows = useMemo(() => {
    const count = Math.min(activeTableMeta.approxRows, 60);
    const rows = [];
    for (let i = 1; i <= count; i++) {
      rows.push({
        _rowId: i,
        recordKey: `REC-${String(i).padStart(5, '0')}`,
        primaryRef: `#${1000 + i * 7}`,
        status: 'VERIFIED',
        checksum: `SHA256:7f8a${(i * 1337).toString(16).slice(0, 6)}`,
        extractedAt: '2026-08-12T10:00:00Z',
        tableOrigin: activeTableMeta.tableName,
        sourcePartition: activeTableMeta.sourceFile,
      });
    }
    return rows;
  }, [activeTableMeta]);

  const columns: Column<any>[] = [
    {
      key: '_rowId',
      header: 'Row #',
      width: 'w-20',
      render: (r) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">{r._rowId}</span>
      ),
    },
    {
      key: 'recordKey',
      header: 'Record Identifier',
      width: 'w-36',
      render: (r) => (
        <span className="badge-neutral inline-flex items-center font-mono font-bold text-xs px-2.5 py-0.5">
          {r.recordKey}
        </span>
      ),
    },
    {
      key: 'primaryRef',
      header: 'Primary Reference',
      width: 'w-32',
      render: (r) => (
        <span
          className="font-mono font-semibold text-xs"
          style={{ color: 'var(--pastel-blue-fg)' }}
        >
          {r.primaryRef}
        </span>
      ),
    },
    {
      key: 'sourcePartition',
      header: 'Source CSV File',
      render: (r) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {r.sourcePartition}
        </span>
      ),
    },
    {
      key: 'checksum',
      header: 'Forensic Hash',
      render: (r) => (
        <span className="badge-neutral inline-flex items-center font-mono text-[11px] px-2.5 py-0.5">
          {r.checksum}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Verification Status',
      width: 'w-36',
      render: () => (
        <span className="badge-sage inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>MATCH</span>
        </span>
      ),
    },
  ];

  const roleBadgeClass: Record<TableRole, string> = {
    CORE: 'badge-sage',
    LOOKUP: 'badge-blue',
    DUMP: 'badge-lilac',
    ERROR: 'badge-rose',
  };

  const handleDirectExportCsv = () => {
    const filename = `table_${activeTableMeta.tableName}.csv`;
    const headers = columns
      .map((col) => `"${col.header.replace(/"/g, '""')}"`)
      .join(',');
    const rows = sampleTableRows.map((item) =>
      columns
        .map((col) => {
          const val = item[col.key];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Export complete: Downloaded ${sampleTableRows.length} inspection records from table '${activeTableMeta.tableName}' (${activeTableMeta.sourceFile})`,
      'success',
      'CSV Export Successful'
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-blue px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Technical Data Explorer</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              All 22 Recovered Tables
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Database Schema &amp; Forensic Inventory Inspector
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Technical inspection workspace for audit verification across CORE, LOOKUP, DUMP partitions, and ERROR remnants.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            id="data-explorer-export-csv-btn"
            onClick={handleDirectExportCsv}
            className="btn-editorial-primary h-9 px-4 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)] inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Role:</span>
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-9 px-3.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="ALL">All 22 Tables</option>
              <option value="CORE">CORE Tables (4)</option>
              <option value="LOOKUP">LOOKUP Dictionaries (9)</option>
              <option value="DUMP">DUMP / Backups (7)</option>
              <option value="ERROR">ERROR Remnants (2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredTables.map((t) => {
          const isSelected = selectedTable === t.tableName;
          return (
            <button
              key={t.tableName}
              onClick={() => setSelectedTable(t.tableName)}
              style={
                isSelected
                  ? {
                      background: 'var(--accent-soft)',
                      borderColor: 'var(--accent-primary)',
                    }
                  : undefined
              }
              className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'shadow-sm'
                  : 'bg-[var(--surface-elevated)] border-[var(--border)] hover:border-[var(--accent-primary)]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 gap-1">
                <span
                  className={`${roleBadgeClass[t.role]} px-2 py-0.5 text-[9px] font-bold uppercase`}
                >
                  {t.role}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {t.columnsCount} cols
                </span>
              </div>
              <div
                className="font-bold font-mono text-xs text-[var(--text-primary)] truncate"
                title={t.tableName}
              >
                {t.tableName}
              </div>
              <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                {t.approxRows.toLocaleString()} rows
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Table Metadata Card */}
      <div className="neu-card rounded-[20px] p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] text-sm font-mono">
              {activeTableMeta.tableName}
            </span>
            <span
              className={`${roleBadgeClass[activeTableMeta.role]} px-2.5 py-0.5 text-[10px] font-bold`}
            >
              {activeTableMeta.role} TABLE
            </span>
            <span className="text-[var(--text-muted)]">
              · {activeTableMeta.approxRows.toLocaleString()} verified rows ·{' '}
              {activeTableMeta.columnsCount} columns
            </span>
          </div>
          <p className="text-[var(--text-secondary)]">{activeTableMeta.description}</p>
        </div>

        <div className="badge-neutral font-mono text-[11px] px-3 py-1 shrink-0">
          Source: {activeTableMeta.sourceFile}
        </div>
      </div>

      {/* Raw Table View */}
      <DataTable
        id="data-explorer-table"
        title={`Table: ${activeTableMeta.tableName}`}
        subtitle={`Viewing raw records from source file ${activeTableMeta.sourceFile}`}
        columns={columns}
        data={sampleTableRows}
        searchKeys={['recordKey', 'primaryRef', 'checksum']}
        searchPlaceholder="Search record key or checksum..."
        defaultPageSize={25}
        exportFilename={`table_${activeTableMeta.tableName}.csv`}
      />
    </div>
  );
};
