# HOSAI

HOSAI is a healthcare management interface for organizing patient medical information and supporting patient, doctor, and administrator workflows. It addresses fragmented access to medical records by grouping profile details, conditions, allergies, medications, reports, consultations, and care relationships in one application.

## Current capabilities

The following are demo UI and local-state workflows, not integrated production services.

- Patient, doctor, and administrator views.
- Patient profile, condition, allergy, medication, and report workflows.
- Doctor directory, patient username search, consent request UI, patient chart, consultations, and prescriptions.
- Administrator doctor verification UI and hospital directory management.
- AI assistant interface with educational safety messaging.
- PostgreSQL schema and RLS policy definitions in `supabase/schema.sql`.

## Roles

- **Patients** manage a medical profile and records, review consultations, discover care providers, and respond to doctor access requests.
- **Doctors** maintain professional details, search for patients, and use the chart and consultation interface.
- **Administrators** review doctor verification and manage healthcare facilities. The intended design does not give administrators unrestricted access to private patient records.

## Technology

Next.js App Router, React, TypeScript, Tailwind CSS v4, Lucide React, Sonner, and Supabase client libraries. The current application UI is backed by a client-side demo store in `lib/store.ts`; Supabase authentication and database access are not wired into the UI yet. The AI assistant currently uses local canned responses and is not connected to a model.

## Architecture and structure

- `app/` — application route, layout, and global styles.
- `components/` — role dashboards, authentication, discovery, medical record forms, and assistant UI.
- `lib/store.ts` — current in-memory/localStorage demo state and UI actions.
- `lib/supabase.ts` — optional Supabase browser client initialization.
- `types/database.ts` — application data types.
- `supabase/schema.sql` — database schema and RLS policy definitions; these are not automatically applied.

## Local setup

Requirements: Node.js compatible with the installed Next.js version and npm.

```bash
npm install
npm run dev
```

Create `.env.local` with these placeholders only if connecting a Supabase project:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Do not put a Supabase service role key in a `NEXT_PUBLIC_*` variable or browser code. The current UI falls back to its demo store when Supabase values are absent; this fallback is for development only and is not suitable for real patient data.

## Supabase setup

Create a Supabase project, configure authentication, and review `supabase/schema.sql` before applying it to a development database. The current frontend does not use Supabase sessions or database queries, and its demo data is stored in the browser. Do not use this build for real patient information. Production use requires integrating server-verified authentication and authorization, validating RLS against a live database, and securing medical file storage and AI context retrieval.

## Commands

```bash
npm run dev       # local development
npm run lint      # ESLint
npx tsc --noEmit  # TypeScript check
npm run build     # production build
npm start         # serve a production build
```

No automated test script is currently defined in `package.json`.

## Security and limitations

- The current local demo store is not an authentication or authorization boundary. Client state and localStorage can be modified by the user.
- Demo identities and fictional medical content are embedded in client code.
- Supabase RLS in the SQL file is a policy definition only; it does not protect the local demo store and has not been validated against a configured project here.
- The AI assistant is not a clinical decision system and currently returns canned client-side responses.
- Report upload UI is not a production secure-storage integration.
- Do not enter real patient data or deploy this prototype as a production healthcare service.
