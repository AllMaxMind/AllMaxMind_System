import { supabase } from '../supabaseClient';
import { Phase5FormData } from '../../components/phases/Phase5/Phase5';
import { LeadStatus } from './scorer';
import { startEmailSequence, type EmailContext, type LeadStatus as EmailLeadStatus } from '../email';

/**
 * Mark Phase 5 as started for a lead
 */
export async function startPhase5(leadId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('leads')
      .update({
        phase5_started_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) throw error;
    console.log('[Phase5] Started for lead:', leadId);
  } catch (error) {
    console.error('[Phase5] Error starting phase5:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Update lead with Phase 5 step data
 */
export async function updateLeadPhase5Data(
  leadId: string,
  stepNumber: number,
  formData: Phase5FormData
): Promise<void> {
  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Add step-specific data
    switch (stepNumber) {
      case 1:
        updateData.feedback_score = formData.feedbackScore;
        break;
      case 2:
        updateData.budget_range = formData.budgetRange;
        break;
      case 3:
        updateData.project_timeline_estimated = formData.projectTimeline;
        break;
      case 4:
        if (formData.scheduleDate) {
          updateData.scheduled_call = formData.scheduleDate.toISOString();
          updateData.prototype_commitment = true;
        }
        break;
      case 5:
        if (formData.whatsappPhone) {
          updateData.whatsapp_phone = formData.whatsappPhone.replace(/\D/g, '');
          updateData.whatsapp_added = true;
        }
        updateData.phase5_completed_at = new Date().toISOString();
        break;
    }

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId);

    if (error) throw error;
    console.log(`[Phase5] Step ${stepNumber} saved for lead:`, leadId);
  } catch (error) {
    console.error('[Phase5] Error updating lead:', error);
    throw error;
  }
}

/**
 * Update lead score and status
 */
export async function updateLeadScore(
  leadId: string,
  score: number,
  status: LeadStatus
): Promise<void> {
  try {
    const { error } = await supabase
      .from('leads')
      .update({
        engagement_score: score,
        lead_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) throw error;
    console.log(`[Phase5] Score updated for lead ${leadId}: ${score} (${status})`);
  } catch (error) {
    console.error('[Phase5] Error updating score:', error);
    throw error;
  }
}

/**
 * Log Phase 5 interaction
 */
export async function logInteraction(
  leadId: string,
  interactionType: string,
  stepNumber: number,
  data?: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('lead_interactions')
      .insert([
        {
          lead_id: leadId,
          interaction_type: interactionType,
          step_number: stepNumber,
          data: data || {},
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      // Table might not exist yet - log but don't fail
      console.warn('[Phase5] Could not log interaction (table may not exist):', error.message);
    }
  } catch (error) {
    console.warn('[Phase5] Error logging interaction:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Complete Phase 5 and trigger post-completion actions
 */
export async function completePhase5(
  leadId: string,
  finalScore: number,
  finalStatus: LeadStatus,
  leadData?: {
    name: string;
    email: string;
    company: string;
    blueprintTitle: string;
    problemStatement: string;
  }
): Promise<void> {
  try {
    await updateLeadScore(leadId, finalScore, finalStatus);

    // Log completion
    await logInteraction(leadId, 'phase5_completed', 5, {
      final_score: finalScore,
      final_status: finalStatus,
    });

    // Start email sequence based on lead status
    if (leadData) {
      const emailContext: EmailContext = {
        leadId,
        leadName: leadData.name,
        leadEmail: leadData.email,
        companyName: leadData.company,
        blueprintTitle: leadData.blueprintTitle,
        problemStatement: leadData.problemStatement,
        leadScore: finalScore,
        leadStatus: finalStatus as EmailLeadStatus,
        scheduleUrl: `${import.meta.env.VITE_APP_URL || ''}/blueprint/${leadId}`,
        caseStudyUrl: `${import.meta.env.VITE_APP_URL || ''}/cases`,
      };

      const result = await startEmailSequence(leadId, finalStatus as EmailLeadStatus, emailContext);

      if (result.success) {
        console.log(`[Phase5] Email sequence started for lead ${leadId} (${finalStatus})`);
      } else {
        console.error('[Phase5] Failed to start email sequence:', result.error);
      }
    }

    // Log for hot leads
    if (finalStatus === 'quente') {
      console.log('[Phase5] Hot lead detected! Sales sequence initiated.');
    }
  } catch (error) {
    console.error('[Phase5] Error completing phase5:', error);
    throw error;
  }
}
