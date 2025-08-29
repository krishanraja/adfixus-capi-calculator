import jsPDF from 'jspdf';
import { formatCurrency, formatNumber } from './formatting';
import type { ROIResults, ROIInputs } from '@/types/roi';

// CEO-Ready PDF Design System
const brandColors = {
  primary: '#0066CC',     // Trust & authority
  secondary: '#00A3E0',   // Innovation  
  success: '#22C55E',     // Positive outcomes
  warning: '#F59E0B',     // Attention/caution
  danger: '#EF4444',      // Problems/losses
  gray: {
    50: '#F8FAFC',        // Light backgrounds
    600: '#475569',       // Body text
    800: '#1E293B'        // Headers
  }
};

const typography = {
  hero: 24,               // Report title
  title: 18,              // Section headers
  sectionTitle: 14,       // Subsection headers
  cardValue: 14,          // Key metrics
  cardTitle: 10,          // Metric labels
  body: 10,               // Regular text
  caption: 8,             // Supporting details
  footer: 7               // Fine print
};

const layout = {
  pageWidth: 210,         // A4 standard
  pageHeight: 297,
  margin: 20,             // Generous margins
  contentWidth: 170,      // Readable content area
  sectionSpacing: 20,     // Visual breathing room
  cardSpacing: 8,         // Card separation
  lineHeight: 6          // Text readability
};

