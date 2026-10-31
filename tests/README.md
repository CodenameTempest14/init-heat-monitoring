# tests/

Run with `node --test` from the repository root (no install needed).

- `backend/` holds the online Supabase tests: `npm run test:backend` (see its README).
- `heat-index.test.js` tests `src/heat-index.js`.
- `heat-index-reference.json` is the shared table of expected values. The C++ port (P03) must pass the same table (D-015).
