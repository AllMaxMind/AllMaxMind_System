/**
 * Email Service Module
 * Provides client-side wrapper for sending emails via Edge Function
 * Email sending is handled by supabase/functions/send-email
 */

export interface SendEmailParams {
  to: string;
  templateType: 'lead-confirmation' | 'blueprint-delivery';
  data: {
    name: string;
    company: string;
    blueprintUrl: string;
    magicLinkUrl?: string;
  };
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Edge Function
 * Non-blocking operation - errors don't prevent lead creation
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<SendEmailResponse> {
  try {
    // Call Edge Function that has access to service role key
    const response = await fetch('/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    console.log(
      `[Email] Sent ${params.templateType} to ${params.to}`
    );

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    console.error('[Email] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
