import React from 'react';
import { ActiveModule } from '../types/clinic';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 6,
  columns = 6,
}) => {
  return (
    <div className="w-full neu-card rounded-[24px] overflow-hidden">
      <div className="h-14 bg-[var(--surface-muted)]/60 border-b border-[var(--border-subtle)] flex items-center justify-between px-5 gap-4">
        <div className="space-y-2">
          <div className="h-4 w-44 skeleton-block-strong rounded-full" />
          <div className="h-2.5 w-64 skeleton-block rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-48 skeleton-block rounded-full hidden sm:block" />
          <div className="h-9 w-28 skeleton-block-strong rounded-full" />
        </div>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 flex items-center px-5 gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3 skeleton-block rounded-full"
                style={{ width: `${Math.max(36, 94 - c * 12)}%` }}
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
    <div className="neu-card p-5 rounded-[24px] flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="h-9 w-9 skeleton-block rounded-full" />
        <div className="h-7 w-7 skeleton-block rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 skeleton-block rounded-full" />
        <div className="h-7 w-32 skeleton-block-strong rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="h-2.5 w-24 skeleton-block rounded-full" />
        <div className="h-1.5 w-12 skeleton-block rounded-full" />
      </div>
    </div>
  );
};

export const PatientProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="neu-card p-6 rounded-[24px] flex gap-6 items-center">
        <div className="w-16 h-16 rounded-full skeleton-block-strong shrink-0" />
        <div className="space-y-2.5 flex-1">
          <div className="h-6 w-52 skeleton-block-strong rounded-full" />
          <div className="h-3.5 w-72 skeleton-block rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 skeleton-block rounded-[20px]" />
        <div className="h-20 skeleton-block rounded-[20px]" />
        <div className="h-20 skeleton-block rounded-[20px]" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-36 skeleton-block-strong rounded-full" />
        <div className="h-32 skeleton-block rounded-[20px]" />
        <div className="h-32 skeleton-block rounded-[20px]" />
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC<{ module: ActiveModule }> = ({ module }) => {
  if (module === 'dashboard') {
    return (
      <div className="space-y-4 pb-6" aria-busy="true" aria-label="Loading dashboard">
        {/* Heading skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-1">
          <div className="space-y-2">
            <div className="h-3 w-40 skeleton-block rounded-full" />
            <div className="h-8 w-64 skeleton-block-strong rounded-full" />
            <div className="h-3 w-80 max-w-full skeleton-block rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 skeleton-block rounded-full" />
            <div className="h-9 w-40 skeleton-block-strong rounded-full" />
          </div>
        </div>

        {/* 6 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Welcome + Continuity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 neu-card rounded-[24px] p-6 flex items-center justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-5 w-44 skeleton-block rounded-full" />
              <div className="h-7 w-72 max-w-full skeleton-block-strong rounded-full" />
              <div className="h-3.5 w-96 max-w-full skeleton-block rounded-full" />
            </div>
            <div className="w-[106px] h-[106px] rounded-full skeleton-block shrink-0 hidden sm:block" />
          </div>
          <div className="lg:col-span-4 neu-card rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 skeleton-block-strong rounded-full" />
                <div className="h-3 w-40 skeleton-block rounded-full" />
              </div>
              <div className="w-9 h-9 rounded-full skeleton-block" />
            </div>
            <div className="h-9 w-28 skeleton-block-strong rounded-full" />
            <div className="h-2.5 w-full skeleton-block rounded-full" />
          </div>
        </div>

        {/* Chart + Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 neu-card rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-2">
                <div className="h-5 w-48 skeleton-block-strong rounded-full" />
                <div className="h-3 w-64 skeleton-block rounded-full" />
              </div>
              <div className="h-8 w-44 skeleton-block rounded-full" />
            </div>
            <div className="h-[220px] w-full skeleton-block rounded-[20px]" />
          </div>
          <div className="lg:col-span-4 neu-card rounded-[24px] p-6 space-y-3">
            <div className="h-5 w-40 skeleton-block-strong rounded-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full skeleton-block rounded-[16px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (module === 'reports') {
    return (
      <div className="space-y-6 pb-6" aria-busy="true" aria-label="Loading clinical analytics">
        <div className="neu-card rounded-[24px] p-6 space-y-3">
          <div className="h-5 w-48 skeleton-block rounded-full" />
          <div className="h-7 w-96 max-w-full skeleton-block-strong rounded-full" />
          <div className="h-3.5 w-80 max-w-full skeleton-block rounded-full" />
        </div>
        <div className="neu-card rounded-[24px] p-5 space-y-4">
          <div className="h-4 w-56 skeleton-block rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 skeleton-block rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-40 skeleton-block rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="neu-card rounded-[24px] p-6 h-72 space-y-4">
            <div className="h-5 w-52 skeleton-block-strong rounded-full" />
            <div className="h-48 w-full skeleton-block rounded-[18px]" />
          </div>
          <div className="neu-card rounded-[24px] p-6 h-72 space-y-4">
            <div className="h-5 w-52 skeleton-block-strong rounded-full" />
            <div className="h-48 w-full skeleton-block rounded-[18px]" />
          </div>
        </div>
      </div>
    );
  }

  if (module === 'calendar' || module === 'settings' || module === 'about' || module === 'data-health') {
    return (
      <div className="space-y-6 pb-6" aria-busy="true" aria-label="Loading view">
        <div className="neu-card rounded-[24px] p-6 space-y-3">
          <div className="h-5 w-40 skeleton-block rounded-full" />
          <div className="h-7 w-72 max-w-full skeleton-block-strong rounded-full" />
          <div className="h-3.5 w-96 max-w-full skeleton-block rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 neu-card rounded-[24px] p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full skeleton-block rounded-[16px]" />
            ))}
          </div>
          <div className="lg:col-span-8 neu-card rounded-[24px] p-6 space-y-4">
            <div className="h-6 w-56 skeleton-block-strong rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 skeleton-block rounded-[20px]" />
              ))}
            </div>
            <div className="h-36 skeleton-block rounded-[20px]" />
          </div>
        </div>
      </div>
    );
  }

  // Default: table-centric views (today, search, medicines, shortcuts, certificates, cashbook, data-explorer)
  return (
    <div className="space-y-5 pb-6" aria-busy="true" aria-label="Loading records">
      <div className="neu-card rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          <div className="h-5 w-44 skeleton-block rounded-full" />
          <div className="h-7 w-80 max-w-full skeleton-block-strong rounded-full" />
          <div className="h-3.5 w-96 max-w-full skeleton-block rounded-full" />
        </div>
        <div className="h-11 w-44 skeleton-block rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
};
