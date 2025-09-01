import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { ROIResults, ROIInputs } from '@/types/roi';
import { formatExecutiveCurrency, formatExecutivePercent, getRiskGrade } from '@/utils/pdfGenerator';

// Professional PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    minHeight: '100vh',
  },
  
  // Typography
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  
  subtitle: {
    fontSize: 18,
    color: '#0EA5E9',
    marginBottom: 30,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 15,
    marginTop: 30,
  },
  
  body: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  
  // Layout Components
  section: {
    marginBottom: 30,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  
  column: {
    flex: 1,
    marginRight: 10,
  },
  
  // Metric Cards
  metricCard: {
    width: 150,
    height: 80,
    border: '2px solid #0EA5E9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 15,
  },
  
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 5,
  },
  
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  
  // Table Styles
  table: {
    marginTop: 15,
    marginBottom: 20,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: '1px solid #E2E8F0',
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottom: '1px solid #F1F5F9',
  },
  
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
  },
  
  tableCellHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  
  // Priority Cards
  priorityCard: {
    marginBottom: 20,
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: 15,
  },
  
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  
  priorityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 5,
  },
  
  actionDetails: {
    fontSize: 11,
    color: '#64748B',
  },
  
  // Logo
  logo: {
    width: 120,
    height: 32,
    marginBottom: 10,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  // Footer - Simple inline footer
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1px solid #E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#64748B',
  },
  
  // Colors
  dangerText: { color: '#EF4444' },
  successText: { color: '#10B981' },
  warningText: { color: '#F59E0B' },
  primaryText: { color: '#0F172A' },
  
  dangerBg: { backgroundColor: '#EF4444' },
  successBg: { backgroundColor: '#10B981' },
  warningBg: { backgroundColor: '#F59E0B' },
});

interface RevenueAnalysisDocumentProps {
  inputs: ROIInputs;
  results: ROIResults;
}

