import React from 'react';
import { ArrowUpRight, ShieldAlert, Sparkles } from 'lucide-react';

interface ReferenceLink {
  label: string;
  href: string;
}

const REFERENCE_LINKS: ReferenceLink[] = [
  { label: 'Hexatom', href: 'https://hexatom-org.vercel.app/' },
  { label: 'Hexatom Portfolio', href: 'https://hexatom.imaginefuture1-7.workers.dev/' },
  { label: 'Aronar AI', href: 'http://aronar-ai.vercel.app/' },
  { label: 'Pranav Sahu Portfolio', href: 'https://pranav005-portfolio.netlify.app/' },
  { label: 'Hexatom Fonts', href: 'https://the-fonts-hexatom.pranavsahu005.workers.dev/' },
  { label: 'Hexatom Colors', href: 'https://hexatom-the-colors.base44.app/' },
  { label: 'CREVR Media Flow', href: 'https://crevr-media-flow.base44.app/' },
  { label: 'CREVR Studio App', href: 'https://crevr-807931817037.asia-southeast1.run.app/' },
  { label: 'CREVR Tree', href: 'https://crevr-tree.vercel.app/' },
];

export const Footer: React.FC = () => {
  return (
    <footer
      id="app-global-footer"
      className="no-print mt-7 neu-card rounded-[20px] px-4 py-4 sm:px-5 sm:py-4 space-y-3"
    >
      {/* Top Row: Compact Credits + Copyright / Human+AI Notice */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
            Pranav Raj Sahu
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">·</span>
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">
            Hexatom Team / Aronar AI
          </span>
          <span className="badge-lilac px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Human + AI Crafted</span>
          </span>
        </div>

        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] font-medium"
          style={{
            background: 'var(--pastel-rose-bg)',
            borderColor: 'var(--pastel-rose-border)',
            color: 'var(--pastel-rose-fg)',
          }}
        >
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span>
            Built with Google AI Studio, Gemini &amp; API tools · Copyright protected, attribution &amp; permission required
          </span>
        </div>
      </div>

      {/* Middle Row: Compact Pill Chips for All 9 Professional References */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-1">
          References:
        </span>
        {REFERENCE_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--surface-muted)]/80 hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border)] transition-all"
          >
            <span>{link.label}</span>
            <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
          </a>
        ))}
      </div>

      {/* Bottom Legal & Preview Data Strip */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10.5px] text-[var(--text-muted)]">
        <span>
          &copy; {new Date().getFullYear()} Pranav Raj Sahu · Hexatom Team / Aronar AI. All Rights Reserved.
        </span>
        <span>
          Public UI Preview · Synthetic dummy data only (private clinical records excluded)
        </span>
      </div>
    </footer>
  );
};
