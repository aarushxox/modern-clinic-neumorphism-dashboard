# Usage Guide, Workflows & Keyboard Shortcuts

This guide walks developers and reviewers through local setup, interactive workflows, keyboard navigation, CSV exports, and print-ready clinical reports.

---

## 1. Local Setup (Quick Start)

```bash
# 1. Clone the public repository
git clone https://github.com/aarushxox/modern-clinic-neumorphism-dashboard.git
cd modern-clinic-neumorphism-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server (runs at http://localhost:3000)
npm run dev
```

### Production Build & Type Check

```bash
# Static TypeScript validation
npm run lint

# Optimized production build
npm run build

# Preview production bundle locally
npm run preview
```

---

## 2. Global Keyboard Shortcuts

Keyboard navigation is available across every view (automatically ignored when typing inside text inputs unless a modifier key is held).

| Shortcut | Destination / Action |
|---|---|
| `Ctrl + D` (or `Alt + D`) | Switch to **Overview Dashboard** |
| `Ctrl + S` (or `Alt + S`) | Switch to **Patients Directory** |
| `Ctrl + T` (or `Alt + T`) | Switch to **Today's Clinic OPD** |
| `Ctrl + M` (or `Alt + M`) | Switch to **Medicines Master Formulary** |
| `Ctrl + K` (or `Alt + K`) | Switch to **Clinical Rx Shortcuts** |
| `Alt + C` | Switch to **Medical Certificates** |
| `Alt + J` | Switch to **Cashbook Journal** |
| `Alt + R` | Switch to **Clinical Analytics & Reports** |
| `Ctrl + ,` (or `Alt + P`) | Switch to **Settings & Theme Preferences** |
| `Ctrl + /` or `Ctrl + ?` | Toggle **Walkthrough & Shortcuts Guide** |
| `Escape` | Close active modal or Clinical Reminders overlay |

---

## 3. Core Interactive Workflows

### A. Reviewing Critical Clinical Reminders
1. Observe the schedule-synced **Clinical Reminder Banner** directly below the top Header bar.
2. Use the `<` / `>` stepper arrows to cycle through active alerts (`Upcoming Appointment in 10 minutes`, `Urgent Lab Report Pending`, `Vitals & Dosage Verification Due`).
3. Click the **Bell Icon** in the top-right header to open the full **Clinical Reminders Overlay**, jump straight to a patient's chart, dismiss individual alerts, or restore dismissed reminders.

### B. Filtering & Downloading Patient Records as CSV
1. Open the **Clinic day patients** panel on the Overview Dashboard.
2. Select a clinic date pill (e.g., `12 Aug`) and filter via the **Patient Status** dropdown (`All Statuses`, `Active`, `Pending Review`, or `Discharged`).
3. Toggle the inline sparklines between **HR** (Heart Rate) and **BP** (Blood Pressure).
4. Click **Download CSV** to save an RFC-4180 UTF-8 CSV file containing every matching record.

### C. Rapid Walk-In Onboarding (Quick Add Patient)
1. Click the floating **Quick Add Patient** button at the bottom-right corner of the Overview Dashboard.
2. Enter the minimal required fields (`Full Name`, `Age`, `Phone`) and optional `Sex` / `Chief Complaint`.
3. Click **Register & Add to OPD** — the new arrival appears immediately at the top of the clinic queue and persists in your browser's local preview storage.

### D. Printing Clinical Views & Patient Vitals Reports
- **Full View Print**: Click **Print Current View** in the Header bar.
- **Patient Vitals Report**: Open any patient profile modal and click **Print Patient Report** inside the modal or the **Vitals Summary** table header for a clean black-on-white clinical printout.
