import { supabase } from '../supabaseClient';
import { sendEmail } from '../email/service';

interface LeadData {
  problemId: string;
  blueprintId?: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  jobTitle?: string;
  contactPreference: 'whatsapp' | 'email' | 'phone';
  acceptTerms: boolean;
  acceptMarketing: boolean;
  complexity: 'small' | 'medium' | 'large';
  source?: string;
  campaign?: string;
}

export const saveLeadToSupabase = async (leadData: LeadData): Promise<string> => {
  // Rate limiting por email
  const rateLimitKey = `lead_submission_${leadData.email}`;
  const lastSubmission = localStorage.getItem(rateLimitKey);
  
  if (lastSubmission) {
    const timeSince = Date.now() - parseInt(lastSubmission);
    if (timeSince < 5 * 60 * 1000) { // 5 minutos
      throw new Error('Aguarde 5 minutos entre envios');
    }
  }
  
  localStorage.setItem(rateLimitKey, Date.now().toString());

  try {
    // Calcular lead score
    const leadScore = calculateLeadScore(leadData);

    // Validar se blueprintId é um UUID válido (não aceita IDs temporários)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validBlueprintId = leadData.blueprintId && uuidRegex.test(leadData.blueprintId)
      ? leadData.blueprintId
      : null;

    // Inserir lead
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        blueprint_id: validBlueprintId,
        user_email: leadData.email,
        user_name: leadData.name,
        company_name: leadData.company,
        phone: leadData.phone,
        job_title: leadData.jobTitle,
        contact_preference: leadData.contactPreference,
        
        // Status e scoring
        lead_status: 'morno',
        lead_score: leadScore,
        
        // Metadados do projeto
        project_size_estimated: leadData.complexity,
        project_timeline_estimated: leadData.complexity === 'small' ? 15 : leadData.complexity === 'medium' ? 30 : 60,
        
        // Tracking
        source: leadData.source || 'organic',
        campaign: leadData.campaign,
        accept_marketing: leadData.acceptMarketing,
        
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) throw error;

    // Enviar email de confirmação (non-blocking)
    if (data?.id) {
      try {
        const emailResult = await sendEmail({
          to: leadData.email,
          templateType: 'lead-confirmation',
          data: {
            name: leadData.name,
            company: leadData.company,
            blueprintUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/blueprint/${validBlueprintId || 'preview'}`,
            magicLinkUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/magic-link`,
          },
        });

        if (!emailResult.success) {
          console.warn('[Leads] Email failed but lead saved:', emailResult.error);
          // Ainda assim registrar evento GA4
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: 'email_send_failed',
              lead_id: data.id,
              error: emailResult.error,
            });
          }
        }
      } catch (emailError: any) {
        console.error('[Leads] Email error (non-blocking):', emailError);
        // Não falhar o lead se email falhar - lead já foi salvo
      }
    }

    // Criar evento no analytics (se window.dataLayer existir)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'lead_created',
        lead_id: data.id,
        email: leadData.email,
        company: leadData.company,
        lead_score: leadScore,
        timestamp: new Date().toISOString()
      });
    }

    return data.id;
    
  } catch (error) {
    console.error('[Leads] Error saving to Supabase:', error);
    
    // Fallback local
    const localId = `local_lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`lead_${localId}`, JSON.stringify({
      ...leadData,
      id: localId,
      saved_locally: true,
      timestamp: new Date().toISOString()
    }));
    
    return localId;
  }
};

const calculateLeadScore = (lead: LeadData): number => {
  let score = 50; // Base
  
  // Email corporativo
  if (lead.email.match(/\.(com|com\.br|net|org)$/) && !lead.email.includes('gmail') && !lead.email.includes('yahoo')) {
    score += 20;
  }
  
  // Company name
  if (lead.company.trim().length > 2) {
    score += 10;
  }
  
  // Job title
  const seniorTitles = ['director', 'gerente', 'manager', 'head', 'founder', 'ceo', 'cto', 'diretor', 'coordenador'];
  if (seniorTitles.some(title => lead.jobTitle?.toLowerCase().includes(title))) {
    score += 15;
  }
  
  // Contact preference (WhatsApp indica maior intenção)
  if (lead.contactPreference === 'whatsapp') {
    score += 10;
  }
  
  // Marketing consent
  if (lead.acceptMarketing) {
    score += 5;
  }
  
  return Math.min(100, score);
};

// Validação de formulário
export const validateLeadForm = (form: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Name validation
  if (!form.name || form.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    errors.push('Email inválido');
  }
  
  // Company validation
  if (!form.company || form.company.trim().length < 2) {
    errors.push('Empresa deve ter pelo menos 2 caracteres');
  }
  
  // Phone validation (Flexible for international but checks min length)
  if (!form.phone || form.phone.length < 8) {
    errors.push('Telefone inválido');
  }
  
  // Terms acceptance
  if (!form.acceptTerms) {
    errors.push('Você precisa aceitar os termos e condições');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Email confirmation stub
export const sendConfirmationEmail = async (email: string, leadId: string): Promise<void> => {
  // Usar Supabase Edge Function ou serviço de email
  // Mock implementation
  try {
    if (supabase && supabase.functions) {
        const { error } = await supabase.functions.invoke('send-confirmation-email', {
            body: { email, leadId }
        });
        if (error) console.warn('[Leads] Email sending failed:', error);
    }
  } catch (e) {
      // Ignore if functions not configured
  }
};
