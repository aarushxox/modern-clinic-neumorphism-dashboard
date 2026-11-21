import React, { useMemo, useState } from 'react';
import { ReceiptText, ArrowDownRight, ArrowUpRight, Info, Filter } from 'lucide-react';
import { ClinicDataProvider } from '../services/dataProvider';
import { CashbookRecord } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';

export const CashbookView: React.FC = () => {
  const cashbookEntries = useMemo(() => ClinicDataProvider.getCashbook(), []);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEntries = useMemo(() => {
    if (filterType === 'ALL') return cashbookEntries;
    return cashbookEntries.filter((e) => e.type === filterType);
  }, [cashbookEntries, filterType]);

  const columns: Column<CashbookRecord>[] = [
    {
      key: 'refNo',
      header: 'Voucher / Ref #',
      width: 'w-32',
      render: (c) => (
        <span className="badge-neutral inline-flex items-center font-mono font-bold text-xs px-2.5 py-0.5">
          {c.refNo}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: 'w-28',
      render: (c) => (
        <span className="text-xs font-mono font-semibold text-[var(--text-secondary)]">
          {c.date}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Ledger Head / Category',
      width: 'w-48',
      render: (c) => (
        <span className="badge-neutral inline-flex items-center px-2.5 py-0.5 text-xs font-semibold">
          {c.category}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Particulars & Description',
      render: (c) => (
        <span className="text-xs text-[var(--text-secondary)]">{c.description}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: 'w-28',
      render: (c) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold w-fit ${
            c.type === 'RECEIPT' ? 'badge-sage' : 'badge-rose'
          }`}
        >
          {c.type === 'RECEIPT' ? (
            <ArrowDownRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5" />
          )}
          <span>{c.type}</span>
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (₹)',
      width: 'w-32',
      render: (c) => (
        <span
          className={`inline-flex items-center font-mono font-bold text-xs px-2.5 py-0.5 tabular-nums ${
            c.type === 'RECEIPT' ? 'badge-sage' : 'badge-rose'
          }`}
        >
          {c.type === 'RECEIPT' ? '+' : '-'}₹{c.amount.toLocaleString()}
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
            <span className="badge-sage px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <ReceiptText className="w-3.5 h-3.5" />
              <span>Cashbook Financial Journal</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Table: cashbook.csv (CORE)
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Clinic Cashbook &amp; Day Journal (6,693 Historical Entries)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Consultation fee receipts, certificate charges, procedure collections, and clinic operational vouchers.
          </p>
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-xs font-medium text-[var(--text-muted)] inline-flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 px-3.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
          >
            <option value="ALL">All Transactions</option>
            <option value="RECEIPT">Receipts Only</option>
            <option value="PAYMENT">Expenses / Payments Only</option>
          </select>
        </div>
      </div>

      {/* Forensic Audit Note */}
      <div
        className="p-4 rounded-[20px] border text-xs flex items-start gap-3"
        style={{
          background: 'var(--pastel-blue-bg)',
          color: 'var(--pastel-blue-fg)',
          borderColor: 'var(--pastel-blue-border)',
        }}
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Forensic Accounting Note:</strong> All figures shown are direct historical ledger extracts from the Access MDB cashbook table without arbitrary tax adjustments or speculative normalization.
        </div>
      </div>

      {/* Cashbook Data Table */}
      <DataTable
        id="cashbook-data-table"
        title="Journal Ledger Entries"
        subtitle="6,693 Historical Cashbook Records"
        columns={columns}
        data={filteredEntries}
        searchKeys={['refNo', 'description', 'category', 'date']}
        searchPlaceholder="Search voucher, description, or category..."
        defaultPageSize={25}
        exportFilename="clinic_cashbook_journal.csv"
      />
    </div>
  );
};
