# AGENT.md — afi-online-sales-crm

## Purpose
A web-based CRM for Advanced Food Industries (AFI) to manage customers, orders, and leads. Built on Google Apps Script with a modern tabbed UI.

## Structure
```
afi-online-sales-crm/
├── README.md
├── AGENT.md
├── .gitignore
└── src/
    ├── env.js          ← Sheet IDs / config
    ├── Backend.js      ← data access layer (Sheets read/write)
    ├── Helpers.js      ← pure utility functions
    ├── Middleware.js   ← server-side routing / validation
    ├── Server.js       ← doGet() / doPost() entry points
    └── index.html      ← SPA shell (Orders, Customers, Leads tabs)
```

## Key Facts
- **Platform:** Google Apps Script WebApp
- **Data store:** Google Sheets (IDs in `env.js`)
- **Sections:** Orders (with status filtering), Customers (grid + search), Leads
- **Entry point:** `Server.js` → `doGet()` / `doPost()`
- **No `appsscript.json` in repo** — deploy via Apps Script editor or clasp separately

## Development Notes
- All source files live under `src/` — push with clasp from that directory
- No Node/npm at runtime; ES5-compatible GAS code only
- Sheet IDs and secrets live in `env.js` (not committed with real values)
