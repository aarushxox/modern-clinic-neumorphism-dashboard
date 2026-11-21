import React, { useMemo, useState } from 'react';
import { FileCheck2, Filter } from 'lucide-react';
import { ClinicDataProvider } from '../services/dataProvider';
import { CertificateRecord } from '../types/clinic';
import { DataTable, Column } from '../components/DataTable';

export const CertificatesView: React.FC = () => {
  const certificates = useMemo(() => ClinicDataProvider.getCertificates(), []);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredCerts = useMemo(() => {
    if (selectedType === 'ALL') return certificates;
    return certificates.filter((c) => c.certType === selectedType);
  }, [certificates, selectedType]);

  const columns: Column<CertificateRecord>[] = [
    {
      key: 'certNo',
      header: 'Certificate #',
      width: 'w-32',
      render: (c) => (
        <span className="badge-neutral inline-flex items-center font-mono font-bold px-2.5 py-0.5 text-xs">
          CERT-{String(c.certNo).padStart(5, '0')}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient Name & Reg',
      render: (c) => (
        <div>
          <div className="font-bold text-[var(--text-primary)] text-sm">{c.patientName}</div>
          {c.sno && (
            <div className="text-xs text-[var(--text-muted)] font-mono">Reg #{c.sno}</div>
          )}
        </div>
      ),
    },
    {
      key: 'certType',
      header: 'Certificate Type',
      render: (c) => (
        <span className="badge-blue inline-flex items-center px-2.5 py-0.5 text-xs font-semibold">
          {c.certType}
        </span>
      ),
    },
    {
      key: 'disease',
      header: 'Certified Disease / Reason',
      render: (c) => (
        <span className="text-[var(--text-secondary)] font-medium text-xs">{c.disease}</span>
      ),
    },
    {
      key: 'startDate',
      header: 'Validity Period',
      render: (c) => (
        <div className="text-xs text-[var(--text-primary)]">
          <div className="font-mono">
            {c.startDate} – {c.endDate}
          </div>
          <div className="text-[var(--text-muted)] font-medium mt-0.5">
            {c.days} Days Recommended
          </div>
        </div>
      ),
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      width: 'w-28',
      render: (c) => (
        <span className="text-xs text-[var(--text-secondary)] font-mono font-medium">
          {c.issueDate}
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
            <span className="badge-blue px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Issued Certificates Register</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Table: certificate.csv (CORE)
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Medical Fitness &amp; Sick Leave Certificates ({certificates.length} Records)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Historical medical fitness, sickness, duty resumption, and light work certificates issued by the clinic.
          </p>
        </div>

        {/* Certificate Type Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-xs font-medium text-[var(--text-muted)] inline-flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
          >
            <option value="ALL">All Certificate Types</option>
            <option value="Medical Fitness">Medical Fitness</option>
            <option value="Sickness / Rest">Sickness / Rest</option>
            <option value="Fitness to Resume Duty">Fitness to Resume Duty</option>
            <option value="Light Duty">Light Duty</option>
            <option value="Immunization">Immunization</option>
          </select>
        </div>
      </div>

      {/* Certificates Data Table */}
      <DataTable
        id="certificates-data-table"
        title="Certificates Register"
        subtitle="2,709 Historical Medical Certificates Issued"
        columns={columns}
        data={filteredCerts}
        searchKeys={['patientName', 'disease', 'certType', 'certNo']}
        searchPlaceholder="Search patient name, certificate number, or disease..."
        defaultPageSize={25}
        exportFilename="medical_certificates_register.csv"
      />
    </div>
  );
};
