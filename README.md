# AdFixus CAPI ROI Calculator

A React-based calculator that helps businesses understand the revenue impact of implementing AdFixus Stream's Conversions API (CAPI) solution.

## ⚡ Quickstart

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your meeting booking URL
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Deploy**
   - Upload `dist/` folder to any static hosting service (Netlify, Vercel, etc.)

## 🛠 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **PDF Generation**: pdfMake (client-side)
- **Charts**: Recharts
- **Build Tool**: Vite
- **Validation**: Zod with React Hook Form

## 📦 Key Features

- Interactive ROI calculation with real-time updates
- Visual analytics with responsive charts
- PDF proposal generation (client-side)
- Mobile-responsive design
- Configurable meeting booking integration
- Zero backend dependencies

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_MEETING_BOOKING_URL` | URL for booking strategy sessions | Outlook booking link |
| `VITE_COMPANY_NAME` | Company name for branding | AdFixus |

## 📊 ROI Calculation Logic

The calculator uses these formulas:
- **Baseline Revenue**: Annual revenue × Display/Video shares
- **CAPI Impact**: Based on browser inventory and performance metrics
- **Incremental Revenue**: Projected - Current revenue
- **ROI**: (Incremental Revenue / Implementation Cost) × 100

## 🚀 Deployment

### Static Hosting (Recommended)
Deploy to any static host like Netlify, Vercel, or AWS S3:

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

### Custom Domain Setup
1. Build the project: `npm run build`
2. Configure your host to serve from `dist/index.html`
3. Set up redirects for SPA routing (all routes → `/index.html`)

## 📝 Updating Meeting URL

Edit the `VITE_MEETING_BOOKING_URL` in your `.env` file:

```bash
VITE_MEETING_BOOKING_URL=https://your-booking-platform.com/book
```

## 📚 Additional Documentation

- [HANDOFF.md](./HANDOFF.md) - Developer onboarding guide
- [SECURITY.md](./SECURITY.md) - Security considerations
- [CHANGELOG.md](./CHANGELOG.md) - Version history

## 🤝 Support

For technical questions or feature requests, contact the development team or refer to the handoff documentation.