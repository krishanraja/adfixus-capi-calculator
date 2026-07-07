# Security: adfixus-capi-calculator (Publisher CAPI ROI tool)

## Overview

This is a **public, 100% client-side** lead magnet. All calculations run in the
browser (`src/lib/capiRoi.ts` + `src/lib/capiCommercial.ts` + the shared
`src/utils` cap economics); no data is sent to a backend. There is **no login, no
database, and no API keys / secrets**.

## Security model

- **No backend:** all math runs client-side, so there is no server-side attack
  surface and no secrets to leak.
- **No secrets:** the app requires none. The only environment variable is
  `VITE_MEETING_BOOKING_URL` (a public booking link), safe to expose. `VITE_*`
  values are baked into the client and must only ever hold public information,
  never a credential.
- **No lead capture, no PII, no PDF:** the guided flow has no form, no lead store,
  and no file generation. Its single CTA opens the booking link in a new tab. If you
  later route leads to a CRM/ESP, add an adapter and keep any credentials
  **server-side** (never in a `VITE_` var).
- **XSS:** React's default escaping; all user input is numeric sliders and
  segmented button choices (a book-scale choice in the entry step, plus an
  outcome/vertical choice and further sliders in the explore panel). There is no
  free-text input.
- **Note:** because inputs and math are client-side, results are estimates and can
  be altered by the user; treat them as illustrative, not authoritative quotes.

## Deployment

- Serve over **HTTPS** (Vercel/Netlify/S3+CDN all do this by default).
- Add the SPA rewrite `/* -> /index.html`.
- Embedding is via `postMessage` height-reporting (parent origin
  `https://www.adfixus.com`); no cross-origin data is read from the parent.

## Maintenance

- Run `npm audit` periodically; keep React and dependencies patched.
- No PII or payment data is stored persistently, so there is no breach protocol
  beyond keeping the static host and its TLS current.
