# Dexi Room

QR-enabled furniture room planner prototype for physical furniture stores (Turkish market).

## Cursor Cloud specific instructions

### Architecture

This is a **zero-dependency static web application** — pure HTML, CSS, and vanilla JavaScript. There is no `package.json`, no build step, no bundler, no Node.js backend. All logic runs client-side in the browser.

### Running the app

Serve the project root with any static HTTP server:

```bash
python3 -m http.server 8000
```

Then visit:
- Customer room planner: `http://localhost:8000/index.html`
- Admin panel: `http://localhost:8000/admin.html`

### Admin panel credentials (demo)

- Username: `admin`
- Password: `dexi123`

### Testing

There are no automated tests (unit, integration, or e2e) in this codebase. Validation is done manually via the browser:

1. Load `index.html`, click "Ornek yerlesimi yukle" to load demo data.
2. Drag furniture items on the room plan canvas; verify green/red collision indicators.
3. Log in to `admin.html` with demo credentials and verify store/catalog management.

### Data persistence

- Primary: `localStorage` (works offline, no setup required).
- Optional: Supabase (cloud PostgreSQL + REST). Config in `supabase-config.js`. If Supabase is unreachable, the app gracefully falls back to localStorage with built-in demo data.

### Key files

| File | Purpose |
|------|---------|
| `index.html` | Customer-facing room planner UI |
| `script.js` | QR flow, drag-and-drop, collision detection |
| `admin.html` | Admin panel UI |
| `admin.js` | Admin login, catalog upload, device management |
| `data-store.js` | Shared data layer (localStorage + optional Supabase) |
| `styles.css` | Customer app styles |
| `admin.css` | Admin panel styles |
| `supabase-config.js` | Supabase connection config |
| `supabase-schema.sql` | Database schema for Supabase pilot |
