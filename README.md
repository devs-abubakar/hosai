# HOSAI — Centralized Healthcare Management Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20RLS-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

**HOSAI** is a centralized, AI-powered healthcare management platform connecting patients, verified doctors, and hospitals into a unified, lifelong medical record system. It replaces fragmented paper files, disconnected clinic records, and scattered diagnostic portals with a single, patient-owned, cryptographically secure digital medical passport.

---

## 🔒 Security & Role-Based Authentication

HOSAI implements strict role separation and permission controls:

1. **Role-Separated Authentication Portals:** Dedicated login tabs for **Patient Portal**, **Doctor Portal**, and **Administrator Portal**.
2. **Strict Boundary Enforcement:** Accounts registered under one role cannot authenticate into another portal. A patient cannot access a doctor dashboard, and vice versa.
3. **No In-App Impersonation:** All demo switchers and account toggles have been removed. Users must authenticate with genuine credentials and use the secure Sign Out button to exit their session.
4. **Controlled Registration:** Public onboarding allows registering as a **Patient** or **Doctor** only. Doctor accounts are placed in `pending` verification until audited by an Administrator. Public registration of Admin accounts is strictly prohibited.
5. **Database-Level Row Level Security (RLS):** Medical records, conditions, medications, consultations, and prescriptions are protected by PostgreSQL RLS policies in `supabase/schema.sql`. Doctors cannot query or view medical charts without active patient authorization.

---

## 🔑 Test Login Credentials (DEMO ONLY)

All test accounts are pre-seeded with realistic clinical data. Test credentials can also be filled in one click using the "Demo Test Credentials" assistant on the login page:

| Portal | Role | Name | Username | Email | Password | Clinical Profile / Notes |
|---|---|---|---|---|---|---|
| **Patient** | Patient | Sarah Jenkins | `@sarah_jenkins` | `sarah@hosai.health` | `Password123!` | Hypertension, Mitral Regurgitation, **Severe Penicillin Allergy**, Echocardiogram & ECG |
| **Patient** | Patient | Robert Chen | `@robert_chen` | `robert@hosai.health` | `Password123!` | Type 2 Diabetes, Shellfish Allergy, Metformin, HbA1c Lab Report |
| **Doctor** | Doctor | Dr. Marcus Vance | `@dr_vance` | `marcus.vance@hosai.health` | `Password123!` | Cardiologist (14 yrs exp), Verified, Authorized for Sarah Jenkins |
| **Doctor** | Doctor | Dr. Priya Sharma | `@dr_sharma` | `priya.sharma@hosai.health` | `Password123!` | Neurologist (9 yrs exp), Verified, St. Jude Memorial Hospital |
| **Doctor** | Doctor | Dr. James Wilson | `@dr_wilson` | `james.wilson@hosai.health` | `Password123!` | Family Medicine (4 yrs exp), **Pending Licensure Verification** |
| **Admin** | Admin | Elena Rostova | `@admin_elena` | `admin@hosai.health` | `AdminPassword123!` | Platform Regulatory Administrator (Verifies doctors, manages hospitals) |

> **Notice:** These accounts are pre-populated with fictional medical data for hackathon evaluation and testing purposes only.

---

## 🔍 Doctor Search by Patient Username & Access Request Workflow

Doctors can locate any registered patient using their unique username without exposing private medical records across an unrestricted endpoint:

```
[Doctor Dashboard] 
       │
       ▼
Search Patient by @username (e.g. "@robert_chen")
       │
       ├─► If ACTIVE: "Open Full Medical Chart" (Full EHR access granted)
       │
       └─► If NOT ACTIVE: "Access Restricted: Protected under RLS"
                 │
                 ▼
         Click "Request Access"
                 │
                 ▼
[Patient Dashboard / Passport]
                 │
                 ▼
Patient receives "Clinical Access Request" alert from Doctor
                 │
                 ├─► Decline Request ──► Access status set to "rejected"
                 │
                 └─► Approve Access ──► Access status set to "active"
                                            │
                                            ▼
                           Doctor now has full authorized access to 
                           view medical history, upload records, and 
                           issue consultations & prescriptions!
```

### Try this in the live demo:
1. Log in as **Dr. Marcus Vance** (`marcus.vance@hosai.health` / `Password123!`).
2. In the Doctor Dashboard search bar, enter `robert_chen`.
3. Notice that Robert's medical history is protected and locked. Click **Request Access** and submit a brief consultation note.
4. Click **Sign Out** in the top navigation.
5. Log in as **Robert Chen** (`robert@hosai.health` / `Password123!`).
6. Notice the **Incoming Clinical Access Requests** banner on Robert's dashboard. Click **Approve Access**.
7. Sign out and log back in as **Dr. Marcus Vance**. Search `robert_chen` or check your Authorized Patients roster—Robert Chen's full medical chart is now unlocked, allowing you to review his diabetes history and issue consultations!

---

## 🏥 Architecture & Tech Stack

- **Frontend:** Next.js 16.4+ (App Router), React 19, TypeScript (Strict)
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, clean SaaS visual hierarchy (no generic gradients or emojis)
- **Toast Notifications:** Sonner (Emil Kowalski's toast library)
- **Database & Auth:** Supabase (PostgreSQL 15+) with Row-Level Security (RLS)
- **Data Engine:** Hybrid Reactive Store with automatic persistence and zero-config evaluation

---

## 🏃 Getting Started Locally

### 1. Installation
```bash
git clone https://github.com/your-username/patient-record-tracker.git
cd patient-record-tracker
npm install
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env.local` to connect your live Supabase project:
```bash
cp .env.example .env.local
```
*(HOSAI functions out of the box with its built-in reactive seed store if external Supabase credentials are not provided.)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Test
```bash
npm run build
npm start
```

---

## 📜 Database Scripts
- [`supabase/schema.sql`](supabase/schema.sql): Complete PostgreSQL DDL with tables, indexes, and RLS policies.
- [`supabase/seed.sql`](supabase/seed.sql): Production-grade test seed data with patients, doctors, hospitals, and medical records.
