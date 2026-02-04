import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const WHATSAPP_API_VERSION = "v18.0";
const WHATSAPP_GRAPH_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  leadId: string;
  phone: string;
  leadName?: string;
  companyName?: string;
  templateName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: WhatsAppRequest = await req.json();
    const { leadId, phone, leadName, companyName, templateName = "lead_welcome" } = body;

    // Validate required fields
    if (!leadId || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: leadId and phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get API credentials from environment
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const apiToken = Deno.env.get("WHATSAPP_API_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Check if WhatsApp is configured
    if (!phoneNumberId || !apiToken) {
      console.log("[WhatsApp] API not configured, skipping message send");

      // Still update lead with phone number even if WhatsApp not configured
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("leads")
          .update({
            whatsapp_phone: phone.replace(/\D/g, ""),
            whatsapp_added: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", leadId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          configured: false,
          message: "WhatsApp not configured. Phone saved for future use.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number (remove non-digits, ensure +55 prefix)
    let cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("55")) {
      cleanPhone = "55" + cleanPhone;
    }

    // Validate Brazilian phone format
    if (cleanPhone.length < 12 || cleanPhone.length > 13) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid phone format. Expected Brazilian format: +55 XX XXXXX-XXXX",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[WhatsApp] Sending template message to ${cleanPhone}`);

    // Build template payload
    const templatePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "pt_BR",
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: leadName || "Prospect" },
              { type: "text", text: companyName || "sua empresa" },
            ],
          },
        ],
      },
    };

    // Send message via WhatsApp Cloud API
    const whatsappResponse = await fetch(
      `${WHATSAPP_GRAPH_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      }
    );

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error("[WhatsApp] API error:", whatsappResult);

      // Common error handling
      const errorMessage = whatsappResult.error?.message || "Failed to send WhatsApp message";
      const errorCode = whatsappResult.error?.code;

      // Still save phone even if message failed
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from("leads")
          .update({
            whatsapp_phone: cleanPhone,
            whatsapp_added: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", leadId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          code: errorCode,
          phoneSaved: true,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messageId = whatsappResult.messages?.[0]?.id;
    console.log(`[WhatsApp] Message sent successfully. ID: ${messageId}`);

    // Update lead in database
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update lead
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          whatsapp_phone: cleanPhone,
          whatsapp_added: true,
          whatsapp_message_id: messageId,
          whatsapp_template_used: templateName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (updateError) {
        console.error("[WhatsApp] Database update error:", updateError);
      }

      // Log interaction (if table exists)
      try {
        await supabase.from("lead_interactions").insert([
          {
            lead_id: leadId,
            interaction_type: "whatsapp_message_sent",
            step_number: 5,
            data: {
              phone: cleanPhone,
              message_id: messageId,
              template: templateName,
            },
          },
        ]);
      } catch (e) {
        // Table might not exist
        console.log("[WhatsApp] Could not log interaction:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        message: "WhatsApp message sent successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[WhatsApp] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unexpected error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