export function RevenueAnalysisDocument({ inputs, results }: RevenueAnalysisDocumentProps) {
  const riskAssessment = getRiskGrade(inputs.chromePercentage);
  const monthlyLoss = results.incrementalRevenue / 12;
  
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

  const recommendations = [
    {
      priority: 'IMMEDIATE',
      action: 'Deploy AdFixus CAPI Integration',
      timeline: '30-45 days',
      impact: formatExecutiveCurrency(results.incrementalRevenue * 0.7),
      bgStyle: styles.dangerBg
    },
    {
      priority: 'SHORT-TERM',
      action: 'Optimize Identity Resolution Strategy',
      timeline: '60-90 days',
      impact: formatExecutiveCurrency(results.incrementalRevenue * 0.2),
      bgStyle: styles.warningBg
    },
    {
      priority: 'ONGOING',
      action: 'Performance Monitoring & Optimization',
      timeline: 'Continuous',
      impact: formatExecutiveCurrency(results.incrementalRevenue * 0.1),
      bgStyle: styles.successBg
    }
  ];

  return (
    <Document>
      {/* Page 1: Executive Summary */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image 
            src="/lovable-uploads/e05fe6e9-96d1-4dcc-9caa-0d7f03e785ed.png" 
            style={styles.logo}
          />
        </View>
        <Text style={styles.heroTitle}>REVENUE IMPACT ANALYSIS</Text>
        <Text style={styles.subtitle}>AdFixus Conversion API Implementation Study</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerText]}>CRITICAL BUSINESS IMPACT</Text>
          <Text style={styles.body}>
            Your organization is experiencing significant revenue leakage due to identity resolution gaps. 
            Our analysis reveals {formatExecutiveCurrency(results.incrementalRevenue)} in annual lost revenue 
            that can be recovered through strategic CAPI implementation.
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.metricCard, { borderColor: '#EF4444' }]}>
            <Text style={[styles.metricValue, styles.dangerText]}>
              {formatExecutiveCurrency(monthlyLoss)}
            </Text>
            <Text style={styles.metricLabel}>MONTHLY REVENUE LOSS</Text>
          </View>
          
          <View style={[styles.metricCard, { borderColor: riskAssessment.color }]}>
            <Text style={[styles.metricValue, { color: riskAssessment.color }]}>
              {riskAssessment.grade}
            </Text>
            <Text style={styles.metricLabel}>IDENTITY HEALTH GRADE</Text>
          </View>
          
          <View style={[styles.metricCard, { borderColor: '#10B981' }]}>
            <Text style={[styles.metricValue, styles.successText]}>
              {formatExecutiveCurrency(results.incrementalRevenue)}
            </Text>
            <Text style={styles.metricLabel}>RECOVERY OPPORTUNITY</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.successText]}>ADFIXUS CAPI SOLUTION IMPACT</Text>
          <Text style={styles.body}>
            AdFixus Conversion API delivers advanced identity resolution capabilities that directly address 
            your revenue gaps. Through server-side data processing and enhanced tracking accuracy, 
            we project {formatExecutivePercent(results.incrementalPercentage)} annual revenue uplift.
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.metricCard, { borderColor: '#10B981' }]}>
            <Text style={[styles.metricValue, styles.successText]}>
              {formatExecutivePercent(results.incrementalPercentage)}
            </Text>
            <Text style={styles.metricLabel}>PROJECTED ANNUAL ROI</Text>
          </View>
          
          <View style={[styles.metricCard, { borderColor: '#0F172A' }]}>
            <Text style={[styles.metricValue, styles.primaryText]}>
              {formatExecutiveCurrency(results.projectedRevenue)}
            </Text>
            <Text style={styles.metricLabel}>NEW REVENUE TOTAL</Text>
          </View>
          
          <View style={[styles.metricCard, { borderColor: '#8B5CF6' }]}>
            <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>
              &lt; 3 months
            </Text>
            <Text style={styles.metricLabel}>PAYBACK PERIOD</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>CONFIDENTIAL - Executive Use Only</Text>
          <Text>Page 1</Text>
          <Text>Generated: {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* Page 2: Detailed Analysis */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image 
            src="/lovable-uploads/e05fe6e9-96d1-4dcc-9caa-0d7f03e785ed.png" 
            style={styles.logo}
          />
        </View>
        <Text style={styles.sectionTitle}>DETAILED REVENUE ANALYSIS</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.primaryText]}>REVENUE RECOVERY BY CHANNEL</Text>
          
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Channel</Text>
              <Text style={styles.tableCellHeader}>Current Revenue</Text>
              <Text style={styles.tableCellHeader}>Projected Revenue</Text>
              <Text style={styles.tableCellHeader}>Improvement</Text>
            </View>
            
            {channelData.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.channel}</Text>
                <Text style={styles.tableCell}>{formatExecutiveCurrency(row.current)}</Text>
                <Text style={styles.tableCell}>{formatExecutiveCurrency(row.projected)}</Text>
                <Text style={[styles.tableCell, styles.successText]}>
                  +{formatExecutiveCurrency(row.improvement)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: riskAssessment.color }]}>CURRENT RISK ASSESSMENT</Text>
          <Text style={styles.body}>
            Identity Health Grade: {riskAssessment.grade} - {riskAssessment.description}
            {'\n\n'}
            • Unaddressable Inventory: {inputs.chromePercentage.toFixed(1)}% of total traffic
            {'\n'}
            • Performance Campaign Impact: {inputs.performanceCampaignPercentage}% of revenue affected
            {'\n'}
            • Monthly Revenue Exposure: {formatExecutiveCurrency(monthlyLoss)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.successText]}>IMPLEMENTATION BENEFITS</Text>
          <Text style={styles.body}>
            • Enhanced cross-device user tracking and attribution
            {'\n'}
            • Improved conversion measurement accuracy by 25-40%
            {'\n'}
            • Reduced dependency on third-party cookies
            {'\n'}
            • Server-side data processing for better privacy compliance
            {'\n'}
            • Real-time optimization capabilities
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>CONFIDENTIAL - Executive Use Only</Text>
          <Text>Page 2</Text>
          <Text>Generated: {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* Page 3: Action Plan */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image 
            src="/lovable-uploads/e05fe6e9-96d1-4dcc-9caa-0d7f03e785ed.png" 
            style={styles.logo}
          />
        </View>
        <Text style={styles.sectionTitle}>STRATEGIC ACTION PLAN</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.primaryText]}>PRIORITY RECOMMENDATIONS</Text>
          
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.priorityCard}>
              <View style={[styles.priorityBadge, rec.bgStyle]}>
                <Text style={styles.priorityText}>{rec.priority}</Text>
              </View>
              <Text style={styles.actionTitle}>{rec.action}</Text>
              <Text style={styles.actionDetails}>
                Timeline: {rec.timeline} | Expected Impact: {rec.impact}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.primaryText]}>IMPLEMENTATION ROADMAP</Text>
          <Text style={styles.body}>
            Phase 1: Week 1-2: Technical setup and API integration
            {'\n'}
            Phase 2: Week 3-4: Testing and quality assurance
            {'\n'}
            Phase 3: Week 5-6: Full deployment and monitoring setup
            {'\n'}
            Phase 4: Week 7+: Performance optimization and scaling
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#8B5CF6' }]}>IMMEDIATE NEXT STEPS</Text>
          <Text style={styles.body}>
            1. Schedule technical consultation with AdFixus implementation team
            {'\n'}
            2. Review integration requirements and technical specifications
            {'\n'}
            3. Approve project timeline and resource allocation
            {'\n'}
            4. Initiate CAPI deployment process
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>CONFIDENTIAL - Executive Use Only</Text>
          <Text>Page 3</Text>
          <Text>Generated: {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
}