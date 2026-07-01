# Handover — adfixus-capi-calculator

## The AdFixus tool family (read this first)

You are taking over **three** related tools that share one brand, one design
system, and one calculation engine:

| Repo | What it is |
|------|------------|
| **adfixus-id-simulator** | Public lead magnet — measures **ID durability** benefits |
| **adfixus-capi-calculator** (this repo) | Public lead magnet — measures **CAPI (Conversions API)** benefits on top of the ID |
| **adfixus-sales** | Internal tool — pulls intelligence on a target business to fuel a **proposal** |

A fourth repo, **vox-adfixus**, has been **retired**. It modelled one specific
customer (Vox Media) and became the most mathematically robust of the set; its
engine and assumptions were **generalized into the shared core** (`src/core/`)
now present in all three repos, with the Vox-specific data removed. See
**[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** for the full spec.

## What this repo is for

A publisher enters a few business metrics and sees the incremental revenue from
running CAPI campaigns on a durable ID — match-rate lift (30% → 75%), conversion
uplift, and net campaign benefit — with a downloadable PDF. It is designed to be
**iframed into adfixus.com** as a lead magnet.

## How it contributes to the business

- Demand gen for the CAPI/Stream product line specifically — a natural
  second-touch after the ID durability story.
- Uses the same underlying assumptions as the internal sales tool, so the CAPI
  numbers a prospect sees are consistent with what the sales team will quote.

## What changed in this consolidation

- **Re-skinned** from the old light/teal theme to the **canonical dark +
  bright-cyan** design system (identical tokens across the three tools). The PDF
  generator was re-skinned to match.
- **All Supabase + backend removed** — 100% client-side; nothing breaks when the
  old Supabase projects are shut down. PDF is client-side; contacts persist to
  `localStorage["adfixus_leads"]` via a pluggable `leadAdapter`.
- **Vendored the shared engine** (`src/core/`) and the shared **embed module**.

## What you need to do next

1. **Run it:** `npm install && npm run dev` (port 8080). No env needed.
2. **Verify the math:** run the golden-values self-check (command in the README).
3. **Deploy:** static SPA — `npm run build` → host `dist/`; add `/* → /index.html`.
4. **Embed on adfixus.com:** use the iframe + `message` snippet from the spec (§5).
5. **Recommended follow-up (engineering):** this tool's CAPI math currently uses
   its original per-format model (`src/lib/roiCalculations.ts`). The canonical
   engine exposes `calculateCapiBenefits()` from `@/core/engine` (match-rate /
   campaign-economics model, consistent with the sales tool). Migrating the
   results onto it — reading `.capiCapabilities` from the result — unifies the
   CAPI numbers brand-wide. Entry point + golden test are already in place.

## Ideas for development

- Show the ID-durability + CAPI stories together (the engine already computes
  both under scope `id-capi`), with a "see the full picture" CTA.
- Shareable permalinks; light analytics; A/B-tested framing.
- Promote `src/core/` to a shared private npm package across the three repos.

## What's disconnected (and how to bring it back)

| Was | Now | To restore |
|-----|-----|-----------|
| Supabase edge function `send-pdf-email` (Resend) | Client-side PDF download | Implement an `emailProvider`/`LeadAdapter` against your own service |
| Supabase lead storage | `localStorage["adfixus_leads"]` | Implement `LeadAdapter` |

No secrets or external calls remain in the codebase.
