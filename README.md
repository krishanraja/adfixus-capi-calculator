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

The visitor is a publisher revenue / sales leader who wants to sell better,
conversion-measured campaigns to their big advertisers. So the tool never asks for
their P&L revenue. It anchors on the one non-sensitive number they always know,
**what their biggest advertiser spends with them a year**, scales that to an
estimated book, derives everything technical internally, and reveals the
**incremental annual ad revenue** standing up their own CAPI could be worth, then
invites them to book a meeting. Nothing entered is stored; it stays in the browser.
**It never asks for a match rate, and never demands a revenue figure.**

> Part of the AdFixus tool family (with `adfixus-id-simulator` and `adfixus-sales`).
> All three share the same design system and started from one guided-flow shell;
> this tool has since customised that shell for its no-scroll iframe + result-dominant
> redesign (see HANDOVER). See **[HANDOVER.md](HANDOVER.md)**.

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

An Apple-grade guided flow: a provocation, then one effortless ask, then the
payoff. Smart defaults mean a visitor can reach the reveal with almost no input.
Each guided screen fits one viewport by LAYOUT - fluid, viewport-relative type and
spacing (the `.fluid-*` utilities) - so it stays full-size and never scrolls at any
window shape, rather than being uniformly transform-scaled (which looked tiny and
misaligned on short windows). The "full model" is a modal whose body scrolls only on
a genuinely short window.

1. **Provocation** (`src/components/flow/Provocation.tsx`): *"Walled gardens took
   about half of open-web ad revenue with one thing you do not have: your own
   Conversions API."*
2. **Ask, the advertiser anchor** (`src/components/flow/AdvertiserControl.tsx`):
   *"Picture your biggest advertiser. What do they spend with you a year?"* One
   slider (smart default about $1M, the Carsales flagship) plus a quiet
   **book-scale** choice (a handful / dozens / hundreds) that scales the anchor to
   an estimated book. It never asks for revenue; the estimate is refined later, and
   a privacy line makes clear nothing is stored.
3. **Reveal** (`src/components/flow/Reveal.tsx` + `src/components/bridge/*`): the
   hero number leads (total incremental annual ad revenue), a **three-lever
   substantiation strip**, one CTA, and a slim, supporting **Signal Bridge band**
   (real conversion events flowing back). Result-dominant, not visual-dominant.

Everything richer (the adjustable model, the three-year ramp, the three deal
models showing what you pay AdFixus vs keep NET, and the $30K-cap per-campaign
economics) lives behind the **"Explore the full model"** panel
(`src/components/flow/DepthDrawer.tsx` opening `src/components/depth/CommercialDepth.tsx`),
organised as three tabs (Breakdown / You pay vs keep / Per campaign) that each fit
one screen. It **reconciles to the same headline number**; nothing is invented,
nothing lost. The outcome you'd sell (the former "vertical"), the direct-sold /
performance share, and the estimated revenue are all adjustable there, so nothing
clutters the guided flow.

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

- **Revenue share**: 12.5% of CAPI incremental, with a **$30K per campaign
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
`initAdfixusEmbed({ appName: 'AdFixus-CAPI-Calculator' })`). Because every screen is
authored to fit one viewport, the embedded module stays a clean single screen. The
in-tool AdFixus wordmark is hidden (`FlowShell showWordmark={false}`) so it does not
duplicate the host page's own branding.

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
    flow/                       guided-flow shell (from the family baseline; diverged here for no-scroll iframe + result-dominant reveal)
      FlowShell.tsx             full-viewport shell + progress dots + motion (wordmark optional)
      Provocation.tsx           step 0
      AskStep.tsx               ask-step wrapper (holds one control)
      AdvertiserControl.tsx     the advertiser anchor: biggest-advertiser slider + book scale
      Reveal.tsx                result-dominant payoff (hero number, strip, CTA, band); AnimatedNumber
      DepthDrawer.tsx           "Explore the full model" panel (fixed height, tabbed, no-scroll)
    bridge/
      SignalBridge.tsx          the CAPI bridge visual; "full" hero + "band" (slim, supporting)
    depth/                      the full model, demoted into the panel (reconciles to headline)
      CommercialDepth.tsx       recap + CTA + three tabs (Breakdown / You pay vs keep / Per campaign)
      LeverBreakdown.tsx        the 3-lever decomposition (compact strip + full cards)
      LeverSliders.tsx          "Refine your estimate": outcome, revenue, direct-sold share + a Cautious/Balanced/Bold upside dial
      DealComparison.tsx        3 deal models: pay AdFixus vs keep NET
      CapCampaignTable.tsx      $30K per-campaign cap economics (hero row = your top advertiser)
      ThreeYearRamp.tsx         3-year ramp chart (compact variant for the tab)
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
