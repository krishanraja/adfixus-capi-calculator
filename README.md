
# AdFixus CAPI ROI Calculator

An interactive single-page ROI calculator that demonstrates the revenue upside of implementing AdFixus Stream's deterministic Conversions API.

## Features

- **Interactive Input Form**: Collect key business metrics with helpful tooltips
- **Real-time Calculations**: Instant ROI analysis with comprehensive metrics
- **Visual Analytics**: Before/after revenue comparison chart
- **PDF Export**: Professional business case document generation
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Professional Branding**: AdFixus color scheme and styling

## Key Metrics Calculated

- Incremental monthly revenue ($ and %)
- 12-month incremental revenue projection
- Payback period in weeks
- ROI percentage at 12 months
- Visual before/after comparison

## Math Logic

The calculator uses the following formulas:

```javascript
baselineRevenue = (impressions / 1000) × cpm
upliftedImpressions = impressions × (1 + inventoryGain%)
upliftedCPM = cpm × (1 + cpmLift%)
upliftRevenue = (upliftedImpressions / 1000) × upliftedCPM
incrementalRevenue = upliftRevenue – baselineRevenue
paybackWeeks = (implementationCost / incrementalRevenue) × 4.345
ROI12m = ((incrementalRevenue × 12) – implementationCost) / implementationCost
```

## Test Data

Use these values for testing:
- Monthly Impressions: 25,000,000
- Average CPM: $3.20
- CPM Lift: 15%
- Inventory Gain: 40%
- Implementation Cost: $25,000

Expected Results:
- Incremental Monthly Revenue: ~$48,000
- Payback Period: ~5.4 weeks
- ROI at 12 months: ~1,610%

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **Recharts** for data visualization
- **jsPDF** for PDF generation
- **Vite** for build tooling

## Brand Colors

- Deep Teal `#006073` (primary)
- Aqua `#00C7B1` (accent)
- Coral `#FF615A` (alert/CTA)
- Off-white `#F7F9FA` (background)

## Usage for Sales Teams

1. Share the calculator URL with prospects
2. Prospects input their current metrics (3-4 fields)
3. Click "Calculate" for instant ROI analysis
4. Download professional PDF business case
5. Use results for internal stakeholder discussions

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Accessibility

- WCAG AA color contrast compliance
- Keyboard navigation support
- Responsive design for all screen sizes
- Semantic HTML structure

## Customization

The calculator is designed for easy customization:
- Update brand colors in the component styles
- Modify default values based on industry benchmarks
- Adjust calculation formulas as needed
- Customize PDF template and branding

## Hand-off Notes for Engineers

- All calculations are in the main `ROICalculator.tsx` component
- PDF generation uses jsPDF with custom template
- Chart visualization uses Recharts BarChart
- Form validation includes real-time error handling
- Responsive design uses Tailwind's grid system
- Brand colors are applied inline for easy identification
