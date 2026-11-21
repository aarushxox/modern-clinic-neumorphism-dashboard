import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="w-full animate-pulse neu-card rounded-[24px] overflow-hidden">
      <div className="h-12 bg-[var(--surface-muted)] border-b border-[var(--border-subtle)] flex items-center px-5 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3.5 bg-[var(--border)] rounded-full flex-1" />
        ))}
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 flex items-center px-5 gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3 bg-[var(--surface-muted)] rounded-full"
                style={{ width: `${Math.max(40, 100 - c * 15)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse neu-card p-5 rounded-[24px] flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-[var(--surface-muted)] rounded-full" />
        <div className="h-9 w-9 bg-[var(--surface-muted)] rounded-full" />
      </div>
      <div className="h-8 w-36 bg-[var(--border)] rounded-full" />
      <div className="h-3 w-48 bg-[var(--surface-muted)] rounded-full" />
    </div>
  );
};

export const PatientProfileSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="neu-card p-6 rounded-[24px] flex gap-6 items-center">
        <div className="w-16 h-16 rounded-full bg-[var(--surface-muted)]" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-52 bg-[var(--border)] rounded-full" />
          <div className="h-4 w-72 bg-[var(--surface-muted)] rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 bg-[var(--surface-muted)] rounded-[20px]" />
        <div className="h-20 bg-[var(--surface-muted)] rounded-[20px]" />
        <div className="h-20 bg-[var(--surface-muted)] rounded-[20px]" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-32 bg-[var(--border)] rounded-full" />
        <div className="h-32 bg-[var(--surface-muted)] rounded-[20px]" />
        <div className="h-32 bg-[var(--surface-muted)] rounded-[20px]" />
      </div>
    </div>
  );
};
