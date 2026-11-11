# HOSAI UI/UX Audit

## Major issues

- Patient and doctor dashboards repeat account identity and clinical summary data already available in the profile menu or Medical Passport.
- The patient overview duplicates records and counts that belong in the Passport, while secondary actions compete with pending consent requests and safety alerts.
- Doctor identity, credentials, and aggregate counts take space above the primary patient search and authorized roster.
- The header exposes full identity details continuously and turns mobile navigation into a horizontal scrolling strip.
- Administrator navigation is duplicated between the header and dashboard; data tables are too wide for small screens.
- Dense discovery cards, long copy, and modal forms use desktop-oriented spacing and can overflow at narrow widths.

## Proposed improvements

- Keep the header to role-relevant navigation, a compact AI action where relevant, and an initials based profile menu with account details inside.
- Keep the patient overview focused on urgent alerts, consent requests, the latest consultation, and a few next actions. Keep the full record in the Passport.
- Put doctor search and the authorized roster first; move professional details to the profile menu and keep verification status visible.
- Keep administrator tools in one place and make wide tables scroll within their own region on mobile.
- Standardize responsive spacing, visible focus, labeled controls, touch targets, and bounded modal scrolling without changing access or data behavior.

## Design guidance checked

- Existing project uses Tailwind CSS and Lucide, but has no `components.json` or shadcn components; no competing UI package is needed for this pass.
- Applied shadcn composition and accessibility guidance, Vercel Web Interface Guidelines, and Impeccable's advice to reduce repeated widgets and prioritize the user's task.
- Vercel's `web-design-guidelines` and Impeccable can be installed with `npx skills`; they are not installed in this environment.
