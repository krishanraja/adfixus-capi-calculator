import PDFDocument from 'pdfkit';
import { formatCurrency, formatNumber } from './formatting';
import type { ROIResults, ROIInputs } from '@/types/roi';

// Professional Design System
const BRAND = {
  colors: {
    primary: '#0F172A',      // Executive navy
    secondary: '#0EA5E9',    // Trust blue
    success: '#10B981',      // Growth green
    warning: '#F59E0B',      // Alert amber
    danger: '#EF4444',       // Urgent red
    accent: '#8B5CF6',       // Premium purple
    gray: {
      light: '#F8FAFC',
      medium: '#64748B',
      dark: '#334155'
    }
  },
  fonts: {
    size: {
      hero: 28,
      title: 22,
      subtitle: 18,
      header: 16,
      body: 12,
      caption: 10,
      small: 8
    },
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  layout: {
    margin: 50,
    contentWidth: 495, // 8.5" - 2" margins
    lineHeight: 1.4,
    sectionSpacing: 30,
    cardSpacing: 15,
    pageHeight: 792, // US Letter
    pageWidth: 612
  }
};

// Professional formatting for executives
const formatExecutiveCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const formatExecutivePercent = (percent: number): string => {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

// Risk assessment grading
const getRiskGrade = (chromePercentage: number): { grade: string; color: string; description: string } => {
  if (chromePercentage <= 15) return { 
    grade: 'A', 
    color: BRAND.colors.success, 
    description: 'Excellent Identity Health' 
  };
  if (chromePercentage <= 30) return { 
    grade: 'B', 
    color: BRAND.colors.secondary, 
    description: 'Good Identity Coverage' 
  };
  if (chromePercentage <= 50) return { 
    grade: 'C', 
    color: BRAND.colors.warning, 
    description: 'Moderate Risk Exposure' 
  };
  if (chromePercentage <= 70) return { 
    grade: 'D', 
    color: BRAND.colors.danger, 
    description: 'High Revenue Risk' 
  };
  return { 
    grade: 'F', 
    color: BRAND.colors.danger, 
    description: 'Critical Revenue Loss' 
  };
};

export function generatePDF(inputs: ROIInputs, results: ROIResults): Promise<void> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: BRAND.layout.margin,
        bottom: BRAND.layout.margin,
        left: BRAND.layout.margin,
        right: BRAND.layout.margin
      }
    });

    // Setup blob stream for download
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBlob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Revenue_Impact_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    });

    let currentY = BRAND.layout.margin;
    const riskAssessment = getRiskGrade(inputs.chromePercentage);
    const monthlyLoss = results.incrementalRevenue / 12;

    // === PAGE 1: EXECUTIVE SUMMARY ===
    
    // Header with company branding
    doc.fontSize(BRAND.fonts.size.hero)
       .fillColor(BRAND.colors.primary)
       .font('Helvetica-Bold')
       .text('REVENUE IMPACT ANALYSIS', BRAND.layout.margin, currentY);
    
    currentY += 45;
    
    doc.fontSize(BRAND.fonts.size.subtitle)
       .fillColor(BRAND.colors.secondary)
       .font('Helvetica')
       .text('AdFixus Conversion API Implementation Study', BRAND.layout.margin, currentY);
    
    currentY += BRAND.layout.sectionSpacing + 20;

    // Critical Problem Statement
    addSection(doc, 'CRITICAL BUSINESS IMPACT', BRAND.colors.danger, currentY);
    currentY += 35;

    doc.fontSize(BRAND.fonts.size.body)
       .fillColor(BRAND.colors.gray.dark)
       .font('Helvetica')
       .text(
         `Your organization is experiencing significant revenue leakage due to identity resolution gaps. ` +
         `Our analysis reveals ${formatExecutiveCurrency(results.incrementalRevenue)} in annual lost revenue ` +
         `that can be recovered through strategic CAPI implementation.`,
         BRAND.layout.margin, currentY,
         { width: BRAND.layout.contentWidth, lineGap: 6 }
       );

    currentY += 80;

    // Executive Metrics Dashboard
    addMetricCards(doc, [
      {
        title: 'MONTHLY REVENUE LOSS',
        value: formatExecutiveCurrency(monthlyLoss),
        color: BRAND.colors.danger,
        y: currentY
      },
      {
        title: 'IDENTITY HEALTH GRADE',
        value: riskAssessment.grade,
        color: riskAssessment.color,
        y: currentY,
        x: 220
      },
      {
        title: 'RECOVERY OPPORTUNITY',
        value: formatExecutiveCurrency(results.incrementalRevenue),
        color: BRAND.colors.success,
        y: currentY,
        x: 390
      }
    ]);

    currentY += 120;

    // Solution Impact
    addSection(doc, 'ADFIXUS CAPI SOLUTION IMPACT', BRAND.colors.success, currentY);
    currentY += 35;

    doc.fontSize(BRAND.fonts.size.body)
       .fillColor(BRAND.colors.gray.dark)
       .font('Helvetica')
       .text(
         `AdFixus Conversion API delivers advanced identity resolution capabilities that directly address ` +
         `your revenue gaps. Through server-side data processing and enhanced tracking accuracy, ` +
         `we project ${formatExecutivePercent(results.incrementalPercentage)} annual revenue uplift.`,
         BRAND.layout.margin, currentY,
         { width: BRAND.layout.contentWidth, lineGap: 6 }
       );

    currentY += 80;

    // ROI Metrics
    addMetricCards(doc, [
      {
        title: 'PROJECTED ANNUAL ROI',
        value: formatExecutivePercent(results.incrementalPercentage),
        color: BRAND.colors.success,
        y: currentY
      },
      {
        title: 'NEW REVENUE TOTAL',
        value: formatExecutiveCurrency(results.projectedRevenue),
        color: BRAND.colors.primary,
        y: currentY,
        x: 220
      },
      {
        title: 'PAYBACK PERIOD',
        value: '< 3 months',
        color: BRAND.colors.accent,
        y: currentY,
        x: 390
      }
    ]);

    // === PAGE 2: DETAILED ANALYSIS ===
    doc.addPage();
    currentY = BRAND.layout.margin;

    // Page header
    addPageHeader(doc, 'DETAILED REVENUE ANALYSIS', currentY);
    currentY += 60;

    // Channel Performance Breakdown
    addSection(doc, 'REVENUE RECOVERY BY CHANNEL', BRAND.colors.primary, currentY);
    currentY += 40;

    const channelData = [
      {
        channel: 'Display Advertising',
        current: results.currentDisplayRevenue,
        projected: results.projectedDisplayRevenue,
        improvement: results.conversionImprovements.displayImprovement
      },
      {
        channel: 'Video Campaigns',
        current: results.currentVideoRevenue,
        projected: results.projectedVideoRevenue,
        improvement: results.conversionImprovements.videoImprovement
      },
      {
        channel: 'Retargeting',
        current: results.currentRetargetingRevenue,
        projected: results.projectedRetargetingRevenue,
        improvement: results.conversionImprovements.retargetingImprovement
      }
    ];

    // Channel analysis table
    addChannelTable(doc, channelData, currentY);
    currentY += 140;

    // Risk Analysis
    addSection(doc, 'CURRENT RISK ASSESSMENT', riskAssessment.color, currentY);
    currentY += 40;

    doc.fontSize(BRAND.fonts.size.body)
       .fillColor(BRAND.colors.gray.dark)
       .font('Helvetica')
       .text(
         `Identity Health Grade: ${riskAssessment.grade} - ${riskAssessment.description}\n\n` +
         `• Unaddressable Inventory: ${inputs.chromePercentage.toFixed(1)}% of total traffic\n` +
         `• Performance Campaign Impact: ${inputs.performanceCampaignPercentage}% of revenue affected\n` +
         `• Monthly Revenue Exposure: ${formatExecutiveCurrency(monthlyLoss)}`,
         BRAND.layout.margin, currentY,
         { width: BRAND.layout.contentWidth, lineGap: 8 }
       );

    currentY += 120;

    // Implementation Benefits
    addSection(doc, 'IMPLEMENTATION BENEFITS', BRAND.colors.success, currentY);
    currentY += 40;

    const benefits = [
      'Enhanced cross-device user tracking and attribution',
      'Improved conversion measurement accuracy by 25-40%',
      'Reduced dependency on third-party cookies',
      'Server-side data processing for better privacy compliance',
      'Real-time optimization capabilities'
    ];

    benefits.forEach((benefit, index) => {
      doc.fontSize(BRAND.fonts.size.body)
         .fillColor(BRAND.colors.gray.dark)
         .text(`• ${benefit}`, BRAND.layout.margin + 10, currentY + (index * 20));
    });

    // === PAGE 3: ACTION PLAN ===
    doc.addPage();
    currentY = BRAND.layout.margin;

    addPageHeader(doc, 'STRATEGIC ACTION PLAN', currentY);
    currentY += 60;

    // Priority Recommendations
    addSection(doc, 'PRIORITY RECOMMENDATIONS', BRAND.colors.primary, currentY);
    currentY += 40;

    const recommendations = [
      {
        priority: 'IMMEDIATE',
        action: 'Deploy AdFixus CAPI Integration',
        timeline: '30-45 days',
        impact: formatExecutiveCurrency(results.incrementalRevenue * 0.7),
        color: BRAND.colors.danger
      },
      {
        priority: 'SHORT-TERM',
        action: 'Optimize Identity Resolution Strategy',
        timeline: '60-90 days',
        impact: formatExecutiveCurrency(results.incrementalRevenue * 0.2),
        color: BRAND.colors.warning
      },
      {
        priority: 'ONGOING',
        action: 'Performance Monitoring & Optimization',
        timeline: 'Continuous',
        impact: formatExecutiveCurrency(results.incrementalRevenue * 0.1),
        color: BRAND.colors.success
      }
    ];

    recommendations.forEach((rec, index) => {
      addRecommendationCard(doc, rec, currentY + (index * 80));
    });

    currentY += 280;

    // Implementation Timeline
    addSection(doc, 'IMPLEMENTATION ROADMAP', BRAND.colors.primary, currentY);
    currentY += 40;

    const timeline = [
      'Week 1-2: Technical setup and API integration',
      'Week 3-4: Testing and quality assurance',
      'Week 5-6: Full deployment and monitoring setup',
      'Week 7+: Performance optimization and scaling'
    ];

    timeline.forEach((phase, index) => {
      doc.fontSize(BRAND.fonts.size.body)
         .fillColor(BRAND.colors.gray.dark)
         .font('Helvetica-Bold')
         .text(`Phase ${index + 1}: `, BRAND.layout.margin, currentY + (index * 25));
      
      doc.font('Helvetica')
         .text(phase.split(': ')[1], BRAND.layout.margin + 60, currentY + (index * 25));
    });

    currentY += 120;

    // Next Steps
    addSection(doc, 'IMMEDIATE NEXT STEPS', BRAND.colors.accent, currentY);
    currentY += 35;

    doc.fontSize(BRAND.fonts.size.body)
       .fillColor(BRAND.colors.gray.dark)
       .font('Helvetica')
       .text(
         '1. Schedule technical consultation with AdFixus implementation team\n' +
         '2. Review integration requirements and technical specifications\n' +
         '3. Approve project timeline and resource allocation\n' +
         '4. Initiate CAPI deployment process',
         BRAND.layout.margin, currentY,
         { width: BRAND.layout.contentWidth, lineGap: 12 }
       );

    // Add professional footer to all pages
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      addFooter(doc, i + 1, pageCount);
    }

    doc.end();

    // Helper Functions
    function addSection(doc: PDFKit.PDFDocument, title: string, color: string, y: number) {
      doc.fontSize(BRAND.fonts.size.header)
         .fillColor(color)
         .font('Helvetica-Bold')
         .text(title, BRAND.layout.margin, y);
      
      // Underline
      doc.moveTo(BRAND.layout.margin, y + 25)
         .lineTo(BRAND.layout.margin + 200, y + 25)
         .strokeColor(color)
         .lineWidth(2)
         .stroke();
    }

    function addPageHeader(doc: PDFKit.PDFDocument, title: string, y: number) {
      doc.fontSize(BRAND.fonts.size.title)
         .fillColor(BRAND.colors.primary)
         .font('Helvetica-Bold')
         .text(title, BRAND.layout.margin, y);
    }

    function addMetricCards(doc: PDFKit.PDFDocument, cards: Array<{title: string, value: string, color: string, y: number, x?: number}>) {
      cards.forEach((card) => {
        const x = card.x || BRAND.layout.margin;
        const cardWidth = 150;
        const cardHeight = 80;

        // Card background
        doc.rect(x, card.y, cardWidth, cardHeight)
           .fillColor('#FFFFFF')
           .fill()
           .rect(x, card.y, cardWidth, cardHeight)
           .strokeColor(card.color)
           .lineWidth(2)
           .stroke();

        // Value
        doc.fontSize(BRAND.fonts.size.title)
           .fillColor(card.color)
           .font('Helvetica-Bold')
           .text(card.value, x + 15, card.y + 20, { width: cardWidth - 30, align: 'center' });

        // Title
        doc.fontSize(BRAND.fonts.size.caption)
           .fillColor(BRAND.colors.gray.medium)
           .font('Helvetica')
           .text(card.title, x + 10, card.y + 55, { width: cardWidth - 20, align: 'center' });
      });
    }

    function addChannelTable(doc: PDFKit.PDFDocument, data: Array<{channel: string, current: number, projected: number, improvement: number}>, y: number) {
      const tableHeaders = ['Channel', 'Current Revenue', 'Projected Revenue', 'Improvement'];
      const colWidths = [140, 120, 120, 115];
      let currentX = BRAND.layout.margin;

      // Headers
      doc.fontSize(BRAND.fonts.size.body)
         .fillColor(BRAND.colors.primary)
         .font('Helvetica-Bold');

      tableHeaders.forEach((header, i) => {
        doc.text(header, currentX, y, { width: colWidths[i] });
        currentX += colWidths[i];
      });

      // Data rows
      data.forEach((row, index) => {
        const rowY = y + 30 + (index * 25);
        currentX = BRAND.layout.margin;

        doc.fontSize(BRAND.fonts.size.body)
           .fillColor(BRAND.colors.gray.dark)
           .font('Helvetica')
           .text(row.channel, currentX, rowY, { width: colWidths[0] });
        currentX += colWidths[0];

        doc.text(formatExecutiveCurrency(row.current), currentX, rowY, { width: colWidths[1] });
        currentX += colWidths[1];

        doc.text(formatExecutiveCurrency(row.projected), currentX, rowY, { width: colWidths[2] });
        currentX += colWidths[2];

        doc.fillColor(BRAND.colors.success)
           .font('Helvetica-Bold')
           .text(`+${formatExecutiveCurrency(row.improvement)}`, currentX, rowY, { width: colWidths[3] });
      });
    }

    function addRecommendationCard(doc: PDFKit.PDFDocument, rec: any, y: number) {
      const cardHeight = 70;
      
      // Priority badge
      doc.rect(BRAND.layout.margin, y, 100, 20)
         .fillColor(rec.color)
         .fill();

      doc.fontSize(BRAND.fonts.size.small)
         .fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .text(rec.priority, BRAND.layout.margin + 5, y + 6);

      // Action details
      doc.fontSize(BRAND.fonts.size.body)
         .fillColor(BRAND.colors.primary)
         .font('Helvetica-Bold')
         .text(rec.action, BRAND.layout.margin, y + 30);

      doc.fontSize(BRAND.fonts.size.body)
         .fillColor(BRAND.colors.gray.dark)
         .font('Helvetica')
         .text(`Timeline: ${rec.timeline} | Expected Impact: ${rec.impact}`, BRAND.layout.margin, y + 50);
    }

    function addFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number) {
      const footerY = BRAND.layout.pageHeight - 30;
      
      doc.fontSize(BRAND.fonts.size.small)
         .fillColor(BRAND.colors.gray.medium)
         .font('Helvetica')
         .text('CONFIDENTIAL - Executive Use Only', BRAND.layout.margin, footerY)
         .text(`Page ${pageNum} of ${totalPages}`, BRAND.layout.pageWidth - 100, footerY)
         .text(`Generated: ${new Date().toLocaleDateString()} | Contact: sales@adfixus.com`, 
               BRAND.layout.margin, footerY + 12, { width: BRAND.layout.contentWidth, align: 'center' });
    }
  });
}