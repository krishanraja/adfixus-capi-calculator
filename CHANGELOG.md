# Changelog

All notable changes to **adfixus-capi-calculator**, the public AdFixus lead magnet
for **the CAPI data bridge**.

> **Current architecture (authoritative):** a 100% client-side React SPA with an
> Apple-grade guided flow (provocation → annual-ad-revenue slider → vertical →
> reveal → depth drawer). The headline is a self-contained **3-lever CAPI ROI
> model** in `src/lib/capiRoi.ts` (win-back + CPM uplift + retention on
> publisher-knowable inputs); `src/lib/capiCommercial.ts` prices that same total
> against three deal models (revenue-share with a $30K/campaign/month cap / annual
> cap / flat fee), reusing the $30K-cap economics in
> `src/utils/campaignEconomicsCalculator.ts`. Everything reads from one hook
> (`src/hooks/useCapiRoi.ts`), so headline and drawer always reconcile. Iframe-
> embeddable into adfixus.com. **No backend, no login, no lead form, no secrets.**
> Older entries below predate the current build.

---

## [5.0.0] - Publisher-knowable CAPI ROI model (current)

### Changed
- **Rebuilt the model around inputs a publisher actually knows.** Removed the
  "match rate" input (no publisher knows their match rate) and the meaningless
  hero number. The surface now asks only annual open-web ad revenue and vertical;
  everything technical (addressability, campaign shape) is derived internally.
- **New headline model** `src/lib/capiRoi.ts` — three non-overlapping levers:
  A win-back (addressable x 0.22, Carsales +22%), B higher CPM (enrichedShare 0.35
  x cpmUplift 0.15, deck +15%), C retention (addressable x 0.08, from +40%
  retention). The hero reveal is their sum, with a live three-lever breakdown.
- **New commercial pricing** `src/lib/capiCommercial.ts` — prices the same
  totalIncremental against revenue-share (12.5%, $30K/campaign/month cap), annual
  cap, and flat fee, so the drawer decomposes/prices the headline rather than
  showing a second number. Campaign shape derived from addressable.
- **Rewrote the signal-bridge copy and visual** to be concrete (real conversion
  events flowing back to the advertiser). Removed the fabricated "conversions seen
  77%" meter and every number not derived from inputs.

### Removed
- The old match-rate surface: `useSalesPlan`, `salesplan/*`, `commercial/*`,
  `bridge/BridgeHero` + `bridge/SignalCoverage`, `flow/MatchRateControl`, the PDF
  generator, `commercialCalculations.ts`, `types/commercialModel.ts`, and the
  now-unused `formatting.ts`.

---

## [4.0.0] - Production cleanup

### Removed
- **Dead code:** the unused `Navigation.tsx`, `src/App.css`, `use-mobile`, the
  unused `leadAdapter` (the guided flow captures no leads), ~30 unreferenced
  shadcn/ui primitives, a stray Lovable image and `placeholder.svg`, and the
  leftover `bun.lockb` (the repo uses npm).
- **Unused dependencies:** `@hookform/resolvers`, `react-hook-form`, `zod`,
  `@tailwindcss/typography`, and the `@radix-ui/*` packages backing the deleted UI
  primitives (38 packages pruned).

### Changed
- Rewrote `README.md`, `HANDOVER.md`, `docs/ADFIXUS_CORE_SPEC.md`, and corrected
  `SECURITY.md` to the data-bridge + guided-flow reality (no lead form, one env
  var).
- Fixed lint: ESM import for the Tailwind plugin (was `require()`); removed dead
  `eslint-disable` directives. `npm run build` and `npm run lint` are clean
  (only expected vendored-shadcn / FlowShell react-refresh warnings remain).
- Untracked `.env` (`git rm --cached`); gitignored `.env`, `.env.local`, `.vercel`.

## [3.1.0] - The CAPI data bridge + guided flow

### Reframed
- Reframed the product as **the publisher↔advertiser data bridge**: restore the
  conversion signal first (the animated `SignalBridge` reveal leads), with the
  full sales plan / economics / deal models demoted behind a depth drawer.
- Wrapped everything in the shared Apple-grade guided-flow shell
  (`src/components/flow/*`).

## [3.0.0] - CAPI simulator on the shared core

### Rebuilt
- Rebuilt as a **publisher sales-plan simulator**: campaign ramp + $30K-cap
  economics + side-by-side commercial deal models (revenue-share / annual-cap /
  flat-fee), all driven by the shared `src/core` engine
  (`calculateCapiBenefits`, scope `id-capi`). Replaced the old per-format
  `roiCalculations.ts` with the verified engine.
- Re-skinned to the canonical **dark + bright-cyan** design system (PDF included)
  and added the shared **embed module** (`src/core/embed/embed.ts`).

### Docs
- Rewrote `README.md`, `HANDOVER.md`, `SECURITY.md`; synced
  `docs/ADFIXUS_CORE_SPEC.md`.

