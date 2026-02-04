// Send Email Edge Function - Production Ready with Resend
// Handles lead confirmation, blueprint delivery, and prototype offer emails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'
import { Resend } from 'npm:resend@^2.0.0'
import {
  leadConfirmationTemplate,
  blueprintDeliveryTemplate,
  prototypeOfferTemplate,
  type TemplateType,
  type LeadConfirmationData,
  type BlueprintDeliveryData,
  type PrototypeOfferData,
} from './templates/index.ts'

declare const Deno: any;

// Initialize Resend client
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_EMAILS = 100 // per domain per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Template renderer map
const TEMPLATES: Record<TemplateType, (data: any) => { subject: string; html: string }> = {
  lead_confirmation: leadConfirmationTemplate,
  blueprint_delivery: blueprintDeliveryTemplate,
  prototype_offer: prototypeOfferTemplate,
}

// Email sender configuration
const FROM_EMAIL = 'All Max Mind <noreply@allmaxmind.com>'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Initialize Supabase admin client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server configuration error: Supabase credentials not found'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { to, templateType, data } = await req.json()

    // Validate required fields
    if (!to || !templateType) {
      throw new Error('to and templateType are required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email format')
    }

    // Validate template type
    if (!TEMPLATES[templateType as TemplateType]) {
      throw new Error(`Unknown template type: ${templateType}. Valid types: ${Object.keys(TEMPLATES).join(', ')}`)
    }

    // Check rate limit
    const domain = to.split('@')[1]
    const rateLimitResult = checkRateLimit(domain)
    if (!rateLimitResult.allowed) {
      console.warn(`[send-email] Rate limit exceeded for domain: ${domain}`)
      await logEmail(supabaseAdmin, to, templateType, 'rate_limited', null, 'Rate limit exceeded')
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[send-email] Processing ${templateType} to ${to}`)

    // Generate template content
    const template = TEMPLATES[templateType as TemplateType](data)

    // Check if Resend is configured
    if (!resend) {
      console.warn('[send-email] RESEND_API_KEY not configured - logging email only')
      await logEmail(supabaseAdmin, to, templateType, 'stub', null, 'Resend not configured')

      return new Response(JSON.stringify({
        success: true,
        messageId: `stub-${Date.now()}`,
        warning: 'Email logged but not sent (Resend not configured)'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send email with retry logic
    let lastError: Error | null = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[send-email] Attempt ${attempt}/${maxRetries}`)

        const { data: emailData, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: [to],
          subject: template.subject,
          html: template.html,
        })

        if (error) {
          throw new Error(error.message || 'Resend API error')
        }

        // Log success
        await logEmail(supabaseAdmin, to, templateType, 'sent', emailData?.id || null)

        console.log(`[send-email] Success - Message ID: ${emailData?.id}`)

        return new Response(JSON.stringify({
          success: true,
          messageId: emailData?.id,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      } catch (err: any) {
        lastError = err
        console.error(`[send-email] Attempt ${attempt} failed:`, err.message)

        // Don't retry on certain errors
        if (err.message?.includes('Invalid email') || err.message?.includes('blocked')) {
          break
        }

        // Exponential backoff
        if (attempt < maxRetries) {
          const backoffMs = 1000 * Math.pow(2, attempt - 1) // 1s, 2s, 4s
          await new Promise(r => setTimeout(r, backoffMs))
        }
      }
    }

    // All retries failed
    console.error(`[send-email] All ${maxRetries} attempts failed for ${to}`)
    await logEmail(supabaseAdmin, to, templateType, 'failed', null, lastError?.message || 'Unknown error')

    return new Response(JSON.stringify({
      success: false,
      error: `Failed to send email after ${maxRetries} attempts: ${lastError?.message}`,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('[send-email] Error:', error)

    // Try to log the error
    try {
      const { to, templateType } = await req.clone().json()
      if (to && templateType) {
        await logEmail(supabaseAdmin, to, templateType, 'error', null, error.message)
      }
    } catch {
      // Ignore logging errors
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

/**
 * Check rate limit for a domain
 */
function checkRateLimit(domain: string): { allowed: boolean; resetAt: number } {
  const now = Date.now()
  const existing = rateLimitMap.get(domain)

  if (!existing || now > existing.resetAt) {
    // Reset or create new window
    rateLimitMap.set(domain, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    })
    return { allowed: true, resetAt: now + RATE_LIMIT_WINDOW_MS }
  }

  if (existing.count >= RATE_LIMIT_MAX_EMAILS) {
    return { allowed: false, resetAt: existing.resetAt }
  }

  existing.count++
  return { allowed: true, resetAt: existing.resetAt }
}

/**
 * Log email send attempt to Supabase
 */
async function logEmail(
  supabase: any,
  toEmail: string,
  templateType: string,
  status: 'sent' | 'failed' | 'error' | 'stub' | 'rate_limited',
  messageId: string | null,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('email_logs').insert({
      to_email: toEmail,
      template_type: templateType,
      status,
      message_id: messageId,
      error_message: errorMessage || null,
      created_at: new Date().toISOString()
    })
  } catch (err) {
    console.error('[send-email] Failed to log email:', err)
  }
}
