# AdFixus CAPI Sales-Plan Simulator

A public, embeddable **lead magnet** that turns a publisher's inputs into a
concrete **CAPI (Conversions API) sales plan**: a POC-to-scale **campaign ramp**,
the **$30K-per-campaign-cap economics**, and a side-by-side comparison of three
**commercial deal models** — revenue-share, annual-cap, and flat-fee. It runs on
the shared `src/core` engine (`scope: 'id-capi'`), so the CAPI numbers a prospect
sees are consistent with what the internal sales team will quote.

Part of the AdFixus tool family (with `adfixus-id-simulator` and `adfixus-sales`).
All three share one design system and one calculation engine — see
**[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** and **[HANDOVER.md](HANDOVER.md)**.

## Who it's for & how it contributes

- **For publishers** evaluating CAPI on a durable AdFixus ID (public, self-serve).
- **Contributes to AdFixus** as the natural second touch after the ID durability
  story — it makes the CAPI commercial model concrete (ramp, cap, deal models) and
  captures a lead, using the same assumptions the sales team quotes.

## Run it

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # → dist/  (static SPA)
npm run preview
```

No environment setup is required to run it. Optional: `VITE_MEETING_BOOKING_URL`
(the "book a meeting" link) and `VITE_COMPANY_NAME`. See `.env.example`.

## Key facts

- **100% client-side.** No backend, no login, no API keys, no secrets. PDF is
  generated in the browser; captured contacts are stored in `localStorage`
  (`adfixus_leads`) via a pluggable adapter you can point at a CRM later.
- **Math lives in `src/core`** — the shared, verified engine. The UI hook
  `src/hooks/useSalesPlan.ts` calls `calculateCapiBenefits(...)` (scope `id-capi`)
  and reads `results.capiCapabilities`; campaign ramp and the deal-model economics
  live in `src/utils/campaignEconomicsCalculator.ts` +
  `src/utils/commercialCalculations.ts`. Run the self-check
  (`npx esbuild src/core/selfcheck.ts --bundle --platform=node --format=cjs --outfile=/tmp/afx.cjs && node /tmp/afx.cjs`)
  to confirm the golden values.
- **Deal models:** 12.5% share applies to **CAPI incremental revenue only**, with a
  **$30K/campaign monthly cap**. Three models are compared — revenue-share
  (recommended, fully aligned), annual-cap, and flat-fee.
- **Canonical dark + bright-cyan brand**, shared with the other two tools.

## Deploy on Vercel

Static SPA — deploy on Vercel (or any static host):

```bash
npm run build    # → dist/
```

On Vercel, framework preset **Vite** (output `dist/`); add the SPA rewrite
`/* → /index.html`. No environment variables are required (set
`VITE_MEETING_BOOKING_URL` / `VITE_COMPANY_NAME` if you want to customise). This
tool is **public** — no auth.

## Embed it in adfixus.com

The app reports its height to the parent page so it iframes cleanly with no inner
scrollbar (`src/core/embed/embed.ts`, called from `src/main.tsx`).

```html
<iframe id="afx" src="https://YOUR-HOST/" style="width:100%;border:0;" scrolling="no"></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://YOUR-HOST') return;
    if (e.data?.type === 'setHeight') {
      document.getElementById('afx').style.height = e.data.height + 'px';
    }
  });
</script>
```

The embed validates parent origin `https://www.adfixus.com` by default; pass a
different `parentOrigin` to `initAdfixusEmbed` to embed elsewhere. Full protocol in
**[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md) §5**.

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind 3 · shadcn/ui (Radix) · Recharts ·
pdfmake · React Router.
