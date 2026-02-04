/**
 * Email Provider - Resend Adapter
 * Story: SPRINT-1-P1
 */

import { Resend } from 'resend';
import type { Language } from '@/types/blueprint';

const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export interface EmailTemplate {
  name: string;
  subject: string;
  recipient_name: string;
  recipient_email: string;
  blueprint_title: string;
  blueprint_summary: string;
  pdf_url?: string;
  language: Language;
}

export async function sendBlueprintEmail(data: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!resendApiKey) {
      throw new Error('VITE_RESEND_API_KEY not configured');
    }

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>${data.language === 'pt-BR' ? 'Seu Blueprint Arquitetural' : 'Your Architectural Blueprint'}</h1>
          <p>${data.language === 'pt-BR' ? 'Olá' : 'Hello'} ${data.recipient_name},</p>
          <p>${data.language === 'pt-BR' ? 'Seu blueprint foi gerado com sucesso!' : 'Your blueprint has been successfully generated!'}</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>${data.blueprint_title}</h2>
            <p>${data.blueprint_summary.substring(0, 200)}...</p>
          </div>

          ${data.pdf_url ? `<a href="${data.pdf_url}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none;">Download</a>` : ''}

          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">Automated email</p>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: 'noreply@maxmind.tech',
      to: data.recipient_email,
      subject: data.subject,
      html: htmlContent
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message
      };
    }

    return {
      success: true,
      messageId: response.data?.id
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendBulkEmails(emails: EmailTemplate[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendBlueprintEmail(email);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
