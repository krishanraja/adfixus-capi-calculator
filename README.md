# AdFixus CAPI: What Your Own Conversions API Is Worth

A public, embeddable **lead magnet** for AdFixus. It makes one idea land in under a
minute for an open-web publisher (think Carsales, Chegg):

> Walled gardens took about half of open-web ad revenue with one thing you do not
> have: **your own Conversions API.**

Facebook and Google sell a 100%-accurate outcomes product because advertisers send
conversions straight back to them. AdFixus gives a publisher the durable,
privacy-safe **identity backbone** to run the same server-to-server CAPI itself, so
it can win outcome budgets back, charge a CPM premium on enriched inventory, and
keep advertisers who stay because measurement finally works.

The tool asks only what a publisher actually knows (annual open-web ad revenue,
vertical, and, in the drawer, the direct-sold / performance share of sales),
derives everything technical internally, and reveals the **incremental annual ad
revenue** standing up their own CAPI could be worth, then invites them to book a
meeting. **It never asks for a match rate.**

> Part of the AdFixus tool family (with `adfixus-id-simulator` and `adfixus-sales`).
> All three share the same guided-flow shell and design system. See
> **[HANDOVER.md](HANDOVER.md)**.

## What CAPI actually is

A Conversions API (CAPI) is a server-to-server channel: advertisers send their
conversion events (purchases, sign-ups, test-drive bookings) directly to the
publisher, rather than relying on browser cookies and pixels that Safari/ITP and
cookie blocking have broken. AdFixus gives the publisher a durable, accurate,
privacy-safe **identity backbone** so it can run its own CAPI, match those events
back to real people, and restore the measurement the open web lost. With that
signal restored, the publisher can sell a 100%-accurate **outcomes product**, the
same thing the walled gardens sell, instead of leaking those outcome budgets to
Facebook and Google.

## The guided flow (what a visitor sees)

An Apple-grade guided flow: a provocation, then two effortless questions, then the
payoff. Smart defaults mean a visitor can reach the reveal with almost no input.

1. **Provocation** (`src/components/flow/Provocation.tsx`): *"Walled gardens took
   about half of open-web ad revenue with one thing you do not have: your own
   Conversions API."*
2. **Ask, revenue** (`src/components/flow/RevenueControl.tsx`): one slider, roughly
   how much open-web ad revenue do you make a year? (smart default about $20M; a
   quiet *traffic + CPM* alternative derives it for publishers who think in
   impressions).
3. **Ask, vertical** (`src/components/flow/VerticalControl.tsx`): a segmented choice
   (auto / education / retail / finance / travel / other) that sets the conversion
   framing and the default direct-sold / performance share.
4. **Reveal** (`src/components/flow/Reveal.tsx` + `src/components/bridge/*`): the
   animated **Signal Bridge** (real conversion events flowing back from the
   advertiser as measurable outcomes), one hero number (total incremental annual ad
   revenue), the **three-lever breakdown**, a Carsales benchmark line, and one CTA.

Everything richer (the adjustable levers, the three-year ramp, the three deal
models showing what you pay AdFixus vs keep NET, and the $30K-cap per-campaign
economics) lives behind the **"See the full model"** drawer
(`src/components/flow/DepthDrawer.tsx` opening `src/components/depth/CommercialDepth.tsx`).
It **reconciles to the same headline number**; nothing is invented, nothing lost.
The direct-sold / performance share is a slider in the drawer, so it is adjustable
without cluttering the guided flow.

## The model (every number traces to an input or a named assumption)

`src/lib/capiRoi.ts` (`calculateCapiRoi`): three non-overlapping levers on
publisher-knowable inputs. The publisher never supplies a match rate, campaign
count, or addressability; those are derived here, never asked.

```
addressable      = annualAdRevenue x performanceShare      (direct-sold / performance book)

Lever A win-back = addressable x winBackRate               (0.22; Carsales CAPI track +22%)
Lever B CPM      = (annualAdRevenue x enrichedShare) x cpmUplift   (0.35 x 0.15; deck +15% CPM)
Lever C retention= addressable x retentionValue            (0.08; from +40% campaign retention)

totalIncremental = A + B + C          <- the headline
```

Default assumption rates (`DEFAULT_ASSUMPTIONS` in `src/lib/capiRoi.ts`):

| Rate | Default | Grounding |
|------|---------|-----------|
| `winBackRate` | 0.22 | Carsales + AdFixus opened a CAPI track worth about $60M, +22% |
| `enrichedShare` | 0.35 | share of total revenue delivered on CAPI-enriched / lookalike inventory |
| `cpmUplift` | 0.15 | deck: +15% CPM on enriched inventory |
| `retentionValue` | 0.08 | derived conservatively from the deck's +40% campaign retention |

