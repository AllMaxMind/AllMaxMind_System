// Email Sequence Orchestrator - Story 5.4
// Manages automated email sequences based on lead status

import { supabase } from '../supabaseClient';
import type { EmailContext, LeadStatus, EmailSequence, EmailQueueItem } from './types';
import { EMAIL_SEQUENCES_CONFIG } from './types';

/**
 * Start an email sequence for a lead based on their status
 */
export async function startEmailSequence(
  leadId: string,
  leadStatus: LeadStatus,
  context: EmailContext
): Promise<{ success: boolean; sequenceId?: string; error?: string }> {
  try {
    // Check if lead already has an active sequence
    const { data: existingSequence } = await supabase
      .from('email_sequences')
      .select('id, is_completed, unsubscribed')
      .eq('lead_id', leadId)
      .eq('is_completed', false)
      .single();

    if (existingSequence && !existingSequence.unsubscribed) {
      console.log(`[EmailSequence] Lead ${leadId} already has active sequence`);
      return { success: true, sequenceId: existingSequence.id };
    }

    // Create new email sequence record
    const { data: sequence, error: seqError } = await supabase
      .from('email_sequences')
      .insert({
        lead_id: leadId,
        lead_status: leadStatus,
        current_email_number: 0,
        next_send_at: new Date().toISOString(),
        is_completed: false,
        is_paused: false,
        unsubscribed: false,
      })
      .select()
      .single();

    if (seqError || !sequence) {
      throw new Error(`Failed to create sequence: ${seqError?.message}`);
    }

    // Get templates for this lead status
    const templates = EMAIL_SEQUENCES_CONFIG[leadStatus];

    // Add unsubscribe URL to context
    const enrichedContext: EmailContext = {
      ...context,
      unsubscribeUrl: `${import.meta.env.VITE_APP_URL || ''}/unsubscribe?lid=${leadId}`,
    };

    // Schedule all emails in the sequence
    const emailsToQueue = templates.map((template, index) => {
      const scheduledAt = new Date(
        Date.now() + template.delayMinutes * 60 * 1000
      ).toISOString();

      return {
        lead_id: leadId,
        sequence_id: sequence.id,
        template_id: template.id,
        template_name: template.name,
        scheduled_at: scheduledAt,
        context: enrichedContext,
        sent: false,
        retry_count: 0,
      };
    });

    const { error: queueError } = await supabase
      .from('email_queue')
      .insert(emailsToQueue);

    if (queueError) {
      throw new Error(`Failed to queue emails: ${queueError.message}`);
    }

    console.log(`[EmailSequence] Started sequence ${sequence.id} for lead ${leadId} with ${templates.length} emails`);

    return { success: true, sequenceId: sequence.id };
  } catch (error) {
    console.error('[EmailSequence] Error starting sequence:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Pause an email sequence
 */
export async function pauseEmailSequence(
  sequenceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('email_sequences')
      .update({ is_paused: true })
      .eq('id', sequenceId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[EmailSequence] Error pausing sequence:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Resume a paused email sequence
 */
export async function resumeEmailSequence(
  sequenceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('email_sequences')
      .update({ is_paused: false })
      .eq('id', sequenceId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[EmailSequence] Error resuming sequence:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Unsubscribe a lead from all email sequences
 */
export async function unsubscribeLead(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark all sequences as unsubscribed
    const { error: seqError } = await supabase
      .from('email_sequences')
      .update({ unsubscribed: true, is_paused: true })
      .eq('lead_id', leadId);

    if (seqError) throw seqError;

    // Delete pending emails from queue
    const { error: queueError } = await supabase
      .from('email_queue')
      .delete()
      .eq('lead_id', leadId)
      .eq('sent', false);

    if (queueError) throw queueError;

    console.log(`[EmailSequence] Lead ${leadId} unsubscribed`);
    return { success: true };
  } catch (error) {
    console.error('[EmailSequence] Error unsubscribing lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get sequence status for a lead
 */
export async function getSequenceStatus(
  leadId: string
): Promise<EmailSequence | null> {
  try {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as EmailSequence | null;
  } catch (error) {
    console.error('[EmailSequence] Error getting sequence status:', error);
    return null;
  }
}

/**
 * Get pending emails for a lead
 */
export async function getPendingEmails(
  leadId: string
): Promise<EmailQueueItem[]> {
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('lead_id', leadId)
      .eq('sent', false)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return (data as EmailQueueItem[]) || [];
  } catch (error) {
    console.error('[EmailSequence] Error getting pending emails:', error);
    return [];
  }
}

/**
 * Update lead status and potentially change email sequence
 */
export async function updateLeadStatusAndSequence(
  leadId: string,
  newScore: number,
  context: EmailContext
): Promise<{ success: boolean; newStatus?: LeadStatus; error?: string }> {
  try {
    // Calculate new status
    let newStatus: LeadStatus;
    if (newScore >= 75) {
      newStatus = 'quente';
    } else if (newScore >= 50) {
      newStatus = 'acompanhando';
    } else {
      newStatus = 'morno';
    }

    // Update lead score and status
    const { error: leadError } = await supabase
      .from('leads')
      .update({
        engagement_score: newScore,
        lead_status: newStatus
      })
      .eq('id', leadId);

    if (leadError) throw leadError;

    // Check if status changed - if so, may need to adjust sequence
    const currentSequence = await getSequenceStatus(leadId);

    if (currentSequence && currentSequence.lead_status !== newStatus && !currentSequence.is_completed) {
      console.log(`[EmailSequence] Lead ${leadId} status changed from ${currentSequence.lead_status} to ${newStatus}`);

      // For now, we let the current sequence complete
      // In future, could implement sequence switching logic here
    }

    return { success: true, newStatus };
  } catch (error) {
    console.error('[EmailSequence] Error updating lead status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
