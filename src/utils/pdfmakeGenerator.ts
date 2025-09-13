import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { ROIResults, ROIInputs } from "@/types/roi";

// Professional formatting for executives
export const formatExecutiveCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

export const formatExecutivePercent = (percent: number): string => {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
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

// Set up pdfMake fonts
try {
  if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts) {
    pdfMake.vfs = pdfFonts;
  }
} catch (error) {
  // Font loading failed - continue without custom fonts
}

// Convert URL to base64
async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // Return a placeholder or empty data URL if conversion fails
    return "data:image/png;base64,";
  }
}

export async function buildAdfixusProposalPdf(inputs: ROIInputs, results: ROIResults): Promise<void> {
  try {
    // Convert logo to base64
    const logoDataUrl = await urlToBase64("/lovable-uploads/e05fe6e9-96d1-4dcc-9caa-0d7f03e785ed.png");
    
    // Calculate key metrics for the executive summary
    const monthlyRevenueLoss = (results.currentRevenue - results.projectedRevenue) / -12;
    const riskAssessment = getRiskGrade(inputs.chromePercentage);
    const recoveryOpportunity = results.incrementalRevenue;
    
    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      info: {
        title: "AdFixus - CAPI Proposal for Publishers",
        subject: "Executive Report - Revenue Impact Analysis",
        creator: "AdFixus"
      },
      header: (currentPage: number) => ({
        columns: [
          { 
            image: logoDataUrl, 
            fit: [120, 32], 
            margin: [40, 20, 0, 0] 
          },
          { 
            text: "AdFixus - CAPI Proposal for Publishers", 
            style: "headerTitle", 
            alignment: "right", 
            margin: [0, 22, 40, 0] 
          }
        ]
      }),
      footer: (currentPage: number, pageCount: number) => ({
        columns: [
          { 
            text: "CONFIDENTIAL - Executive Use Only", 
            style: "foot", 
            margin: [40, 0, 0, 0] 
          },
          { 
            text: `${currentPage} of ${pageCount}`, 
            style: "foot", 
            alignment: "right", 
            margin: [0, 0, 40, 0] 
          }
        ],
        margin: [0, 10]
      }),
      styles: {
        h1: { 
          fontSize: 16, 
          bold: true, 
          color: "#1E293B", 
          margin: [0, 0, 0, 12] 
        },
        h2: { 
          fontSize: 13, 
          bold: true, 
          color: "#1E293B", 
          margin: [0, 12, 0, 6] 
        },
        body: { 
          fontSize: 10, 
          color: "#475569", 
          lineHeight: 1.25,
          margin: [0, 0, 0, 6]
        },
        kpiLabel: { 
          fontSize: 9, 
          color: "#475569",
          alignment: "center" 
        },
        kpiValue: { 
          fontSize: 14, 
          bold: true, 
          color: "#1E293B",
          alignment: "center" 
        },
        foot: { 
          fontSize: 8, 
          color: "#475569" 
        },
        tableHeader: { 
          bold: true, 
          fillColor: "#F8FAFC",
          color: "#1E293B",
          fontSize: 9
        },
        tableBody: {
          fontSize: 9,
          color: "#475569"
        },
        headerTitle: {
          fontSize: 14,
          bold: true,
          color: "#1E293B"
        },
        priority: {
          fontSize: 9,
          margin: [0, 2, 0, 2]
        }
      },
      defaultStyle: { 
        fontSize: 10,
        color: "#475569"
      },

      content: [
        // Page 1 - Executive Summary
        {
          unbreakable: true,
          margin: [0, 10, 0, 20],
          stack: [
            { text: "Executive Summary", style: "h1" },
            
            // Problem Statement
            { 
              text: "Current State: Revenue at Risk", 
              style: "h2" 
            },
            { 
              text: `Your current Chrome traffic represents ${inputs.chromePercentage}% of total volume, creating significant addressability gaps. Third-party cookie deprecation has reduced conversion tracking accuracy, leading to suboptimal campaign performance and revenue leakage across your advertising inventory.`,
              style: "body" 
            },
            
            // Solution Overview
            { 
              text: "AdFixus Solution: Conversion API Implementation", 
              style: "h2" 
            },
            { 
              text: "Our Conversion API (CAPI) solution restores identity resolution through server-side tracking, enabling precise attribution and improved campaign optimization. This technology bridges the privacy-first gap while maintaining revenue performance.",
              style: "body" 
            },
            
            // ROI Projection
            { 
              text: "Revenue Impact Projection", 
              style: "h2" 
            },
            { 
              text: `Implementation of AdFixus CAPI is projected to generate ${formatExecutivePercent(results.incrementalPercentage)} revenue uplift within 45-60 days, translating to ${formatExecutiveCurrency(results.incrementalRevenue)} in annual incremental revenue.`,
              style: "body",
              margin: [0, 0, 0, 15]
            },
            
            // KPI Cards
            {
              columns: [
                {
                  width: "*",
                  margin: [0, 0, 8, 0],
                  table: {
                    widths: ["*"],
                    body: [
                      [{ text: "Monthly Revenue Loss", style: "kpiLabel" }],
                      [{ text: formatExecutiveCurrency(monthlyRevenueLoss), style: "kpiValue", color: "#EF4444" }]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => "#E2E8F0",
                    vLineColor: () => "#E2E8F0"
                  }
                },
                {
                  width: "*",
                  margin: [4, 0, 4, 0],
                  table: {
                    widths: ["*"],
                    body: [
                      [{ text: "Identity Health Grade", style: "kpiLabel" }],
                      [{ text: riskAssessment.grade, style: "kpiValue", color: riskAssessment.color }]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => "#E2E8F0",
                    vLineColor: () => "#E2E8F0"
                  }
                },
                {
                  width: "*",
                  margin: [8, 0, 0, 0],
                  table: {
                    widths: ["*"],
                    body: [
                      [{ text: "Recovery Opportunity", style: "kpiLabel" }],
                      [{ text: formatExecutiveCurrency(recoveryOpportunity), style: "kpiValue", color: "#10B981" }]
                    ]
                  },
                  layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => "#E2E8F0",
                    vLineColor: () => "#E2E8F0"
                  }
                }
              ],
              columnGap: 8
            },
            
            // Contact Information in Executive Summary
            { 
              text: "Contact AdFixus Sales Team", 
              style: "h2",
              margin: [0, 20, 0, 6]
            },
            {
              stack: [
                { 
                  text: "Email: sales@adfixus.com", 
                  style: "body",
                  margin: [0, 0, 0, 3]
                },
                {
                  text: "Book A Call",
                  style: "body",
                  link: "https://outlook.office.com/book/SalesTeambooking@adfixus.com",
                  color: "#0EA5E9",
                  decoration: "underline",
                  bold: true
                }
              ]
            }
          ]
        },

        // Page 2 - Detailed Revenue Analysis
        { text: "", pageBreak: "before" },
        {
          unbreakable: true,
          margin: [0, 0, 0, 20],
          stack: [
            { text: "Detailed Revenue Analysis", style: "h1" },
            
            // Risk Assessment Narrative
            { 
              text: "Current Risk Assessment", 
              style: "h2" 
            },
            { 
              text: `Your current identity resolution capability shows a ${riskAssessment.grade} grade (${riskAssessment.description.toLowerCase()}). This assessment is based on Chrome traffic percentage and its impact on addressable inventory across your ad stack.`,
              style: "body",
              margin: [0, 0, 0, 12]
            },
            
            // Revenue Breakdown Table
            { 
              text: "Revenue Impact by Channel", 
              style: "h2" 
            },
            {
              table: {
                headerRows: 1,
                widths: ["25%", "25%", "25%", "25%"],
                body: [
                  [
                    { text: "Channel", style: "tableHeader" },
                    { text: "Current Revenue", style: "tableHeader" },
                    { text: "Projected Revenue", style: "tableHeader" },
                    { text: "Uplift", style: "tableHeader" }
                  ],
                  [
                    { text: "Display Advertising", style: "tableBody" },
                    { text: formatExecutiveCurrency(results.currentDisplayRevenue), style: "tableBody" },
                    { text: formatExecutiveCurrency(results.projectedDisplayRevenue), style: "tableBody" },
                    { text: formatExecutivePercent((results.conversionImprovements.displayImprovement / results.currentDisplayRevenue) * 100), style: "tableBody", color: "#10B981" }
                  ],
                  [
                    { text: "Video Advertising", style: "tableBody" },
                    { text: formatExecutiveCurrency(results.currentVideoRevenue), style: "tableBody" },
                    { text: formatExecutiveCurrency(results.projectedVideoRevenue), style: "tableBody" },
                    { text: formatExecutivePercent((results.conversionImprovements.videoImprovement / results.currentVideoRevenue) * 100), style: "tableBody", color: "#10B981" }
                  ],
                  [
                    { text: "Retargeting", style: "tableBody" },
                    { text: formatExecutiveCurrency(results.currentRetargetingRevenue), style: "tableBody" },
                    { text: formatExecutiveCurrency(results.projectedRetargetingRevenue), style: "tableBody" },
                    { text: formatExecutivePercent((results.conversionImprovements.retargetingImprovement / results.currentRetargetingRevenue) * 100), style: "tableBody", color: "#10B981" }
                  ],
                  [
                    { text: "TOTAL", style: "tableHeader" },
                    { text: formatExecutiveCurrency(results.currentRevenue), style: "tableHeader" },
                    { text: formatExecutiveCurrency(results.projectedRevenue), style: "tableHeader" },
                    { text: formatExecutivePercent(results.incrementalPercentage), style: "tableHeader", color: "#10B981" }
                  ]
                ]
              },
              layout: {
                fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? null : "#F8FAFC")
              },
              margin: [0, 0, 0, 12]
            },
            
            // Implementation Benefits
            { 
              text: "Key Implementation Benefits", 
              style: "h2" 
            },
            {
              ul: [
                "Restored conversion visibility in cookieless environments",
                "Enhanced campaign optimization through improved attribution",
                "Increased advertiser demand and higher CPMs",
                "Future-proof revenue stream against privacy regulations",
                "Improved audience targeting and lookalike modeling"
              ],
              style: "body"
            }
          ]
        },

        // Page 3 - Strategic Action Plan
        { text: "", pageBreak: "before" },
        {
          unbreakable: true,
          stack: [
            { text: "Strategic Action Plan", style: "h1" },
            
            // Priority Recommendations
            { text: "Priority Recommendations", style: "h2" },
            {
              table: {
                widths: ["15%", "70%", "15%"],
                body: [
                  [
                    { text: "HIGH", style: "priority", fillColor: "#FEE2E2", color: "#DC2626", bold: true },
                    { text: "Immediate CAPI deployment on top 3 revenue-generating domains", style: "priority" },
                    { text: "Week 1-2", style: "priority", alignment: "center" }
                  ],
                  [
                    { text: "MEDIUM", style: "priority", fillColor: "#FEF3C7", color: "#D97706", bold: true },
                    { text: "Advertiser onboarding and demand partner optimization", style: "priority" },
                    { text: "Week 3-4", style: "priority", alignment: "center" }
                  ],
                  [
                    { text: "LOW", style: "priority", fillColor: "#D1FAE5", color: "#059669", bold: true },
                    { text: "Advanced attribution modeling and audience expansion", style: "priority" },
                    { text: "Week 5-8", style: "priority", alignment: "center" }
                  ]
                ]
              },
              layout: "noBorders",
              margin: [0, 0, 0, 15]
            },
            
            // Implementation Timeline
            { text: "Implementation Roadmap", style: "h2" },
            {
              ol: [
                "Week 1: Technical integration and initial CAPI setup",
                "Week 2-3: Quality assurance testing and gradual traffic ramp",
                "Week 4: Full deployment and advertiser demand optimization", 
                "Week 5-6: Performance monitoring and fine-tuning",
                "Week 7-8: Advanced features rollout and reporting setup"
              ],
              style: "body",
              margin: [0, 0, 0, 15]
            },
            
            // Next Steps
            { text: "Immediate Next Steps", style: "h2" },
            {
              ol: [
                "Secure executive approval for AdFixus CAPI implementation",
                "Confirm pilot domain selection and technical requirements",
                "Establish baseline KPI measurement and reporting framework",
                "Contact AdFixus implementation team to schedule technical onboarding",
                "Define go-live timeline and success metrics"
              ],
              style: "body",
              margin: [0, 0, 0, 12]
            },
            
            // Contact Information
            { text: "Contact AdFixus Sales Team", style: "h2" },
            {
              stack: [
                { 
                  text: "Email: sales@adfixus.com", 
                  style: "body",
                  link: "mailto:sales@adfixus.com",
                  color: "#0EA5E9",
                  decoration: "underline",
                  margin: [0, 0, 0, 6]
                },
                {
                  text: "Book A Call",
                  style: "body",
                  link: "https://outlook.office.com/book/SalesTeambooking@adfixus.com",
                  color: "#0EA5E9",
                  decoration: "underline",
                  bold: true
                }
              ]
            }
          ]
        }
      ]
    };

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download("AdFixus - CAPI Proposal for Publishers.pdf");
    
  } catch (error) {
    throw error;
  }
}