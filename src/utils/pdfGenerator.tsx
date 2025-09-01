import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { formatCurrency, formatNumber } from './formatting';
import type { ROIResults, ROIInputs } from '@/types/roi';
import { RevenueAnalysisDocument } from '../components/pdf/RevenueAnalysisDocument';

// Professional formatting for executives
export const formatExecutiveCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

export const formatExecutivePercent = (percent: number): string => {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

// Risk assessment grading
export const getRiskGrade = (chromePercentage: number): { grade: string; color: string; description: string } => {
  if (chromePercentage <= 15) return { 
    grade: 'A', 
    color: '#10B981', 
    description: 'Excellent Identity Health' 
  };
  if (chromePercentage <= 30) return { 
    grade: 'B', 
    color: '#0EA5E9', 
    description: 'Good Identity Coverage' 
  };
  if (chromePercentage <= 50) return { 
    grade: 'C', 
    color: '#F59E0B', 
    description: 'Moderate Risk Exposure' 
  };
  if (chromePercentage <= 70) return { 
    grade: 'D', 
    color: '#EF4444', 
    description: 'High Revenue Risk' 
  };
  return { 
    grade: 'F', 
    color: '#EF4444', 
    description: 'Critical Revenue Loss' 
  };
};

export async function generatePDF(inputs: ROIInputs, results: ROIResults): Promise<void> {
  try {
    // Generate PDF blob using React-PDF
    const blob = await pdf(<RevenueAnalysisDocument inputs={inputs} results={results} />).toBlob();
    
    // Download the PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revenue_Impact_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}