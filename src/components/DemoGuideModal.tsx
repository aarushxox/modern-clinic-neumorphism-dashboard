import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Stethoscope,
  Search,
  FileText,
  Database,
  Layers,
  ShieldCheck,
  Printer,
  Command,
  Pill,
} from 'lucide-react';
import { ActiveModule } from '../types/clinic';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: ActiveModule) => void;
}

interface Step {
  title: string;
  module: ActiveModule;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconFg: string;
  doctorGoal: string;
  forensicProof: string;
  actionLabel: string;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: '1. Executive Clinic Dashboard',
      module: 'dashboard',
      icon: Stethoscope,
      iconBg: 'var(--pastel-blue-bg)',
      iconFg: 'var(--pastel-blue-fg)',
      doctorGoal:
        'Verify overall clinic volume, patient counts, and historical longevity (1999–2026).',
      forensicProof:
        'Shows exactly 43,488 indexed patient profiles, 158,361 total encounter visits, 73 drugs, and 2,709 certificates.',
      actionLabel: 'Open Dashboard',
    },
    {
      title: "2. Today's Clinic Day View",
      module: 'today',
      icon: Sparkles,
      iconBg: 'var(--pastel-sage-bg)',
      iconFg: 'var(--pastel-sage-fg)',
      doctorGoal:
        'Experience a realistic day at the clinic with patient queues, vitals, and instant prescription cards.',
      forensicProof:
        'Defaults honestly to most recent recorded clinic day (12 Aug 2026) with jump-to-date selector rather than fake empty screens.',
      actionLabel: "Go to Today's Clinic",
    },
    {
      title: '3. Instant Patient Search',
      module: 'search',
      icon: Search,
      iconBg: 'var(--pastel-lilac-bg)',
      iconFg: 'var(--pastel-lilac-fg)',
      doctorGoal:
        'Search any historical patient in milliseconds by Registration No, Name, Phone, Guardian, or Address.',
      forensicProof:
        'Case-insensitive, deterministic, offline query engine. Empty query displays Recently Active Patients pool.',
      actionLabel: 'Try Patient Search',
    },
    {
      title: '4. Deep Longitudinal Patient Profile',
      module: 'search',
      icon: FileText,
      iconBg: 'var(--pastel-sand-bg)',
      iconFg: 'var(--pastel-sand-fg)',
      doctorGoal:
        'Inspect chronological encounters, diagnosis trends, and prominent allergy warnings.',
      forensicProof:
        'High-visibility Known Allergy warnings, exact vitals, investigations, and previous-encounter comparison indicators.',
      actionLabel: 'Inspect Patient Records',
    },
    {
      title: '5. Decoded Hindi & RTF Prescription Text',
      module: 'search',
      icon: Layers,
      iconBg: 'var(--pastel-lilac-bg)',
      iconFg: 'var(--pastel-lilac-fg)',
      doctorGoal:
        'Verify legacy binary RTF format and Kruti-Dev 010 Hindi dosage instructions are cleanly rendered.',
      forensicProof:
        'Decodes legacy script into readable Devanagari Hindi and structured medicine dosages.',
      actionLabel: 'View Treatment Records',
    },
    {
      title: '6. Master Medicines Catalog',
      module: 'medicines',
      icon: Pill,
      iconBg: 'var(--pastel-sage-bg)',
      iconFg: 'var(--pastel-sage-fg)',
      doctorGoal:
        'Verify drug database with 73 trade names, salts, companies (Cipla, Sun Pharma, Abbott), MRs, and costs.',
      forensicProof:
        'Direct lookup against master legacy table Drugs with search and categorizations.',
      actionLabel: 'Browse Drug Master',
    },
    {
      title: '7. Clinical Keyboard Shortcuts',
      module: 'shortcuts',
      icon: Command,
      iconBg: 'var(--pastel-blue-bg)',
      iconFg: 'var(--pastel-blue-fg)',
      doctorGoal:
        'Inspect 357 legacy prescription keyboard macros (e.g. URI1, AP1, HTN1) that saved hours of typing.',
      forensicProof:
        'Proof that doctor shorthand workflows can be preserved 1:1 in the modern software.',
      actionLabel: 'Explore Shortcuts',
    },
    {
      title: '8. Forensic Data Health & Serial Analysis',
      module: 'data-health',
      icon: ShieldCheck,
      iconBg: 'var(--pastel-rose-bg)',
      iconFg: 'var(--pastel-rose-fg)',
      doctorGoal:
        'Understand why highest serial is 52,533 while current patient profiles are 43,488.',
      forensicProof:
        'Transparent forensic explanation of historical serial gaps, database partitions, and lineage timeline.',
      actionLabel: 'View Data Health',
    },
    {
      title: '9. Technical Table Data Explorer',
      module: 'data-explorer',
      icon: Database,
      iconBg: 'var(--pastel-blue-bg)',
      iconFg: 'var(--pastel-blue-fg)',
      doctorGoal:
        'Inspect raw evidence tables categorized into CORE, LOOKUP, DUMP/BACKUP, and ERROR remnants.',
      forensicProof:
        'Full audit verification across all 22 database tables without modifying a single byte.',
      actionLabel: 'Open Data Explorer',
    },
    {
      title: '10. Modernization Roadmap & Print Preview',
      module: 'about',
      icon: Printer,
      iconBg: 'var(--pastel-butter-bg)',
      iconFg: 'var(--pastel-butter-fg)',
      doctorGoal:
        'Review the proposed high-speed SQLite production architecture and print clinical reports.',
      forensicProof:
        'Clear separation between this Read-Only Forensic Demo and the future multi-station production system.',
      actionLabel: 'View Proposal & Print',
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleGoToModule = () => {
    onNavigate(step.module);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
          <span
            className="w-8 h-8 rounded-full grid place-items-center shrink-0"
            style={{
              background: 'var(--pastel-sand-bg)',
              color: 'var(--pastel-sand-fg)',
            }}
          >
            <Sparkles className="w-4 h-4" />
          </span>
          <span>Doctor Demonstration Walkthrough Guide</span>
        </div>
      }
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs font-medium text-[var(--text-muted)]">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="demo-prev-btn"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="neu-pill-btn px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] rounded-full disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              id="demo-action-btn"
              onClick={handleGoToModule}
              className="btn-editorial-primary px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer"
            >
              <span>{step.actionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            {currentStep < steps.length - 1 && (
              <button
                id="demo-next-btn"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="neu-pill-btn px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] rounded-full flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-between gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              style={{
                background:
                  idx === currentStep
                    ? 'var(--accent-primary)'
                    : idx < currentStep
                    ? 'var(--accent-soft)'
                    : 'var(--border)',
              }}
              className="h-2 flex-1 rounded-full transition-all cursor-pointer"
              title={s.title}
            />
          ))}
        </div>

        {/* Current Step Card */}
        <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-[22px] p-5 space-y-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-full grid place-items-center shrink-0"
              style={{ background: step.iconBg, color: step.iconFg }}
            >
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">{step.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Target Module: {step.module.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Demonstration Goal for the Doctor
              </h4>
              <p className="text-sm text-[var(--text-primary)] bg-[var(--surface-elevated)] p-3.5 rounded-[16px] border border-[var(--border)]">
                {step.doctorGoal}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Forensic Truth &amp; Proof
              </h4>
              <div
                className="flex items-start gap-2.5 text-sm p-3.5 rounded-[16px] border"
                style={{
                  background: 'var(--pastel-sage-bg)',
                  color: 'var(--pastel-sage-fg)',
                  borderColor: 'var(--pastel-sage-border)',
                }}
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{step.forensicProof}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Presentation Tip */}
        <div
          className="text-xs rounded-[16px] p-3.5 border"
          style={{
            background: 'var(--pastel-sand-bg)',
            color: 'var(--pastel-sand-fg)',
            borderColor: 'var(--pastel-sand-border)',
          }}
        >
          <span className="font-bold">Demonstration Pro-Tip:</span> Allow the doctor to pick any
          patient name from memory or a known medical prescription from their clinic to live-test
          the search responsiveness.
        </div>
      </div>
    </Modal>
  );
};
