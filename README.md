# HOSAI

HOSAI is a healthcare management application for organizing patient records and supporting patient, doctor, and administrator workflows. It addresses fragmented access to medical information by bringing profiles, conditions, allergies, medications, reports, consultations, provider discovery, and care coordination together.

## Features

- Patient, doctor, and administrator dashboards.
- Patient medical profile, records, and doctor discovery.
- Doctor patient search and clinical workflow UI.
- Appointment requests, doctor responses, appointment history, and 30-minute availability slots (Supabase-backed after setup below).
- Patient-aware Gemini assistant endpoint and chat UI (requires Gemini configuration and Supabase-backed patient data).
- Doctor verification and hospital management UI.

The existing dashboards still include local demo workflows. Those workflows are not a production authentication or data store.

## Roles

- **Patients** manage their profile and records, discover doctors, request appointments, and use the healthcare assistant.
- **Doctors** manage professional information, review appointment requests, create availability, and use authorized clinical workflows.
- **Administrators** manage doctor verification and healthcare facilities. Appointment and assistant endpoints deny administrator access; administrators do not receive unrestricted medical record access.

## Stack and architecture

Next.js App Router, React, TypeScript, Tailwind CSS, Lucide React, Sonner, Supabase Auth/Postgres/RLS, and Google's `@google/genai` SDK.

- `app/` — routes, layouts, and server API endpoints.
- `components/` — dashboards, authentication, appointments, discovery, and assistant UI.
- `lib/store.ts` — existing local demo state; it is not a security boundary.
- `lib/supabase/` — server Supabase client and verified profile helper.
- `lib/supabase.ts` — browser Supabase Auth client.
- `proxy.ts` — Supabase session refresh.
- `supabase/` — schema plus Auth profile trigger and appointment migrations.

## Setup

Requirements: a Node.js version supported by the installed Next.js release, npm, and a Supabase project for server-backed workflows.

```bash
npm install
npm run dev
```

Create `.env.local` with placeholders replaced by your project values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
GEMINI_API_KEY=YOUR_SERVER_SIDE_GEMINI_KEY
```

`GEMINI_API_KEY` must remain server-side and must never use a `NEXT_PUBLIC_` prefix. Never expose Supabase service-role credentials to the browser.

## Database setup

Review and apply these SQL files to a development Supabase project, in order:

1. `supabase/schema.sql`
2. `supabase/auth.sql`
3. `supabase/appointments.sql`

Enable Supabase email/password authentication and configure email confirmation to match the product's signup flow. The Auth trigger creates patient/doctor profile rows and keeps new doctors pending verification. Public admin signup is rejected. The appointment RPCs enforce identity, role, status transitions, and slot locking; direct client mutations are not granted. Validate SQL, RLS, signup, and concurrency behavior in a non-production project before deployment.

## Commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm start
```

There is no automated test script currently defined.

## Security and limitations

- Supabase-backed appointment and AI routes require configured Supabase Auth and applied migrations. Without those, the local demo mode remains available but cannot use these secure server features.
- The AI assistant reads only the authenticated patient's RLS-protected records and sends bounded text context to Gemini. It does not read uploaded file contents, images, or scans. It is informational, not diagnostic or prescriptive; emergency advice is limited to directing users to local emergency services.
- Doctor recommendations use verified database doctors with actual open slots. Appointment booking always requires a patient action.
- Existing non-appointment dashboard workflows still use local demo state and must not be treated as production authentication or persistence.
- Medical file upload/storage, production rate limiting, live-database RLS verification, and end-to-end role/concurrency tests still require project configuration and deployment work. Do not use the demo data store for real patient information.
