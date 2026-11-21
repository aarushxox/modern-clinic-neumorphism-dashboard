# Build & Deployment Guide — Dr. J.S. Pandey Clinic

## 1. System Overview
This preview is packaged as a standalone, zero-installation portable system. In production/client deployment, the build artifact produces a lightweight local loopback launcher (`ClinicPreview.exe`) that starts an internal HTTP server bound exclusively to `127.0.0.1` and opens the doctor's default web browser.

## 2. Developer Build Instructions

### Prerequisites (Developer Machine Only)
- Node.js 18+ / npm
- Vite / TypeScript toolchain

### Build Commands
```bash
# Install base dependencies
npm install

# Build static production bundle
npm run build
```

### Production Artifact Verification
1. Output directory `dist/` contains all optimized static HTML, JavaScript, CSS, and asset files.
2. Zero external CDN references exist in output files.
3. Verification: Disconnect internet and open `dist/index.html` or launch via local loopback. All search, filtering, and data inspection features must function completely offline.

## 3. Client Demonstration Package Structure
```text
Clinic-Preview-Version/
├── ClinicPreview.exe          # Standalone executable launcher (embedded loopback server)
├── README-DEMO.txt            # Simple 3-step doctor instructions
├── DEMO-GUIDE.pdf             # Executive printed overview for Dr. J.S. Pandey
├── DATA-SOURCES.md            # Forensic table provenance
└── KNOWN-LIMITATIONS.md       # Documented scope and forensic notes
```
