import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Sparkles,
  X,
  RotateCcw,
} from 'lucide-react';
import { ClinicDataProvider, PatientSearchFilter } from '../services/dataProvider';
import { PatientRecord } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';
import { computeCurrentAge } from '../utils/clinicalCalculations';

interface PatientSearchViewProps {
  onSelectPatient: (patient: PatientRecord) => void;
  initialQuery?: string;
}

export const PatientSearchView: React.FC<PatientSearchViewProps> = ({
  onSelectPatient,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<PatientSearchFilter['sortBy']>('serial-desc');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [ageCohortFilter, setAgeCohortFilter] = useState<string>('ALL');

  const searchResults = useMemo(() => {
    const res = ClinicDataProvider.searchPatients(
      {
        query,
        sortBy,
        gender: genderFilter !== 'ALL' ? genderFilter : undefined,
      },
      1,
      120
    );

    let items = res.items;

    if (ageCohortFilter !== 'ALL') {
      items = items.filter((p) => {
        const computed = computeCurrentAge(p);
        const age = computed.currentAge;
        if (ageCohortFilter === '0-10') return age <= 10;
        if (ageCohortFilter === '11-20') return age > 10 && age <= 20;
        if (ageCohortFilter === '21-40') return age > 20 && age <= 40;
        if (ageCohortFilter === '41-60') return age > 40 && age <= 60;
        if (ageCohortFilter === '60+') return age > 60;
        return true;
      });
    }

    return items;
  }, [query, sortBy, genderFilter, ageCohortFilter]);

  const isSearchEmpty = !query.trim();
  const recent5Patients = useMemo(() => searchResults.slice(0, 5), [searchResults]);

  const hasActiveFilters =
    query.trim() !== '' ||
    genderFilter !== 'ALL' ||
    ageCohortFilter !== 'ALL' ||
    sortBy !== 'serial-desc';

  const handleClearAllFilters = () => {
    setQuery('');
    setGenderFilter('ALL');
    setAgeCohortFilter('ALL');
    setSortBy('serial-desc');
  };

  const columns: Column<PatientRecord>[] = [
    {
      key: 'sno',
      header: 'Reg. No.',
      width: 'w-24',
      render: (p) => (
        <span className="badge-neutral inline-flex items-center font-bold px-2.5 py-0.5 font-mono text-xs">
          #{p.sno}
        </span>
      ),
    },
    {
      key: 'firstName',
      header: 'Patient Full Name & Guardian',
      render: (p) => (
        <div>
          <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5 text-xs">
            <span>
              {p.firstName} {p.lastName}
            </span>
            {p.allergy && (
              <span className="badge-rose px-2 py-0.5 text-[9.5px] font-bold">
                ALLERGY
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">{p.guardianName}</div>
        </div>
      ),
    },
    {
      key: 'ageYears',
      header: 'Age & Sex',
      width: 'w-36',
      render: (p) => {
        const computed = computeCurrentAge(p);
        return (
          <div className="text-xs">
            <span className="font-bold text-[var(--text-primary)]">
              {computed.currentAge} yrs
            </span>
            <span className="text-[var(--text-muted)]"> ({p.sex})</span>
            {computed.isEstimated && (
              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                Reg: {p.ageYears}y
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Contact & Residential Area',
      render: (p) => (
        <div className="text-xs space-y-0.5 max-w-xs truncate">
          <div className="font-mono text-[var(--text-primary)] font-medium">{p.phone}</div>
          <div className="truncate text-[var(--text-muted)] text-[11px]">{p.address}</div>
        </div>
      ),
    },
    {
      key: 'totalVisits',
      header: 'Encounter History',
      width: 'w-36',
      render: (p) => (
        <div className="text-xs">
          <div className="font-bold text-[var(--text-primary)]">
            {p.totalVisits} Encounters
          </div>
          <div className="text-[var(--text-muted)] text-[10px]">
            Last: {p.lastVisitDate}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      width: 'w-28',
      render: (p) => (
        <button
          id={`search-view-profile-${p.sno}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPatient(p);
          }}
          className="neu-pill-btn px-3.5 py-1.5 text-[var(--accent-text)] font-bold text-xs rounded-full cursor-pointer"
        >
          View Profile
        </button>
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
              <Users className="w-3.5 h-3.5" />
              <span>Patients Directory</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              43,488 Total Master Profiles
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Patient Search &amp; Longitudinal Ledger
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Instant multi-field search across Registration Number, Patient Name, Relative Name, Contact Phone, and Address.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearAllFilters}
            className="badge-rose px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 self-start md:self-auto cursor-pointer hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="neu-card rounded-[24px] p-5 space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="patient-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Patient Name (e.g. Rahul), Reg # (e.g. 52533), Relative (e.g. Sharma), Phone, or Town..."
            className="neu-inset w-full pl-11 pr-10 py-3 text-sm rounded-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Sex Filter
            </label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="ALL">All Sexes (Male &amp; Female)</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Current Calculated Age
            </label>
            <select
              value={ageCohortFilter}
              onChange={(e) => setAgeCohortFilter(e.target.value)}
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="ALL">All Age Ranges</option>
              <option value="0-10">Pediatric (0–10 yrs)</option>
              <option value="11-20">Adolescent (11–20 yrs)</option>
              <option value="21-40">Young Adult (21–40 yrs)</option>
              <option value="41-60">Middle Aged (41–60 yrs)</option>
              <option value="60+">Senior / Geriatric (60+ yrs)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-9 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
            >
              <option value="serial-desc">Registration # (Newest to Oldest)</option>
              <option value="serial-asc">Registration # (Oldest to Newest)</option>
              <option value="name-asc">Patient Name (A to Z)</option>
              <option value="name-desc">Patient Name (Z to A)</option>
              <option value="visits-desc">Most Frequent Visits</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-subtle)] text-xs">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              Active filters:
            </span>
            {query.trim() && (
              <span className="badge-lilac inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Query: &ldquo;{query}&rdquo;
                <button onClick={() => setQuery('')} className="hover:opacity-75 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {genderFilter !== 'ALL' && (
              <span className="badge-blue inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Sex: {genderFilter}
                <button
                  onClick={() => setGenderFilter('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {ageCohortFilter !== 'ALL' && (
              <span className="badge-sand inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Age: {ageCohortFilter} yrs
                <button
                  onClick={() => setAgeCohortFilter('ALL')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== 'serial-desc' && (
              <span className="badge-neutral inline-flex items-center gap-1.5 px-3 py-0.5 font-semibold text-[11px]">
                Sort: {sortBy}
                <button
                  onClick={() => setSortBy('serial-desc')}
                  className="hover:opacity-75 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5 Most Recently Active Patients */}
      {isSearchEmpty && (
        <div className="neu-card rounded-[24px] p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Recently Active Patients (Latest August 2026 Encounters)
              </h3>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              5 Active Profiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {recent5Patients.map((p) => {
              const computed = computeCurrentAge(p);
              return (
                <div
                  key={p.sno}
                  onClick={() => onSelectPatient(p)}
                  className="p-3.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="badge-neutral font-bold text-[10px] px-2 py-0.5 font-mono">
                      #{p.sno}
                    </span>
                    <span className="badge-sage text-[10px] font-bold px-2 py-0.5">
                      {p.totalVisits} visits
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)] truncate">
                    {computed.currentAge} yrs · {p.sex}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Patients Data Table */}
      <DataTable
        id="patients-search-table"
        data={searchResults}
        columns={columns}
        defaultPageSize={20}
        exportFilename="patients_ledger_export"
        onRowClick={(p) => onSelectPatient(p)}
      />
    </div>
  );
};
