import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Search, AlertCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { Modal } from './Modal';
import { TableSkeleton } from './Skeleton';
import { useToast } from './Toast';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  id?: string;
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  title?: string;
  subtitle?: string;
  defaultPageSize?: number;
  loading?: boolean;
  exportFilename?: string;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  id = 'data-table',
  columns,
  data,
  searchKeys = [],
  searchPlaceholder = 'Search records...',
  title,
  subtitle,
  defaultPageSize = 25,
  loading = false,
  exportFilename = 'clinic_data_export.csv',
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportMode, setExportMode] = useState<'filtered' | 'full'>('filtered');

  // Filter records
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, searchKeys]);

  // Sort records
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [filteredData, sortKey, sortDirection]);

  // Pagination calculations
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedItems = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPageInput('');
    }
  };

  // Safe client-side CSV export logic (PRD Section 32 & 100)
  const handleExecuteExport = () => {
    const targetData = exportMode === 'filtered' ? sortedData : data;
    if (targetData.length === 0) {
      setShowExportModal(false);
      return;
    }

    const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
    const rows = targetData.map((item) =>
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
    link.setAttribute('download', exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    showToast(
      `Successfully exported ${targetData.length.toLocaleString()} records to ${exportFilename}`,
      'success',
      'Data Export Complete'
    );
  };

  if (loading) {
    return <TableSkeleton rows={8} columns={columns.length} />;
  }

  return (
    <div id={id} className="neu-card rounded-[26px] overflow-hidden flex flex-col">
      {/* Table Toolbar Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--surface)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {title && <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {searchKeys.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id={`${id}-search-input`}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="neu-inset pl-10 pr-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-full focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 w-56 sm:w-64"
              />
            </div>
          )}

          {actions}

          <Tooltip content="Safely download data table view to local CSV">
            <button
              id={`${id}-export-btn`}
              onClick={() => setShowExportModal(true)}
              className="neu-pill-btn px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] rounded-full flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[var(--success)]" />
              <span>Export CSV</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm text-[var(--text-secondary)] border-collapse">
          <thead className="bg-[var(--surface-muted)]/80 text-[11px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)] sticky top-0 z-10 backdrop-blur-xs">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3.5 ${col.width ? col.width : ''} ${
                    col.sortable !== false ? 'cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors' : ''
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-[var(--text-muted)]">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                          )
                        ) : (
                          <div className="flex flex-col opacity-40 hover:opacity-100">
                            <ChevronUp className="w-2.5 h-2.5 -mb-1" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 opacity-40" />
                    <p className="font-semibold text-[var(--text-secondary)]">No records found</p>
                    <p className="text-xs text-[var(--text-muted)]">Try adjusting your search terms or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-emerald-500/[0.06] transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${rowIdx % 2 === 0 ? 'bg-[var(--surface-elevated)]' : 'bg-[var(--surface)]/55'}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 align-middle text-[var(--text-primary)]">
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 sm:px-5 border-t border-[var(--border-subtle)] bg-[var(--surface)]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            id={`${id}-pagesize-select`}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="neu-inset rounded-full px-3 py-1 font-semibold text-[var(--text-primary)] focus:outline-hidden"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1,000</option>
          </select>

          <span className="ml-2 font-medium tabular-nums text-[var(--text-primary)]">
            Showing {totalItems === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + pageSize, totalItems)} of {totalItems.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleJumpPage} className="flex items-center gap-1.5 mr-2">
            <span>Jump to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={String(validCurrentPage)}
              className="neu-inset w-14 px-2 py-1 text-center rounded-full text-xs text-[var(--text-primary)] focus:outline-hidden"
            />
            <button
              type="submit"
              className="neu-pill-btn px-2.5 py-1 rounded-full text-[var(--text-primary)] font-semibold cursor-pointer"
            >
              Go
            </button>
          </form>

          <div className="flex items-center gap-1.5">
            <button
              id={`${id}-prev-page-btn`}
              onClick={() => setCurrentPage(Math.max(1, validCurrentPage - 1))}
              disabled={validCurrentPage <= 1}
              className="neu-pill-btn p-1.5 rounded-full text-[var(--text-primary)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold tabular-nums text-[var(--text-primary)]">
              Page {validCurrentPage} of {totalPages}
            </span>
            <button
              id={`${id}-next-page-btn`}
              onClick={() => setCurrentPage(Math.min(totalPages, validCurrentPage + 1))}
              disabled={validCurrentPage >= totalPages}
              className="neu-pill-btn p-1.5 rounded-full text-[var(--text-primary)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Safe CSV Export Confirmation Modal (PRD Section 32 & 100) */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Confirm Local Data Export"
        maxWidth="md"
        footer={
          <>
            <button
              id="export-cancel-btn"
              onClick={() => setShowExportModal(false)}
              className="neu-pill-btn px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="export-confirm-btn"
              onClick={handleExecuteExport}
              className="btn-editorial-primary px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Please choose the export scope for <strong className="text-[var(--text-primary)]">{exportFilename}</strong>:
          </p>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[16px] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
              <input
                type="radio"
                name="exportMode"
                value="filtered"
                checked={exportMode === 'filtered'}
                onChange={() => setExportMode('filtered')}
                className="mt-0.5 accent-[var(--accent-primary)]"
              />
              <div>
                <span className="font-semibold text-[var(--text-primary)] text-sm">
                  Export Currently Filtered View ({sortedData.length.toLocaleString()} rows)
                </span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Exports only the records matching current search and sorting parameters.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[16px] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
              <input
                type="radio"
                name="exportMode"
                value="full"
                checked={exportMode === 'full'}
                onChange={() => setExportMode('full')}
                className="mt-0.5 accent-[var(--accent-primary)]"
              />
              <div>
                <span className="font-semibold text-[var(--text-primary)] text-sm">
                  Export Full Table ({data.length.toLocaleString()} rows)
                </span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Exports the complete unabridged dataset for this table.
                </p>
              </div>
            </label>
          </div>

          <div
            className="p-3.5 rounded-[16px] text-xs border"
            style={{
              background: 'var(--pastel-sand-bg)',
              color: 'var(--pastel-sand-fg)',
              borderColor: 'var(--pastel-sand-border)',
            }}
          >
            <strong>Data Safety Note:</strong> The file is generated locally in your browser memory. No data is transmitted over the internet.
          </div>
        </div>
      </Modal>
    </div>
  );
}
