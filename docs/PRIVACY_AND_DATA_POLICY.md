# Privacy, Synthetic Data Guarantee & Public Usage Policy

This repository is intentionally published as a **public UI/UX reference and reusable clinical dashboard template** at `https://github.com/aarushxox/modern-clinic-neumorphism-dashboard`.

---

## 1. Synthetic Preview Data Notice (Zero Private Data Exposed)

> **Important Notice:** All patient profiles, serial numbers, diagnoses, vitals histories, certificates, and cashbook entries visible in this repository are **100% synthetic dummy data** generated strictly for public UI preview and educational demonstration.

- **No Real Patient Health Information (PHI)**: Zero real patient names, phone numbers, medical records, or legacy clinic databases are stored in this repository.
- **No Production APIs or Secrets**: No live API keys, private backend endpoints, database connection strings, or authentication secrets exist in this codebase.
- **Client-Local Preview Storage**: Quick-added walk-in patients and theme preferences are written solely to the reviewer's own browser `localStorage` and are never transmitted to any external server.

---

## 2. Repository Hygiene & `.gitignore` Protections

Before pushing to GitHub, `.gitignore` is hardened to prevent accidental exposure of private operational assets:

```gitignore
# Environment variables & secrets (NEVER commit)
.env
.env.*
!.env.example
*.pem
*.key
*credentials*.json
*secret*.json

# Private clinical databases & real CSV exports (NEVER commit)
private-data/
clinic-private/
exports/
backups/
*.db
*.sqlite
*.sqlite3
*.mdb
*.accdb
*.sql
*.bak
clinic-patients-*.csv
patient-export-*.csv
```

If you fork this UI to connect it to a real clinical backend:
1. Replace `ClinicDataProvider` with authenticated server-side API calls over HTTPS.
2. Enforce role-based access control (RBAC), audit logging, and encryption at rest in accordance with applicable healthcare privacy regulations (HIPAA, GDPR, or ABDM/DPDP standards).
3. Never commit real patient exports or database dumps to version control.

---

## 3. Public Open-Usage Policy & Attribution

This UI codebase is publicly accessible so developers, designers, and teams can inspect, learn from, and build upon the soft-UI neumorphism dashboard architecture.

- **Permitted Use**: You may clone, study, adapt, and customize the UI components and layouts under the terms of the repository `LICENSE` (MIT License with Attribution).
- **Attribution Requirement**: Retain clear credit to **Pranav Raj Sahu (Hexatom Team / Aronar AI)** and a link back to `https://github.com/aarushxox/modern-clinic-neumorphism-dashboard` in forks, portfolios, and derivative works.
- **AI + Human Craft Disclosure**: This user interface was collaboratively engineered by human design leadership and AI tools (**Google AI Studio**, **Gemini**, and API tooling).
- **Non-Medical Disclaimer**: This software is a frontend UI showcase and does not provide certified medical diagnosis, clinical decision support, or prescription validation.
