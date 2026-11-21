# Repository Policies, UI Design Protection & Technical Stack

This document outlines the public usage policy, UI design protection rules, synthetic data boundaries, and complete technical stack for **Modern Clinic Neumorphism Dashboard** (`https://github.com/aarushxox/modern-clinic-neumorphism-dashboard`).

---

## 1. UI Design Protection & Public Usage Policy

This repository is made **public on GitHub** so developers, designers, and reviewers can inspect the architecture, run the interactive preview locally, and evaluate the soft-UI neumorphism healthcare workspace.

However, **public visibility does not grant unrestricted copying rights**:

- **Protected UI Design & Source**: The visual design system, component layouts, color token architecture, screenshots, and integrated frontend code are **copyright-protected** and governed by the repository's **[Custom Source-Available Public Preview License](LICENSE)**.
- **What You CAN Do**:
  - Browse the repository, read the architecture documentation, and inspect the 25 preview assets.
  - Clone and run the project locally on your machine strictly for personal review, study, or UI evaluation.
  - Reference or link to this repository publicly with clear attribution to **Pranav Raj Sahu (Hexatom Team / Aronar AI)**.
- **What You CANNOT Do Without Prior Written Permission**:
  - Copy, clone, rebrand, or redistribute the UI design, layouts, or source code for personal, client, or commercial projects.
  - Publish this dashboard as a template, SaaS product, marketplace item, or portfolio showcase under another name.
  - Strip or hide attribution notices (`LICENSE`, `POLICIES.md`, or footer credits).

### Why a Custom License Instead of MIT or Apache-2.0?

Standard open-source licenses such as **MIT** and **Apache-2.0** legally permit anyone to copy, rebrand, and sell the UI and codebase without asking permission. Because the UI design of this project is protected and requires permission prior to copying or reuse, this repository uses an explicitly labeled **Custom License** in [`LICENSE`](LICENSE) rather than modifying a standard MIT/Apache template.

---

## 2. Human + AI Craft & Complete Technical Stack

This clinical interface was collaboratively engineered through **human product & frontend direction** paired with **AI-assisted development tools**.

### AI & Development Tooling Used

| Tool / Platform | Role in Building This Project |
|---|---|
| **Google AI Studio** | Interactive build workspace, iterative UI architecture, and component prototyping |
| **Gemini Models** | Code synthesis, layout refinement, responsive styling, and documentation authoring |
| **API & Developer Tooling** | Automated verification (`tsc --noEmit`, Vite build checks), SVG spec rendering, and browser print/CSV workflows |
| **Hexatom Design Ecosystem** | Typography calibration ([Hexatom Fonts](https://the-fonts-hexatom.pranavsahu005.workers.dev/)) and color system balancing ([Hexatom Colors](https://hexatom-the-colors.base44.app/)) |

### Frontend & Runtime Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **UI Framework** | React & React DOM | `19.0.1` | Component composition, hooks, and modular clinical views |
| **Type Safety** | TypeScript | `~5.8.2` | Strict clinical records, schedule reminders, and service contracts |
| **Build Tool** | Vite | `6.2.3` | Local dev server (`port 3000`) and optimized ES module bundling |
| **Styling System** | Tailwind CSS + `@tailwindcss/vite` | `4.1.14` | Utility classes combined with 7-theme CSS custom properties and `@media print` rules |
| **Charts & Sparklines** | Recharts | `3.10.1` | 6-month visit trends, patient vitals charts, and inline HR/BP sparklines |
| **Animation** | Motion (`motion/react`) | `12.23.24` | `AnimatePresence` page transitions, reminder overlay popover, and FAB spring physics |
| **Iconography** | Lucide React | `0.546.0` | Crisp, uniform vector medical and navigation icons (zero emojis) |
| **Typography** | Outfit, Plus Jakarta Sans, JetBrains Mono | Google Fonts | Editorial headings, UI readability, and tabular clinical metrics |

---

## 3. Data Privacy & Synthetic Preview Policy

- **100% Synthetic Dummy Data Only**: Every patient name, serial number, vital sign, diagnosis, prescription, certificate, and cashbook entry in this repository is synthetic placeholder data created strictly for UI preview.
- **No Private Clinical Data or Secrets**: Real clinic databases (`*.db`, `*.sqlite`, `*.mdb`, `*.accdb`, `*.sql`), `.env*` secrets, API keys, and exported CSVs are explicitly excluded via `.gitignore`.
- **Non-Medical Disclaimer**: This UI preview is not a certified medical device and must not be used directly for real patient diagnosis or clinical care without independent clinical validation and compliant private backend infrastructure.

---

## 4. Permission Requests & Official Contact

To request permission to license, adapt, or reuse the UI design or codebase in a project, contact **Pranav Raj Sahu (Hexatom Team / Aronar AI)** through any official channel below:

- **GitHub Repository**: [https://github.com/aarushxox/modern-clinic-neumorphism-dashboard](https://github.com/aarushxox/modern-clinic-neumorphism-dashboard)
- **Pranav Sahu Portfolio**: [https://pranav005-portfolio.netlify.app/](https://pranav005-portfolio.netlify.app/)
- **Hexatom**: [https://hexatom-org.vercel.app/](https://hexatom-org.vercel.app/)
- **Hexatom Portfolio**: [https://hexatom.imaginefuture1-7.workers.dev/](https://hexatom.imaginefuture1-7.workers.dev/)
- **Aronar AI**: [http://aronar-ai.vercel.app/](http://aronar-ai.vercel.app/)
