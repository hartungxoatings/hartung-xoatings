# Hartung Xoatings maintenance

- Preserve the existing Next.js App Router, Vercel deployment, and Supabase integration unless the user requests a migration.
- Use the repository as the source of truth. Inspect the current branch and changes before editing; never overwrite another contributor's work.
- Run `npm ci`, then `npm run check` for code changes. Commit `package-lock.json` with dependency changes. Use Node.js 22 or 24.
- The repository is public. Never commit or print credentials, session cookies, private CRM records, exports, logs, or database dumps. Use synthetic records in tests.
- Copy `.env.example` only for local configuration. Real values belong in ignored `.env.local` and Vercel settings. Browser code may use the Supabase publishable key only; never use a service-role or secret key there.
- Check staff membership on the server for every future private page, route handler, and server action. Do not rely on middleware, layouts, hidden links, or user-editable metadata as the sole authorization check.
- Preserve RLS. Inspect policies before changing database permissions, and test unauthorized access as well as staff access. Record schema changes as migrations; do not commit production data.
- Query public project content with `supabasePublic()` so public pages never inherit a staff session.
- Do not log authentication callback URLs, raw auth errors, tokens, or CRM payloads.
- Use focused commits. Verify the remote branch head before pushing. A push to `main` triggers the existing Vercel deployment; check its result before describing changes as live.
- Keep the README's remaining-work section accurate. Do not describe placeholder CRM cards as working management interfaces.
