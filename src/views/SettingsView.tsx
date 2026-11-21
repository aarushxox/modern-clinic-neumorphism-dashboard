import React, { useState, useRef } from 'react';
import {
  Palette,
  Sliders,
  Building,
  Shield,
  RotateCcw,
  Check,
  Upload,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { ClinicSettings, ClinicTheme } from '../types/clinic';
import { useToast } from '../components/Toast';

interface SettingsViewProps {
  settings: ClinicSettings;
  onUpdateSettings: (newSettings: ClinicSettings) => void;
  onResetSettings: () => void;
}

type SettingsTab = 'appearance' | 'sidebar' | 'branding' | 'access' | 'reset';

interface ThemeCardInfo {
  id: ClinicTheme;
  name: string;
  type: 'Light' | 'Dark';
  description: string;
  colors: string[];
}

const THEME_OPTIONS: ThemeCardInfo[] = [
  {
    id: 'sky-blue',
    name: 'English Rose & Alabaster',
    type: 'Light',
    description: 'Calm off-white alabaster canvas with muted dusty rose and sage accents',
    colors: ['#c96d8c', '#76c99a', '#ffffff', '#f8f8f6'],
  },
  {
    id: 'neon-modern-blue',
    name: 'Powder Slate Blue',
    type: 'Light',
    description: 'Understated English slate blue on crisp cool porcelain surfaces',
    colors: ['#4880b2', '#9bc9e7', '#ffffff', '#f5f7fa'],
  },
  {
    id: 'bone-white-blue',
    name: 'Bone White & Heritage Navy',
    type: 'Light',
    description: 'Warm archival linen paper with restrained navy clinical accents',
    colors: ['#46689b', '#83accb', '#fcfbf8', '#f5f3ee'],
  },
  {
    id: 'eco-green',
    name: 'Botanical Sage',
    type: 'Light',
    description: 'Muted celadon green and soft eucalyptus surfaces for calm focus',
    colors: ['#488e67', '#9bcfaf', '#ffffff', '#f5f8f5'],
  },
  {
    id: 'cherry-red',
    name: 'Muted Berry Blush',
    type: 'Light',
    description: 'Refined English berry rose tones on soft warm stone cards',
    colors: ['#bf5f7c', '#e4a5b9', '#ffffff', '#f9f6f6'],
  },
  {
    id: 'warm-pastel',
    name: 'Warm Oat & Sand',
    type: 'Light',
    description: 'Gentle honey sand and cream paper aesthetic for relaxed reading',
    colors: ['#b3803c', '#efcc8a', '#fffefd', '#f8f6f2'],
  },
  {
    id: 'midnight-clinical',
    name: 'Matte Graphite Dark',
    type: 'Dark',
    description: 'Calm obsidian charcoal and matte slate with desaturated dusty rose and sage',
    colors: ['#d489a1', '#79b896', '#1e2027', '#141519'],
  },
  {
    id: 'night-galaxy',
    name: 'Warm Espresso Dark',
    type: 'Dark',
    description: 'Low-strain warm charcoal surfaces with muted dove lilac and sand accents',
    colors: ['#c0a3dc', '#d4ad76', '#24232a', '#17161a'],
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form local state for branding
  const [brandingForm, setBrandingForm] = useState({
    clinicName: settings.clinicName || 'Dr. Marcus Johnson Clinical Suite',
    doctorName: settings.doctorName || 'Dr. Marcus Johnson',
    clinicDegree: settings.clinicDegree || 'M.B.B.S., M.D. (Internal Medicine)',
    regNumber: settings.regNumber || 'GMC-1998-4421',
    clinicAddress: settings.clinicAddress || 'Main Avenue, Medical Plaza, Suite 204',
    clinicPhone: settings.clinicPhone || '9839000000',
  });

  const handleSelectTheme = (themeId: ClinicTheme) => {
    onUpdateSettings({
      ...settings,
      theme: themeId,
    });
    showToast(`Switched theme to ${themeId}`, 'success', 'Theme Updated');
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      ...brandingForm,
    });
    showToast('Clinic branding & header details updated successfully', 'success', 'Branding Saved');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error', 'Invalid File');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds 2MB limit. Please choose a smaller logo file.', 'error', 'File Too Large');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onUpdateSettings({
        ...settings,
        logoDataUrl: base64,
      });
      showToast('Clinic logo uploaded and applied across clinic headers', 'success', 'Logo Updated');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onUpdateSettings({
      ...settings,
      logoDataUrl: undefined,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Clinic logo removed, restored default icon badge', 'info', 'Logo Removed');
  };

  const handleExecuteReset = () => {
    onResetSettings();
    setIsResetConfirmOpen(false);
    showToast('Reset all UI preferences, filters, and theme back to factory default', 'info', 'Settings Reset');
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="neu-card rounded-[24px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-lilac px-3 py-1 text-xs font-bold">
              Clinic Configuration
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              System Preferences &amp; Personalization
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            System &amp; Clinic Settings
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Configure visual themes, navigation orientation, clinic identity, and system accessibility.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Vertical Tab Navigation */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          <button
            id="settings-tab-appearance"
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs text-left transition-all ${
              activeTab === 'appearance'
                ? 'bg-[var(--accent-primary)] text-white font-bold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] border border-[var(--border)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <div className="flex-1">
              <div>Appearance & Themes</div>
              <div className={`text-[10px] ${activeTab === 'appearance' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                8 Color Palettes
              </div>
            </div>
          </button>

          <button
            id="settings-tab-sidebar"
            onClick={() => setActiveTab('sidebar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs text-left transition-all ${
              activeTab === 'sidebar'
                ? 'bg-[var(--accent-primary)] text-white font-bold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] border border-[var(--border)]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <div className="flex-1">
              <div>Side Menu Bar</div>
              <div className={`text-[10px] ${activeTab === 'sidebar' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                Orientation & Hover
              </div>
            </div>
          </button>

          <button
            id="settings-tab-branding"
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs text-left transition-all ${
              activeTab === 'branding'
                ? 'bg-[var(--accent-primary)] text-white font-bold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] border border-[var(--border)]'
            }`}
          >
            <Building className="w-4 h-4" />
            <div className="flex-1">
              <div>Clinic Branding & Logo</div>
              <div className={`text-[10px] ${activeTab === 'branding' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                Doctor & Clinic Info
              </div>
            </div>
          </button>

          <button
            id="settings-tab-access"
            onClick={() => setActiveTab('access')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs text-left transition-all ${
              activeTab === 'access'
                ? 'bg-[var(--accent-primary)] text-white font-bold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] border border-[var(--border)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <div className="flex-1">
              <div>Access Profile</div>
              <div className={`text-[10px] ${activeTab === 'access' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                HexAtom v2026 Preview
              </div>
            </div>
          </button>

          <button
            id="settings-tab-reset"
            onClick={() => setActiveTab('reset')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[18px] font-medium text-xs text-left transition-all cursor-pointer ${
              activeTab === 'reset'
                ? 'bg-[var(--danger)] text-white font-bold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--pastel-rose-fg)] hover:bg-[var(--pastel-rose-bg)] border border-[var(--border)]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <div className="flex-1">
              <div>Reset &amp; Defaults</div>
              <div className={`text-[10px] ${activeTab === 'reset' ? 'text-white/85' : 'opacity-80'}`}>
                Restore Factory State
              </div>
            </div>
          </button>
        </div>

        {/* Right Tab Content Container */}
        <div className="flex-1 neu-card rounded-[24px] p-5 sm:p-6">
          {/* TAB 1: APPEARANCE & THEMES */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Appearance & Clinical Color Themes
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Choose from 8 specialized themes (6 clean Light themes and 2 low-strain Dark themes).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = (settings.theme || 'sky-blue') === theme.id;
                  return (
                    <div
                      key={theme.id}
                      id={`theme-card-${theme.id}`}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 shadow-xs bg-[var(--surface-elevated)]'
                          : 'border-[var(--border)] hover:border-slate-400 bg-[var(--surface)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[var(--text-primary)]">
                            {theme.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 ${
                              theme.type === 'Light' ? 'badge-sand' : 'badge-neutral'
                            }`}
                          >
                            {theme.type}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-muted)] mt-1.5">
                        {theme.description}
                      </p>

                      {/* Color Palette Dots */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border)]">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">Palette:</span>
                        <div className="flex items-center gap-1.5">
                          {theme.colors.map((c, i) => (
                            <span
                              key={i}
                              style={{ backgroundColor: c }}
                              className="w-4 h-4 rounded-full border border-[var(--border)] shadow-2xs"
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SIDE MENU BAR */}
          {activeTab === 'sidebar' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Side Menu Bar & Navigation Preferences
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Configure orientation, collapse behaviors, hover expansion, and visual overrides.
                </p>
              </div>

              {/* 1. Navigation Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-primary)] block uppercase tracking-wider">
                  Navigation Orientation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, navOrientation: 'vertical' })}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      (settings.navOrientation || 'vertical') === 'vertical'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Vertical Sidebar (Standard)</div>
                      <div className="text-[11px] opacity-80">Full left sidebar with 288px / 90px rail modes</div>
                    </div>
                    {(settings.navOrientation || 'vertical') === 'vertical' && <Check className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, navOrientation: 'horizontal' })}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      settings.navOrientation === 'horizontal'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Horizontal Navigation Bar</div>
                      <div className="text-[11px] opacity-80">Compact top navigation bar with dropdown menus</div>
                    </div>
                    {settings.navOrientation === 'horizontal' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2. Collapsed Behavior */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--text-primary)] block uppercase tracking-wider">
                  Collapsed Behavior
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, collapsedBehavior: 'half-close', sidebarMode: 'icon-rail' })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      (settings.collapsedBehavior || 'half-close') === 'half-close'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Half Close (Icon Rail 90px)</div>
                      <div className="text-[11px] opacity-80">Keeps module icons easily accessible</div>
                    </div>
                    {(settings.collapsedBehavior || 'half-close') === 'half-close' && <Check className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, collapsedBehavior: 'full-close', sidebarMode: 'hidden' })}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      settings.collapsedBehavior === 'full-close'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Full Close (Completely Hidden)</div>
                      <div className="text-[11px] opacity-80">Maximizes workspace width for wide charts & tables</div>
                    </div>
                    {settings.collapsedBehavior === 'full-close' && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 3. Hover Expansion Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">Hover Expansion</div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    In 90px Icon Rail mode, hovering smoothly expands to 288px without clicking (150-220ms ease).
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ ...settings, hoverExpansion: !settings.hoverExpansion })}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                    settings.hoverExpansion ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-[var(--surface-elevated)] shadow-sm transition-transform ${
                      settings.hoverExpansion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 4. Sidebar Appearance Override */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--text-primary)] block uppercase tracking-wider">
                  Sidebar Appearance Override
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'follow-theme', label: 'Follow Theme' },
                    { id: 'force-light', label: 'Force Light' },
                    { id: 'force-dark', label: 'Force Dark' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdateSettings({ ...settings, sidebarAppearance: opt.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        (settings.sidebarAppearance || 'follow-theme') === opt.id
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-text)] font-bold'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Clinic Branding & Identity
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Update doctor details, clinic title, registration certificate details, and header logo.
                </p>
              </div>

              {/* Logo Upload Section */}
              <div className="p-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-3">
                <div className="text-xs font-bold text-[var(--text-primary)]">Clinic Logo</div>
                <div className="flex items-center gap-4 flex-wrap">
                  {settings.logoDataUrl ? (
                    <div className="relative group">
                      <img
                        src={settings.logoDataUrl}
                        alt="Current Logo"
                        className="h-14 w-auto max-w-[180px] object-contain rounded-[14px] border border-[var(--border)] bg-[var(--surface-elevated)] p-1.5"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1.5 bg-[var(--danger)] text-white rounded-full shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-14 w-32 rounded-[14px] border-2 border-dashed border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)]">
                      No Logo Uploaded
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload-input"
                    />
                    <label
                      htmlFor="logo-upload-input"
                      className="neu-pill-btn cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[var(--text-primary)] rounded-full"
                    >
                      <Upload className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>{settings.logoDataUrl ? 'Change Logo' : 'Upload Clinic Logo'}</span>
                    </label>
                    <p className="text-[10.5px] text-[var(--text-muted)]">
                      Supported: PNG, JPG, SVG, WebP (Max 2MB). Stored offline locally in browser.
                    </p>
                  </div>
                </div>
              </div>

              {/* Branding Form */}
              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Clinic Title
                    </label>
                    <input
                      type="text"
                      value={brandingForm.clinicName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, clinicName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      value={brandingForm.doctorName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, doctorName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Qualifications & Degrees
                    </label>
                    <input
                      type="text"
                      value={brandingForm.clinicDegree}
                      onChange={(e) => setBrandingForm({ ...brandingForm, clinicDegree: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Medical Registration Number
                    </label>
                    <input
                      type="text"
                      value={brandingForm.regNumber}
                      onChange={(e) => setBrandingForm({ ...brandingForm, regNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Clinic Address
                    </label>
                    <input
                      type="text"
                      value={brandingForm.clinicAddress}
                      onChange={(e) => setBrandingForm({ ...brandingForm, clinicAddress: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Contact Telephone
                    </label>
                    <input
                      type="text"
                      value={brandingForm.clinicPhone}
                      onChange={(e) => setBrandingForm({ ...brandingForm, clinicPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--accent-primary)] hover:opacity-90 rounded-full shadow-xs transition-opacity cursor-pointer"
                  >
                    Save Branding Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ACCESS PROFILE */}
          {activeTab === 'access' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Access Profile & Demonstration Specifications
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Verified system build information and dataset integrity lineage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Software Platform</span>
                  <div className="font-bold text-sm text-[var(--text-primary)]">Dr. Marcus Johnson Clinical Suite</div>
                  <div className="text-xs text-[var(--text-secondary)]">Version: 2026 Preview Edition (Hexatom)</div>
                </div>

                <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Architecture</span>
                  <div className="font-bold text-sm text-[var(--success)]">100% Offline & Portable</div>
                  <div className="text-xs text-[var(--text-secondary)]">Zero Python, Zero Node.js, Zero Cloud Runtime</div>
                </div>

                <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Audit Lineage Range</span>
                  <div className="font-bold text-sm text-[var(--text-primary)]">1999 to August 2026</div>
                  <div className="text-xs text-[var(--text-secondary)]">27 years of longitudinal medical data</div>
                </div>

                <div className="p-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Verified Total Records</span>
                  <div className="font-bold text-sm text-[var(--text-primary)]">43,488 Profiles · 158,361 Visits</div>
                  <div className="text-xs text-[var(--text-secondary)]">22 tables across CORE, LOOKUP, DUMP</div>
                </div>
              </div>

              <div
                className="p-4 rounded-[20px] border text-xs flex items-start gap-3"
                style={{
                  background: 'var(--pastel-sage-bg)',
                  color: 'var(--pastel-sage-fg)',
                  borderColor: 'var(--pastel-sage-border)',
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Doctor Preview Mode Active</div>
                  <p className="mt-0.5 opacity-90">
                    This forensic preview operates in strict read-only mode to safeguard original medical records.
                    No write-back or modification occurs on original storage files.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESET & DEFAULTS */}
          {activeTab === 'reset' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-bold" style={{ color: 'var(--pastel-rose-fg)' }}>
                  Reset System &amp; UI Preferences
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Restore theme, navigation, search filters, and layout back to default settings without deleting patient data.
                </p>
              </div>

              <div
                className="p-5 rounded-[20px] border space-y-3.5"
                style={{
                  background: 'var(--pastel-rose-bg)',
                  borderColor: 'var(--pastel-rose-border)',
                }}
              >
                <div
                  className="flex items-start gap-2.5"
                  style={{ color: 'var(--pastel-rose-fg)' }}
                >
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">Safe Configuration Reset</div>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      Resetting will restore the default theme, expanded vertical sidebar, clear active search queries,
                      and revert branding placeholders. Your 43,488 patient records and 158,361 clinical encounters remain 100% intact.
                    </p>
                  </div>
                </div>

                <button
                  id="execute-reset-settings-btn"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[var(--danger)] hover:opacity-90 rounded-full shadow-xs transition-opacity flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters &amp; UI Settings</span>
                </button>
              </div>

              {/* Confirmation Dialog Modal */}
              {isResetConfirmOpen && (
                <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[var(--surface-elevated)] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-4 border border-[var(--border)] animate-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: 'var(--pastel-rose-bg)',
                          color: 'var(--pastel-rose-fg)',
                        }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[var(--text-primary)]">
                          Confirm Reset to Defaults?
                        </h4>
                        <p className="text-xs text-[var(--text-muted)]">
                          This action will reset your UI preferences.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      All custom theme selections, sidebar modes, and search filters will be restored to factory configuration.
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsResetConfirmOpen(false)}
                        className="neu-pill-btn px-4 py-2 text-xs font-semibold text-[var(--text-primary)] rounded-full cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteReset}
                        className="px-4 py-2 text-xs font-bold text-white bg-[var(--danger)] hover:opacity-90 rounded-full shadow-xs cursor-pointer"
                      >
                        Yes, Reset Everything
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