### Removed
- All Supabase / backend remnants — the tool is 100% client-side.

---

## [2.0.0] - Developer Handoff Release (historical)

### 🎯 Major Changes
- **Removed Supabase dependency**: Eliminated all backend dependencies for simplified deployment
- **Pure client-side architecture**: All functionality now runs entirely in the browser
- **Streamlined dependencies**: Removed unused packages to reduce bundle size and security surface

### ✨ New Features
- **Environment-based configuration**: Meeting booking URL now configurable via environment variables
- **Enhanced PDF generation**: Direct download without server-side processing
- **Simplified contact form**: Automatic PDF generation on form submission

### 🔧 Technical Improvements
- **Dependency cleanup**: Removed unused UI components and packages
- **Bundle optimization**: Reduced package count by ~40%
- **Static deployment ready**: No backend requirements for hosting

### 📦 Dependency Changes

#### Removed Packages
- `@supabase/supabase-js` - No longer needed for client-side only architecture
- `@tanstack/react-query` - Removed server state management
- `next-themes` - Simplified theming approach
- `input-otp` - Unused component
- `embla-carousel-react` - Unused carousel functionality
- `cmdk` - Unused command palette
- `vaul` - Unused drawer component
- `react-day-picker` - Unused date picker
- `date-fns` - No longer needed without date picker
- `react-resizable-panels` - Unused layout component

#### Retained Core Dependencies
- `react` + `react-dom` - Core framework
- `react-router-dom` - Client-side routing
- `pdfmake` - PDF generation
- `recharts` - Data visualization
- `tailwindcss` - Styling framework
- `@radix-ui/*` - UI primitives
- `lucide-react` - Icons
- `react-hook-form` + `zod` - Form handling

### 🗂 File Structure Changes

#### Removed Files/Directories
- `supabase/` - Entire Supabase configuration directory
- `src/integrations/supabase/` - Supabase client integration
- `.env` - Replaced with `.env.example`

#### New Files
- `.env.example` - Environment variable template
- `README.md` - Comprehensive setup and deployment guide
- `HANDOFF.md` - Developer onboarding documentation  
- `SECURITY.md` - Security considerations and best practices
- `CHANGELOG.md` - This changelog

#### Modified Files
- `src/hooks/useContactForm.ts` - Removed email sending, added direct PDF generation
- `src/App.tsx` - Removed React Query provider
- `src/components/ui/sonner.tsx` - Removed theme dependency
- `src/components/steps/ResultsStep.tsx` - Environment-based meeting URL

### 📝 Configuration Changes

#### Environment Variables
```bash
# Old (Supabase-based)
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...

# New (Static deployment)
VITE_MEETING_BOOKING_URL=https://outlook.office.com/book/...
VITE_COMPANY_NAME=AdFixus
```

### 🚀 Deployment Changes
- **Before**: Required Supabase backend + Resend email service
- **After**: Pure static site deployment (Netlify, Vercel, S3, etc.)

### 🔒 Security Improvements
- **Eliminated backend attack surface**: No server-side code to secure
- **Reduced dependency vulnerabilities**: 40% fewer packages to monitor
- **No secrets required**: All configuration is public environment variables
- **Client-side only**: No data transmission to external services

### 📊 Performance Improvements
- **Smaller bundle size**: Removed unused dependencies
- **Faster deployment**: No backend provisioning required
- **Global CDN ready**: Static assets can be served from any CDN
- **Instant scaling**: No server capacity considerations

### 🛠 Developer Experience
- **Simpler setup**: `npm install && npm run dev` - no backend configuration
- **Easier deployment**: Upload `dist/` folder to any static host
- **Comprehensive documentation**: Detailed setup and maintenance guides
- **Clear handoff process**: Step-by-step developer onboarding

### ⚠️ Breaking Changes
- **Contact form behavior**: Now generates PDF directly instead of sending email
- **Environment variables**: Complete change in required variables
- **Deployment architecture**: No longer requires backend services

### 🔄 Migration Guide

#### For Existing Deployments
1. Update environment variables to new format
2. Remove Supabase project dependencies
3. Redeploy as static site
4. Update DNS if moving hosting providers

#### For Development
1. Delete old `.env` file
2. Copy `.env.example` to `.env`  
3. Update meeting booking URL
4. Run `npm install` to update dependencies
5. Start development with `npm run dev`

### 📋 Post-Handoff TODO
- [ ] Set up production environment variables
- [ ] Configure hosting provider (Netlify/Vercel recommended)
- [ ] Update meeting booking URL to company's preferred platform
- [ ] Set up monitoring and analytics (if desired)
- [ ] Review and customize PDF template branding
- [ ] Test complete user flow in production environment

---

## [1.x.x] - Previous Releases
Previous versions included Supabase integration for email functionality and various UI components that have since been streamlined for the developer handoff.