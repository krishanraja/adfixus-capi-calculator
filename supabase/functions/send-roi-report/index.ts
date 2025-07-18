
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ROIReportRequest {
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
  };
  inputs: {
    annualRevenue: string;
    displayShare: number;
    videoShare: number;
    chromePercentage: number;
    performanceCampaignPercentage: number;
  };
  results: {
    currentRevenue: number;
    projectedRevenue: number;
    incrementalRevenue: number;
    incrementalPercentage: number;
    conversionImprovements: {
      displayImprovement: number;
      videoImprovement: number;
      retargetingImprovement: number;
    };
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Edge function invoked:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing email request...');
    
    // Parse request body
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { userInfo, inputs, results }: ROIReportRequest = requestBody;
    
    // Validate required data
    if (!userInfo) {
      throw new Error('Missing userInfo in request body');
    }
    
    if (!inputs) {
      throw new Error('Missing inputs in request body');
    }
    
    if (!results) {
      throw new Error('Missing results in request body');
    }
    
    console.log('Validated request data:', {
      userInfo,
      inputs,
      results: {
        currentRevenue: results.currentRevenue,
        projectedRevenue: results.projectedRevenue,
        incrementalRevenue: results.incrementalRevenue,
        incrementalPercentage: results.incrementalPercentage,
        hasConversionImprovements: !!results.conversionImprovements
      }
    });

    // Check API key
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    console.log('API key found:', apiKey.substring(0, 10) + '...');

    const emailContent = `
      <h2>CAPI Impact Report - ${userInfo.firstName} ${userInfo.lastName} from ${userInfo.company}</h2>
      
      <h3>User Information:</h3>
      <ul>
        <li><strong>First Name:</strong> ${userInfo.firstName}</li>
        <li><strong>Last Name:</strong> ${userInfo.lastName}</li>
        <li><strong>Email:</strong> ${userInfo.email}</li>
        <li><strong>Company:</strong> ${userInfo.company}</li>
      </ul>

      <h3>Input Parameters:</h3>
      <ul>
        <li><strong>Annual Revenue (excluding app inventory):</strong> ${formatCurrency(parseFloat(inputs.annualRevenue.replace(/,/g, '')))}</li>
        <li><strong>Display Share:</strong> ${inputs.displayShare}%</li>
        <li><strong>Video Share:</strong> ${inputs.videoShare}%</li>
        <li><strong>Chrome Inventory:</strong> ${inputs.chromePercentage}%</li>
        <li><strong>Performance Campaign Percentage:</strong> ${inputs.performanceCampaignPercentage}%</li>
      </ul>

      <h3>CAPI Impact Results:</h3>
      <ul>
        <li><strong>Current Revenue:</strong> ${formatCurrency(results.currentRevenue)}</li>
        <li><strong>Projected Revenue with CAPI:</strong> ${formatCurrency(results.projectedRevenue)}</li>
        <li><strong>Incremental Revenue:</strong> ${formatCurrency(results.incrementalRevenue)}</li>
        <li><strong>Incremental Percentage:</strong> ${results.incrementalPercentage.toFixed(1)}%</li>
      </ul>

      <h3>Channel Improvements:</h3>
      <ul>
        <li><strong>Display Improvement:</strong> ${formatCurrency(results.conversionImprovements.displayImprovement)}</li>
        <li><strong>Video Improvement:</strong> ${formatCurrency(results.conversionImprovements.videoImprovement)}</li>
        <li><strong>Retargeting Improvement:</strong> ${formatCurrency(results.conversionImprovements.retargetingImprovement)}</li>
      </ul>
    `;

    console.log('Sending email to:', userInfo.email);
    console.log('Email content length:', emailContent.length);

    const emailResponse = await resend.emails.send({
      from: "CAPI Calculator <onboarding@resend.dev>",
      to: ["hello@krishraja.com"],
      subject: `CAPI Report - ${userInfo.firstName} ${userInfo.lastName} - ${userInfo.company}`,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      emailResponse,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-roi-report function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
