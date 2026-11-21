# Live Doctor Demonstration Guide — Dr. J.S. Pandey Clinic

This guide provides a structured 10-step walkthrough for demonstrating the recovered historical dataset to Dr. J.S. Pandey.

---

### Step 1: Open the Clinic Executive Dashboard
- **Action:** Open Dashboard (`/dashboard`).
- **Talking Point:** *"Dr. Pandey, we have successfully recovered and indexed all 43,488 active patient demographic profiles and 158,361 clinical encounter records from your legacy clinic system dating back to 1999."*
- **Key Visuals:** Point out the Bento KPI cards showing 43,488 profiles, 158,361 visits, 73 master drugs, 357 shortcuts, 2,709 certificates, and 6,693 cashbook records.

---

### Step 2: Test Live Patient Search
- **Action:** Navigate to Search Patients (`/search`) or use the top search shortcut.
- **Talking Point:** *"You can search any patient in real time by name, registration number, guardian name, phone number, or address."*
- **Live Test:** Ask the doctor for a known patient name (e.g., *Sharma*, *Verma*, *Mishra*, *Gupta*) or enter a serial (e.g. `#1420`). Observe instant response with full demographic summaries.

---

### Step 3: Open Longitudinal Patient History & Allergy Alert
- **Action:** Click "View Full History" on any patient.
- **Talking Point:** *"Every patient profile features a longitudinal timeline with newest visits first. Important drug allergies receive prominent warning badges at the top."*
- **Key Visuals:** Point out the prominent red allergy banner (e.g., Penicillin/Aspirin warning), demographics, total visits, and first vs. last recorded visit dates.

---

### Step 4: Inspect Clinical Visit Details & Decoded Hindi Directions
- **Action:** Expand a visit card on the patient modal.
- **Talking Point:** *"We have decoded the legacy RTF stream and Kruti-Dev 010 Hindi script into clean Devanagari text and structured medicine dosages."*
- **Key Visuals:** Show the structured table with TAB/CAP/SYP types, dosages, frequencies (1-0-1, 1-1-1), and Hindi directions (*"१ गोली सुबह-शाम खाने के बाद"*). Toggle "Show Forensic RTF" to prove exact raw byte extraction.

---

### Step 5: Review Today's Clinic Day View
- **Action:** Navigate to Today's Clinic (`/today`).
- **Talking Point:** *"Rather than showing a misleading empty screen for today's date, the system defaults honestly to the most recent recorded clinic day (12 August 2026). You can also jump to any historical calendar date."*
- **Key Visuals:** Show the day's patient queue, vitals (BP, pulse), consultation fees recorded, and instant access to each patient's full past history.

---

### Step 6: Verify Formulary & 357 Clinical Keyboard Shortcuts
- **Action:** Navigate to Medicines (`/medicines`) and Shortcuts (`/shortcuts`).
- **Talking Point:** *"Your master drug list of 73 formulations (Cipla, Abbott, Sun Pharma) and all 357 keyboard shortcuts (URI1, AP1, HTN1, etc.) have been preserved 1:1."*
- **Key Visuals:** Show the expanded multi-drug treatment templates triggered by each keyboard code.

---

### Step 7: Inspect Issued Certificates & Cashbook Journal
- **Action:** Navigate to Certificates (`/certificates`) and Cashbook (`/cashbook`).
- **Talking Point:** *"All 2,709 historical medical fitness/sick leave certificates and 6,693 cashbook ledger entries are intact and searchable."*

---

### Step 8: Forensic Data Health & Serial Gap Analysis
- **Action:** Navigate to Data Health (`/data-health`).
- **Talking Point:** *"We have conducted a thorough audit explaining why the highest issued registration serial is 52,533 while active patient profiles stand at 43,488. The historical gaps represent past system backup partitions rather than lost files."*
- **Key Visuals:** Show the CORE vs LOOKUP vs DUMP vs ERROR table taxonomy and the 1999–2026 system timeline.

---

### Step 9: Technical Data Explorer (Optional)
- **Action:** Navigate to Data Explorer (`/data-explorer`).
- **Talking Point:** *"For technical transparency, you can inspect all 22 legacy database tables, verify column definitions, and safely export filtered views to CSV."*

---

### Step 10: Proposed Modernization Roadmap & Print Report
- **Action:** Navigate to About & Proposal (`/about`).
- **Talking Point:** *"This read-only forensic preview proves that your clinic data is 100% understood. Upon your approval, Phase 2 will migrate this verified data into a high-speed SQLite multi-station clinic application with prescription printing and reception queue sync."*
- **Action:** Click "Print Preview" to demonstrate crisp letterhead printing.
