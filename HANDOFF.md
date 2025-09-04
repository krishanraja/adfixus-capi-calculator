# Developer Handoff Guide

## 📋 Project Overview

The AdFixus CAPI ROI Calculator is a single-page React application designed to help sales teams demonstrate the revenue impact of implementing AdFixus Stream's Conversions API solution. 

**Purpose**: Convert prospects by showing personalized ROI calculations with professional PDF proposals.

## 🎯 Key Features

### 1. Interactive Calculator
- Multi-step form collecting business metrics
- Real-time validation and calculations
- Responsive design for all devices

### 2. PDF Report Generation
- Client-side PDF generation using pdfMake
- Professional proposal template
- Automatic download after form submission

### 3. Meeting Booking Integration
- Configurable external booking URL
- Seamless handoff from calculator to sales call

## 🏗 Codebase Structure

```
src/
├── components/
│   ├── roi/              # ROI-specific components
│   │   ├── ContactDialog.tsx    # Lead capture form
│   │   ├── ROICharts.tsx       # Data visualization
│   │   ├── ROIInputForm.tsx    # Calculator inputs
│   │   └── ROIResults.tsx      # Results display
│   ├── steps/            # Multi-step flow
│   │   ├── HeroStep.tsx        # Landing page
│   │   ├── CalculatorStep.tsx  # Input collection
│   │   └── ResultsStep.tsx     # Results & CTA
│   └── ui/               # Reusable UI components
├── hooks/
│   ├── useROICalculator.ts     # Calculator state management
│   └── useContactForm.ts       # Lead form logic
├── lib/
│   └── roiCalculations.ts      # Core ROI math
├── utils/
│   ├── pdfmakeGenerator.ts     # PDF template & generation
│   └── formatting.ts          # Number/currency helpers
├── types/
│   └── roi.ts                  # TypeScript definitions
└── constants/
    └── roiConstants.ts         # Business logic constants
```

## 📐 Design System

The application uses a custom design system defined in:
- `src/index.css` - CSS custom properties for colors, spacing
- `tailwind.config.ts` - Tailwind configuration and extensions

### Color Palette
- **Primary**: `--brand-primary` (Deep blue #006073)
- **Secondary**: `--brand-secondary` (Teal #00C7B1) 
- **Accent**: `--brand-accent` (Red #FF615A)
- **Purple**: `--brand-purple` (Purple #8B5CF6)

### Component Patterns
- Use semantic color tokens (e.g., `text-brand-primary`) instead of direct colors
- Components are built with Radix UI primitives for accessibility
- All styling uses Tailwind classes with design system tokens

## 🔧 Key Configuration Files

### Environment Variables
Create `.env` from `.env.example`:
```bash
VITE_MEETING_BOOKING_URL=https://your-booking-link.com
VITE_COMPANY_NAME=Your Company
```

### PDF Template Customization
Edit `src/utils/pdfmakeGenerator.ts`:
- Modify `buildAdfixusProposalPdf()` function
- Update company branding, colors, content
- Adjust calculations or risk assessments

### ROI Calculation Logic  
Edit `src/lib/roiCalculations.ts`:
- Modify `calculateROI()` function
- Update multipliers, coefficients, or formulas
- Adjust business logic constants

## 🔄 Common Updates

### 1. Updating Meeting Booking URL
```bash
# In .env file
VITE_MEETING_BOOKING_URL=https://new-booking-platform.com
```

### 2. Modifying PDF Template
```typescript
// In src/utils/pdfmakeGenerator.ts
const docDefinition = {
  content: [
    // Add/modify content blocks
  ],
  styles: {
    // Update styling
  }
};
```

### 3. Adjusting ROI Calculations
```typescript
// In src/lib/roiCalculations.ts
export function calculateROI(inputs: ROIInputs): ROIResults {
  // Modify calculation logic
  const newMultiplier = 1.25; // Example change
  // ...
}
```

### 4. Adding New Input Fields
1. Update types in `src/types/roi.ts`
2. Add to `useROICalculator` hook
3. Update `CalculatorStep` component
4. Modify calculation logic

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Static Site Deployment (Recommended)

#### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`  
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Vercel
1. Connect repository to Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

#### Manual Deployment
1. Run `npm run build`
2. Upload `dist/` folder to any static host
3. Configure redirects: `/* /index.html 200` (for SPA routing)

### Custom Domain Setup
1. Point DNS to hosting provider
2. Configure SSL certificate
3. Update environment variables if needed

## 🔍 Testing Strategy

### Manual Testing Checklist
- [ ] Hero page loads correctly
- [ ] Calculator accepts valid inputs
- [ ] Validation shows appropriate errors  
- [ ] Results display accurate calculations
- [ ] PDF downloads successfully
- [ ] Meeting booking link opens correctly
- [ ] Mobile layout is responsive

### Key Test Scenarios
1. **Complete Flow**: Hero → Calculator → Results → PDF
2. **Edge Cases**: Invalid inputs, network errors
3. **Cross-browser**: Chrome, Safari, Firefox, Edge
4. **Mobile**: iOS Safari, Chrome Android

## 🛡 Security Considerations

- No sensitive data stored or transmitted
- All calculations performed client-side
- External links controlled via environment variables
- No authentication or user accounts required
- PDF generation happens in browser (no server upload)

## 📊 Analytics & Monitoring

To add analytics:
1. Install analytics provider (Google Analytics, Mixpanel, etc.)
2. Add tracking to key events:
   - Calculator completion
   - PDF downloads  
   - Meeting booking clicks

Example integration points:
```typescript
// In useContactForm.ts
const submitContactForm = async () => {
  // ... existing logic
  
  // Add analytics tracking
  analytics.track('pdf_downloaded', {
    revenue: inputs.annualRevenue,
    company: contactForm.company
  });
};
```

## 🐛 Common Issues & Solutions

### Build Errors
- **TypeScript errors**: Check type definitions in `src/types/`
- **Missing dependencies**: Run `npm install`
- **Import errors**: Verify file paths and exports

### Runtime Issues
- **PDF generation fails**: Check pdfMake configuration
- **Calculations incorrect**: Verify `roiCalculations.ts` logic
- **Styling broken**: Check Tailwind classes and CSS variables

### Performance
- **Slow load times**: Optimize images, lazy load components
- **Large bundle**: Analyze with `npm run build` and optimize imports

## 🔄 Maintenance

### Regular Updates
- Review and update ROI calculation logic quarterly
- Update PDF template with new branding/messaging
- Monitor and update dependencies for security
- Test across browsers and devices regularly

### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor Core Web Vitals
- Track conversion metrics (calculator completion rate)

## 📞 Support Contacts

For questions about:
- **Business Logic**: Sales team or product owner
- **Technical Issues**: Lead developer or DevOps team  
- **Design Updates**: Design team or brand manager
- **Deployment**: DevOps or infrastructure team
