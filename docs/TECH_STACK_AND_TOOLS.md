# Tech Stack & Engineering Tools

A complete inventory of the frameworks, visualization engines, styling tools, and build utilities powering **Modern Clinic Neumorphism Dashboard**.

---

## Core Runtime Stack

| Category | Tool / Library | Version | Role in Application |
|---|---|---|---|
| UI Framework | React & React DOM | `19.0.1` | Component architecture, hooks, strict concurrent rendering |
| Language | TypeScript | `~5.8.2` | End-to-end static typing for clinical models and service contracts |
| Build & Dev Server | Vite | `6.2.3` | Instant HMR development and optimized production ES module bundling |
| Styling Engine | Tailwind CSS + `@tailwindcss/vite` | `4.1.14` | Utility-first layout paired with 7-theme CSS custom property tokens |
| Data Visualization | Recharts | `3.10.1` | 6-month visit frequency lines, inline HR/BP sparklines, historical vitals & analytics |
| Motion & Transitions | Motion (`motion/react`) | `12.23.24` | Smooth `AnimatePresence` page transitions, reminder overlay popover, FAB springs |
| Vector Iconography | Lucide React | `0.546.0` | Crisp, consistent stroke-width medical & workspace icons (zero emojis) |

---

## Build, Verification & Quality Scripts

| Command | Tool Executed | Purpose |
|---|---|---|
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts local development server on port 3000 |
| `npm run build` | `vite build` | Produces minified production assets in `dist/` |
| `npm run preview` | `vite preview` | Serves the compiled production bundle locally for smoke testing |
| `npm run lint` | `tsc --noEmit` | Runs full TypeScript static verification without emitting artifacts |
| `npm run clean` | `rm -rf dist server.js` | Cleans local build artifacts |

---

## Design & AI Engineering Tooling Credits

This project was collaboratively designed and engineered by **Pranav Raj Sahu (Hexatom Team / Aronar AI)** using human systems engineering combined with modern AI-assisted workflows:

- **Google AI Studio & Gemini Models**: UI architecture exploration, rapid component prototyping, and clinical workflow refinement.
- **Hexatom Design Ecosystem**: Typography pairing (`Hexatom Fonts`) and balanced pastel/dark color calibration (`Hexatom Colors`).
- **Browser Standards**: Native `@media print` stylesheets, Blob-based RFC-4180 CSV generation, and Web Storage API (`localStorage`) for zero-latency preview state.