Per-vertical default performance share (`VERTICALS` in `src/lib/capiRoi.ts`): auto
0.50, education 0.45, retail 0.50, finance 0.45, travel 0.45, other 0.40. Picking a
vertical also sets the conversion framing (e.g. auto = "test-drive bookings and
enquiries").

Levers are deliberately non-overlapping: A prices **budget** on the addressable
book, B prices an **inventory** premium on a different slice (all inventory, not
just the addressable book), and C prices the **durability** of the book over time.
All rates are adjustable sliders in the drawer, so every figure on the surface
traces to an input or a named, adjustable assumption.

`src/lib/capiCommercial.ts` (`priceCapiRoi`) takes that same `totalIncremental` and
prices it three ways so a publisher sees what they pay AdFixus vs keep NET:

- **Revenue share (capped)**: 12.5% of CAPI incremental, with a **$30K per campaign
  per month cap** (the "magic of the cap" for large advertisers). Recommended.
- **Annual cap**: 12.5% up to a $1.2M annual cap, then 100% to the publisher.
- **Flat fee**: a fixed $1M annual fee regardless of performance.

The campaign shape (avg spend + count) that feeds the $30K-cap table is **derived
from `addressable`** (`deriveCampaignShape`), so the cap table reconciles to the
same inputs. The cap math reuses `src/utils/campaignEconomicsCalculator.ts` (ported
from the Vox engine) with the constants in `src/types/campaignEconomics.ts` (12.5%
revenue share, $30K cap, 40% conversion improvement, $600K cap threshold).

### Sample reconciliation ($20M revenue, auto, 40% performance share)

```
addressable = $20M x 0.40                 = $8.0M
A win-back  = $8.0M x 0.22                 = $1.76M
B CPM       = ($20M x 0.35) x 0.15         = $1.05M
C retention = $8.0M x 0.08                 = $0.64M
totalIncremental                          = $3.45M / yr
revenue-share fee about $0.43M, publisher keeps about $3.02M (88%)
3-year ramp (0.55 / 1.0 / 1.2)            about $9.5M cumulative
```

(The auto vertical defaults to a 50% performance share, which reveals about $4.05M;
this worked example uses the 40% the docs quote to keep the arithmetic legible.)

## Architecture (guided UI to hook to model)

```
guided flow UI       src/components/flow/*  + bridge/*      (the guided surface)
        |
        v
useCapiRoi()         src/hooks/useCapiRoi.ts                (inputs + assumptions -> model)
        |
        |- calculateCapiRoi()   src/lib/capiRoi.ts          (the 3-lever headline)
        |- priceCapiRoi()       src/lib/capiCommercial.ts    (headline -> 3 deal models)
                                    |- $30K-cap economics    src/utils/campaignEconomicsCalculator.ts
```

The reveal and the drawer read the **same `useCapiRoi` state**, so they always
reconcile. There is no second, unrelated number anywhere on the surface.

## Run it

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # -> dist/  (static SPA)
npm run preview
npm run lint
```

No environment setup is required. The only optional variable is
`VITE_MEETING_BOOKING_URL` (the "Book a meeting" link); see `.env.example`. A
built-in fallback URL is used if it is unset.

## Deploy on Vercel (public)

Static SPA. On Vercel, framework preset **Vite** (output `dist/`); add the SPA
rewrite `/* -> /index.html`. Set `VITE_MEETING_BOOKING_URL` to override the booking
link. This tool is **public**, no auth.

## Embed it in adfixus.com

The app reports its height to the parent page so it iframes cleanly with no inner
scrollbar (`src/core/embed/embed.ts`, called from `src/main.tsx` as
`initAdfixusEmbed({ appName: 'AdFixus-CAPI-Calculator' })`).

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
different `parentOrigin` to `initAdfixusEmbed` to embed elsewhere. Child-to-parent
message shape: `{ type: 'setHeight', height, source, trigger }`. The parent may
send `{ type: 'requestHeight' }` or `{ type: 'ping' }` (answered with `pong`).

## Key facts

- **100% client-side.** No backend, no login, no API keys, no secrets, no database.
  Nothing is transmitted; there is no lead form and no PII.
- **One env var** (`VITE_MEETING_BOOKING_URL`, a public link). See `.env.example`.
  Never put a secret in a `VITE_*` variable; those are baked into the client.
- **Canonical dark + bright-cyan brand**, shared with the other two tools.

## File map

```
src/
  main.tsx                      entry; boots the app + initAdfixusEmbed
  App.tsx                       router (single "/" route + 404)
  pages/Index.tsx               <SalesPlanApp/> + SEO/OG tags
  components/
    SalesPlanApp.tsx            the guided flow (the whole visible surface)
    flow/                       shared guided-flow shell (identical across tools)
      FlowShell.tsx             full-viewport shell + progress dots + motion
      Provocation.tsx           step 0
      AskStep.tsx               ask-step wrapper (holds one control)
      RevenueControl.tsx        annual ad revenue slider (+ traffic/CPM alternative)
      VerticalControl.tsx       segmented vertical choice
      Reveal.tsx                the payoff (visual + hero number + CTA); AnimatedNumber
      DepthDrawer.tsx           "See the full model" drawer
    bridge/
      SignalBridge.tsx          the animated CAPI bridge visual (real events flowing back)
    depth/                      the full model, demoted into the drawer (reconciles to headline)
      CommercialDepth.tsx       composes the whole deep model
      LeverBreakdown.tsx        the 3-lever decomposition (compact + full)
      LeverSliders.tsx          all lever assumptions + performance share, adjustable
      DealComparison.tsx        3 deal models: pay AdFixus vs keep NET
      CapCampaignTable.tsx      $30K per-campaign cap economics (derived from addressable)
      ThreeYearRamp.tsx         3-year ramp chart
  hooks/
    useCapiRoi.ts               inputs + assumptions -> the whole model (single source)
    use-toast.ts                toast state
  lib/
    capiRoi.ts                  the 3-lever ROI model (the headline)
    capiCommercial.ts           prices the headline against the 3 deal models
    utils.ts                    cn() classname helper
  core/
    embed/embed.ts              iframe height-reporting module (shared)
    ...                         shared engine (retained for the tool family; not on the CAPI path)
  types/
    campaignEconomics.ts        $30K-cap constants + campaign economics types
  utils/
    campaignEconomicsCalculator.ts   per-campaign ($30K-cap) economics (ported from Vox)
  index.css                     canonical dark-cyan design tokens (identical across tools)
```

## Tech stack

React 18, TypeScript, Vite 5, Tailwind 3, shadcn/ui (Radix), framer-motion,
Recharts, React Router.
