# AdFixus CAPI Calculator

A public, embeddable **lead magnet** that shows a publisher the revenue impact of
running **CAPI (Conversions API)** campaigns on top of a durable AdFixus ID —
better match rates, higher conversion tracking, and incremental campaign revenue.

Part of the AdFixus tool family (with `adfixus-id-simulator` and `adfixus-sales`).
All three share one design system and one calculation engine — see
**[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** and **[HANDOVER.md](HANDOVER.md)**.

## Run it

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # → dist/  (static, deploy anywhere)
npm run preview
```

No environment setup is required to run it. Optional: `VITE_MEETING_BOOKING_URL`
(the "book a meeting" link) and `VITE_COMPANY_NAME`. See `.env.example`.

## Key facts

- **100% client-side.** No backend, no Supabase, no login, no API keys. PDF is
  generated in the browser; captured contacts are stored in `localStorage`
  (`adfixus_leads`) via a pluggable adapter you can point at a CRM later.
- **Embeddable.** Iframes cleanly into adfixus.com via `src/core/embed/embed.ts`.
- **Canonical dark + bright-cyan brand**, shared with the other two tools.
- **Math lives in `src/core/`** — the shared, verified AdFixus engine (run the
  self-check command from the spec to confirm the golden values).

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind 3 · shadcn/ui (Radix) · Recharts ·
pdfmake · React Router.
