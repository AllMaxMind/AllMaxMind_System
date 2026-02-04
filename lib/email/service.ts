/**
 * Email Service Module
 * Provides client-side wrapper for sending emails via Edge Function
 * Email sending is handled by supabase/functions/send-email
 */
import { supabase } from '../supabaseClient';

export interface SendEmailParams {
  to: string;
  templateType: 'lead_confirmation' | 'blueprint_delivery';
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
    // Call Edge Function using Supabase client
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.to,
        templateType: params.templateType,
        data: params.data,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Email service returned error');
    }

    console.log(
      `[Email] Sent ${params.templateType} to ${params.to}`
    );

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error: any) {
    console.error('[Email] Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
