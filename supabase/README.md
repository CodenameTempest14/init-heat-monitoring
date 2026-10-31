# supabase/

The backend (D-002): Postgres database on Supabase. Design: `documentation/specs/SCHEMA.md`.

- `config.toml` is made by `supabase init`; only used for a local database, which we don't run (no Docker).
- `migrations/` holds the database changes, applied in order.

Two projects: `init-test` (tests run here and may wipe data) and `init` (live). Keys live in `.env` (see `.env.example`).
Always go through `tools/db.mjs`, which names the target and passes only that project's secrets:

```
node --env-file=.env tools/db.mjs test db push   # apply new migrations to init-test
npm run test:backend                             # check them from outside
node --env-file=.env tools/db.mjs live db push   # live: ask the owner first
```
