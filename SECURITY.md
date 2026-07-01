# Security — adfixus-capi-calculator (The CAPI Data Bridge)

## Overview

This is a **public, 100% client-side** lead magnet. All calculations run in the
browser (`src/core` engine + `src/utils` sales-plan/commercial math); no data is
sent to a backend. There is **no login, no database, and no API keys / secrets**.

## Security model

- **No backend:** all math and PDF generation happen client-side — no server-side
  attack surface, no secrets to leak.
- **No secrets:** the app requires none. The only environment variable is
  `VITE_MEETING_BOOKING_URL` (a public booking link), safe to expose. `VITE_*`
  values are baked into the client and must only ever hold public information —
  never a credential.
- **No lead capture, no PII:** the guided flow has no form and no lead store. Its
  single CTA opens the booking link in a new tab. If you later route leads to a
  CRM/ESP, add an adapter and keep any credentials **server-side** (never in a
  `VITE_` var).
- **XSS:** React's default escaping; the only user input is a numeric slider.
- **Note:** because inputs and math are client-side, results are estimates and can
  be altered by the user — treat them as illustrative, not authoritative quotes.

## Deployment

- Serve over **HTTPS** (Vercel/Netlify/S3+CDN all do this by default).
- Add the SPA rewrite `/* → /index.html`.
- Embedding is via `postMessage` height-reporting (parent origin
  `https://www.adfixus.com`); no cross-origin data is read from the parent.

## Maintenance

- Run `npm audit` periodically; keep React and dependencies patched.
- No PII or payment data is stored persistently, so there is no breach protocol
  beyond keeping the static host and its TLS current.
