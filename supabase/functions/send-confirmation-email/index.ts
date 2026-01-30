import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Declare Deno to avoid type errors
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id, x-supabase-client-platform, x-supabase-client-version',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, leadId } = await req.json()

    console.log(`[send-confirmation-email] Processing request for: ${email}, leadId: ${leadId}`)

    if (!email || !leadId) {
      throw new Error('Email and leadId are required')
    }

    // TODO: Implement actual email sending with Resend, SendGrid, or similar
    // For now, just log and return success

    // Example future implementation:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    // if (RESEND_API_KEY) {
    //   await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${RESEND_API_KEY}`,
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       from: 'noreply@allmaxmind.com',
    //       to: email,
    //       subject: 'Seu Blueprint está pronto!',
    //       html: `<p>Obrigado pelo seu interesse...</p>`
    //     })
    //   })
    // }

    console.log(`[send-confirmation-email] ✅ Email queued for: ${email}`)

    return new Response(JSON.stringify({
      success: true,
      message: 'Email queued successfully',
      email,
      leadId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("[send-confirmation-email] Error:", error)
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