// Smart number formatting for CEOs
function formatCEOCurrency(amount: number): string {
  if (amount < 1000) return `$${amount.toFixed(0)}`;
  if (amount < 1000000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${(amount / 1000000).toFixed(1)}M`;
}

function formatPercentage(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

function getIdentityHealthGrade(chromePercentage: number): { grade: string; color: string } {
  if (chromePercentage <= 20) return { grade: 'A+', color: brandColors.success };
  if (chromePercentage <= 40) return { grade: 'B', color: brandColors.warning };
  if (chromePercentage <= 60) return { grade: 'C', color: brandColors.warning };
  if (chromePercentage <= 80) return { grade: 'D', color: brandColors.danger };
  return { grade: 'F', color: brandColors.danger };
}

export function generatePDF(inputs: ROIInputs, results: ROIResults) {
  const pdf = new jsPDF();
  let currentY = layout.margin;
  
  // Calculate key CEO metrics
  const monthlyLoss = (results.incrementalRevenue) / 12;
  const unaddressablePercent = inputs.chromePercentage;
  const identityHealth = getIdentityHealthGrade(inputs.chromePercentage);
  const annualROI = results.incrementalPercentage;
  
  // Page 1: Executive Summary
  function addPageHeader() {
    pdf.setFontSize(typography.hero);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.primary);
    pdf.text('REVENUE IMPACT ANALYSIS', layout.margin, currentY);
    currentY += 10;
    
    pdf.setFontSize(typography.sectionTitle);
    pdf.setTextColor(brandColors.gray[600]);
    pdf.text('AdFixus Conversion API Implementation', layout.margin, currentY);
    currentY += layout.sectionSpacing;
  }
  
  function addExecutiveSummary() {
    // Problem Statement
    pdf.setFontSize(typography.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.danger);
    pdf.text('REVENUE AT RISK', layout.margin, currentY);
    currentY += 8;
    
    pdf.setFontSize(typography.body);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(brandColors.gray[800]);
    const problemText = `Your current identity strategy is leaving ${formatCEOCurrency(results.incrementalRevenue)} annually on the table.`;
    pdf.text(problemText, layout.margin, currentY, { maxWidth: layout.contentWidth });
    currentY += layout.sectionSpacing;
    
    // Key Problem Metrics Cards
    addMetricCard('MONTHLY LOSS', formatCEOCurrency(monthlyLoss), brandColors.danger, currentY);
    addMetricCard('UNADDRESSABLE INVENTORY', formatPercentage(unaddressablePercent), brandColors.warning, currentY + 25);
    addMetricCard('IDENTITY HEALTH GRADE', identityHealth.grade, identityHealth.color, currentY + 50);
    currentY += 80;
  }
  
  function addMetricCard(title: string, value: string, color: string, y: number) {
    // Card background
    pdf.setFillColor(brandColors.gray[50]);
    pdf.rect(layout.margin, y, 50, 20, 'F');
    
    // Card border
    pdf.setDrawColor(color);
    pdf.setLineWidth(0.5);
    pdf.rect(layout.margin, y, 50, 20);
    
    // Value
    pdf.setFontSize(typography.cardValue);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(color);
    pdf.text(value, layout.margin + 2, y + 8);
    
    // Title
    pdf.setFontSize(typography.cardTitle);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(brandColors.gray[600]);
    pdf.text(title, layout.margin + 2, y + 16);
  }
  
  function addSolutionImpact() {
    pdf.setFontSize(typography.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.success);
    pdf.text('CAPI SOLUTION IMPACT', layout.margin, currentY);
    currentY += 8;
    
    pdf.setFontSize(typography.body);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(brandColors.gray[800]);
    const solutionText = `AdFixus CAPI can recover this lost revenue through advanced identity resolution and improved conversion tracking.`;
    pdf.text(solutionText, layout.margin, currentY, { maxWidth: layout.contentWidth });
    currentY += layout.sectionSpacing;
    
    // Solution Benefits Cards
    addMetricCard('ANNUAL ROI UPLIFT', `+${formatPercentage(annualROI)}`, brandColors.success, currentY);
    addMetricCard('RECOVERED REVENUE', formatCEOCurrency(results.incrementalRevenue), brandColors.success, currentY + 25);
    addMetricCard('NEW TOTAL REVENUE', formatCEOCurrency(results.projectedRevenue), brandColors.primary, currentY + 50);
    currentY += 80;
  }
  
  function addChannelBreakdown() {
    pdf.setFontSize(typography.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.primary);
    pdf.text('REVENUE IMPROVEMENTS BY CHANNEL', layout.margin, currentY);
    currentY += layout.sectionSpacing;
    
    // Channel improvements
    const channels = [
      { name: 'Display Advertising', improvement: results.conversionImprovements.displayImprovement },
      { name: 'Web Video Campaigns', improvement: results.conversionImprovements.videoImprovement },
      { name: 'Retargeting Campaigns', improvement: results.conversionImprovements.retargetingImprovement }
    ];
    
    channels.forEach((channel, index) => {
      const y = currentY + (index * 15);
      
      pdf.setFontSize(typography.body);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(brandColors.gray[800]);
      pdf.text(channel.name, layout.margin, y);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandColors.success);
      pdf.text(formatCEOCurrency(channel.improvement), layout.margin + 80, y);
    });
    
    currentY += 60;
  }
  
  // Start Page 1
  addPageHeader();
  addExecutiveSummary();
  addSolutionImpact();
  addChannelBreakdown();
  
  // Page 2: Action Plan & Implementation
  pdf.addPage();
  currentY = layout.margin;
  
  function addActionPlan() {
    pdf.setFontSize(typography.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.primary);
    pdf.text('RECOMMENDED ACTION PLAN', layout.margin, currentY);
    currentY += layout.sectionSpacing;
    
    const recommendations = [
      {
        priority: 'HIGH PRIORITY',
        action: 'Implement AdFixus CAPI Integration',
        timeline: '30-45 days',
        impact: formatCEOCurrency(results.incrementalRevenue * 0.7),
        color: brandColors.danger
      },
      {
        priority: 'MEDIUM PRIORITY', 
        action: 'Optimize Identity Resolution Strategy',
        timeline: '60-90 days',
        impact: formatCEOCurrency(results.incrementalRevenue * 0.2),
        color: brandColors.warning
      },
      {
        priority: 'ONGOING',
        action: 'Monitor & Optimize Performance',
        timeline: 'Continuous',
        impact: formatCEOCurrency(results.incrementalRevenue * 0.1),
        color: brandColors.success
      }
    ];
    
    recommendations.forEach((rec, index) => {
      const cardY = currentY + (index * 35);
      
      // Priority badge
      pdf.setFillColor(rec.color);
      pdf.rect(layout.margin, cardY, 40, 8, 'F');
      pdf.setFontSize(typography.caption);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(rec.priority, layout.margin + 1, cardY + 5);
      
      // Action details
      pdf.setFontSize(typography.body);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(brandColors.gray[800]);
      pdf.text(rec.action, layout.margin, cardY + 15);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Timeline: ${rec.timeline} | Expected Impact: ${rec.impact}`, layout.margin, cardY + 25);
    });
    
    currentY += 120;
  }
  
  function addImplementationTimeline() {
    pdf.setFontSize(typography.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.primary);
    pdf.text('IMPLEMENTATION TIMELINE', layout.margin, currentY);
    currentY += layout.sectionSpacing;
    
    const phases = [
      'Week 1-2: Technical Setup & Integration',
      'Week 3-4: Testing & Optimization',
      'Week 5-6: Full Deployment & Monitoring',
      'Week 7+: Performance Analysis & Scaling'
    ];
    
    phases.forEach((phase, index) => {
      pdf.setFontSize(typography.body);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(brandColors.gray[800]);
      pdf.text(`${index + 1}. ${phase}`, layout.margin, currentY + (index * 8));
    });
    
    currentY += 50;
  }
  
  function addNextSteps() {
    pdf.setFontSize(typography.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(brandColors.primary);
    pdf.text('NEXT STEPS', layout.margin, currentY);
    currentY += layout.sectionSpacing;
    
    const steps = [
      '1. Schedule technical consultation with AdFixus team',
      '2. Review integration requirements and timeline',
      '3. Approve implementation plan and budget',
      '4. Begin CAPI integration process'
    ];
    
    steps.forEach((step, index) => {
      pdf.setFontSize(typography.body);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(brandColors.gray[800]);
      pdf.text(step, layout.margin, currentY + (index * 8));
    });
  }
  
  addActionPlan();
  addImplementationTimeline();
  addNextSteps();
  
  // Footer
  function addFooter() {
    const footerY = layout.pageHeight - 15;
    pdf.setFontSize(typography.footer);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(brandColors.gray[600]);
    
    pdf.text('CONFIDENTIAL - For Internal Use Only', layout.margin, footerY);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, layout.pageWidth - 60, footerY);
    pdf.text('Questions? Contact sales@adfixus.com', layout.pageWidth / 2 - 30, footerY + 5);
  }
  
  // Add footer to both pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    addFooter();
  }
  
  // Save with executive-friendly filename
  const date = new Date().toISOString().split('T')[0];
  pdf.save(`AdFixus_Revenue_Impact_Analysis_${date}.pdf`);
}