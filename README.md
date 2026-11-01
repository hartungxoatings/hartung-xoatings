# Hartung Xoatings — Next.js starter

Public website + private CRM foundation connected to the existing Supabase project.

## Setup

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and enter the Supabase **publishable** API key.
4. Run `npm run dev`.
5. Import the repository into Vercel, set the same two environment variables, and deploy.
6. Configure Supabase Auth Site URL and callback redirects for the deployed hostname.
7. Configure GoDaddy DNS according to Vercel's exact domain setup instructions.

## Important limitations

This is a **first working codebase**, not a launched or production-ready website. Project photography, branding, staff provisioning, CRM CRUD, secure quote submission, storage and email invitation/password setup remain to be implemented. Existing private CRM tables intentionally have no browser permissions until access policies are finalized. Do not put service-role/secret keys in frontend environment variables or GitHub.

Supabase project: `qyytnkttfhrvaovcmdlf`.
