# FieldOps 360

Next.js + Supabase. Deploy on Vercel.

1. Create a Supabase project, open SQL Editor, run `supabase/schema.sql`, then `schema_v2.sql`, then `schema_v3.sql`, then `schema_v4.sql`.
2. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key (Project Settings > API).
3. `npm install` then `npm run dev`.
4. Push to GitHub, import the repo in Vercel, add the same two environment variables, deploy.
5. Sign up, then promote your account to super_admin with the SQL at the bottom of `schema.sql`.

## More

- Architecture, security model and known limitations: see `ARCHITECTURE.md`.
- SQL files in `supabase/` must be run in order: `schema.sql`, then `schema_v2.sql` onwards (skip `schema_v9.sql`).
- Demo data: `supabase/seed_demo.sql`, then `supabase/demo_accounts.sql` (instructions inside).
- Optional AI assistant: add `ANTHROPIC_API_KEY` as a secret environment variable in Vercel.
