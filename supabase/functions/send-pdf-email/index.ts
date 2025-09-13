import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  contactForm: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
  };
  inputs: {
    annualRevenue: number;
    chromePercentage: number;
    displayShare: number;
    videoShare: number;
    performanceCampaignPercentage: number;
  };
  results: {
    currentRevenue: number;
    projectedRevenue: number;
    incrementalRevenue: number;
    incrementalPercentage: number;
    currentDisplayRevenue: number;
    projectedDisplayRevenue: number;
    currentVideoRevenue: number;
    projectedVideoRevenue: number;
    currentRetargetingRevenue: number;
    projectedRetargetingRevenue: number;
    conversionImprovements: {
      displayImprovement: number;
      videoImprovement: number;
      retargetingImprovement: number;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body received:", JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate required fields
    const { contactForm, inputs, results } = requestBody;
    
    if (!contactForm || !contactForm.email || !contactForm.firstName || !contactForm.lastName || !contactForm.company) {
      console.error("Missing or invalid contactForm data:", contactForm);
      return new Response(
        JSON.stringify({ error: "Missing contact form data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!inputs || !results) {
      console.error("Missing inputs or results data");
      return new Response(
        JSON.stringify({ error: "Missing calculator data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending PDF email for:", contactForm.email);

    // Format currency for display
    const formatCurrency = (amount: number): string => {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
      return `$${amount.toFixed(0)}`;
    };

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1E293B; border-bottom: 3px solid #0EA5E9; padding-bottom: 10px;">
              AdFixus CAPI ROI Analysis - ${contactForm.company}
            </h1>
            
            <h2 style="color: #1E293B;">Contact Information</h2>
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Name:</strong> ${contactForm.firstName} ${contactForm.lastName}</p>
              <p><strong>Email:</strong> ${contactForm.email}</p>
              <p><strong>Company:</strong> ${contactForm.company}</p>
            </div>

            <h2 style="color: #1E293B;">Calculator Inputs</h2>
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Annual Revenue:</strong> ${formatCurrency(inputs.annualRevenue)}</p>
              <p><strong>Chrome Traffic:</strong> ${inputs.chromePercentage}%</p>
              <p><strong>Display Campaign Share:</strong> ${inputs.displayShare}%</p>
              <p><strong>Video Campaign Share:</strong> ${inputs.videoShare}%</p>
              <p><strong>Performance Campaign Percentage:</strong> ${inputs.performanceCampaignPercentage}%</p>
            </div>

            <h2 style="color: #1E293B;">ROI Analysis Results</h2>
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Current Annual Revenue:</strong> ${formatCurrency(results.currentRevenue)}</p>
              <p><strong>Projected Annual Revenue:</strong> ${formatCurrency(results.projectedRevenue)}</p>
              <p><strong>Incremental Revenue:</strong> <span style="color: #10B981; font-weight: bold;">${formatCurrency(results.incrementalRevenue)}</span></p>
              <p><strong>Revenue Uplift:</strong> <span style="color: #10B981; font-weight: bold;">+${results.incrementalPercentage.toFixed(1)}%</span></p>
            </div>

            <h2 style="color: #1E293B;">Revenue Improvements by Channel</h2>
            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Display:</strong> ${formatCurrency(results.currentDisplayRevenue)} → ${formatCurrency(results.projectedDisplayRevenue)} 
                 <span style="color: #10B981;">(+${formatCurrency(results.conversionImprovements.displayImprovement)})</span></p>
              <p><strong>Video:</strong> ${formatCurrency(results.currentVideoRevenue)} → ${formatCurrency(results.projectedVideoRevenue)} 
                 <span style="color: #10B981;">(+${formatCurrency(results.conversionImprovements.videoImprovement)})</span></p>
              <p><strong>Retargeting:</strong> ${formatCurrency(results.currentRetargetingRevenue)} → ${formatCurrency(results.projectedRetargetingRevenue)} 
                 <span style="color: #10B981;">(+${formatCurrency(results.conversionImprovements.retargetingImprovement)})</span></p>
            </div>

            <div style="border-top: 2px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #64748B; font-size: 14px;">
                This analysis was generated using the AdFixus CAPI ROI Calculator. The user has downloaded the detailed PDF proposal.
              </p>
              <p style="color: #64748B; font-size: 14px;">
                <strong>Contact AdFixus Sales Team:</strong><br>
                Email: <a href="mailto:sales@adfixus.com" style="color: #0EA5E9;">sales@adfixus.com</a><br>
                <a href="https://outlook.office.com/book/SalesTeambooking@adfixus.com" style="color: #0EA5E9;">Book A Call</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email with better error handling
    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: "AdFixus Calculator <onboarding@resend.dev>",
        to: ["hello@krishraja.com"],
        subject: `New CAPI ROI Analysis - ${contactForm.company} (${contactForm.firstName} ${contactForm.lastName})`,
        html: emailHtml,
        replyTo: contactForm.email,
      });
      console.log("Email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-pdf-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

// Function version: 2.0 - Updated 2025-01-13