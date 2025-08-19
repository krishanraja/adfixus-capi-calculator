import jsPDF from 'jspdf';
import { formatCurrency, formatNumber } from './formatting';
import type { ROIResults, ROIInputs } from '@/types/roi';

export function generatePDF(inputs: ROIInputs, results: ROIResults) {
  const pdf = new jsPDF();
  const date = new Date().toISOString().split('T')[0];
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AdFixus CAPI Revenue Impact Analysis', 20, 30);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Inputs
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Current Setup:', 20, 65);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Annual Revenue: ${formatCurrency(inputs.annualRevenue)}`, 20, 80);
  pdf.text(`Chrome Inventory: ${inputs.chromePercentage}%`, 20, 95);
  pdf.text(`Performance Campaigns: ${inputs.performanceCampaignPercentage}%`, 20, 110);
  pdf.text(`Display Share: ${inputs.displayShare}% | Web Video Share: ${inputs.videoShare}%`, 20, 125);
  
  // Results
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CAPI Impact Results:', 20, 150);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Incremental Annual Revenue: ${formatCurrency(results.incrementalRevenue)} (+${formatNumber(results.incrementalPercentage)}%)`, 20, 165);
  pdf.text(`Projected Total Revenue: ${formatCurrency(results.projectedRevenue)}`, 20, 180);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Revenue Improvements by Channel:', 20, 205);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Display: ${formatCurrency(results.conversionImprovements.displayImprovement)}`, 20, 220);
  pdf.text(`Web Video: ${formatCurrency(results.conversionImprovements.videoImprovement)} (+30% data quality)`, 20, 235);
  pdf.text(`Retargeting: ${formatCurrency(results.conversionImprovements.retargetingImprovement)}`, 20, 250);
  
  pdf.save(`AdFixus_CAPI_Analysis_${date}.pdf`);
}