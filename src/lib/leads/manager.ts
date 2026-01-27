
import { supabase } from '../supabaseClient';

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
  const rateLimitKey = `lead_submission_${leadData.email}`;
  const lastSubmission = localStorage.getItem(rateLimitKey);
  
  if (lastSubmission) {
    const timeSince = Date.now() - parseInt(lastSubmission);
    if (timeSince < 30 * 1000) { 
      throw new Error('Aguarde um momento antes de enviar novamente.');
    }
  }
  
  localStorage.setItem(rateLimitKey, Date.now().toString());

  const leadScore = calculateLeadScore(leadData);
  
  console.log('[Supabase] Salvando Lead (NO MOCKS)...');

  const { data, error } = await supabase
    .from('leads')
    .insert([{
      blueprint_id: leadData.blueprintId,
      user_email: leadData.email,
      user_name: leadData.name,
      company_name: leadData.company,
      phone: leadData.phone,
      job_title: leadData.jobTitle,
      contact_preference: leadData.contactPreference,
      
      lead_status: 'morno',
      lead_score: leadScore,
      
      project_size_estimated: leadData.complexity,
      project_timeline_estimated: leadData.complexity === 'small' ? 15 : leadData.complexity === 'medium' ? 30 : 60,
      
      source: leadData.source || 'organic',
      campaign: leadData.campaign,
      accept_marketing: leadData.acceptMarketing,
      
      created_at: new Date().toISOString()
    }])
    .select('id')
    .single();

  if (error) {
    throw new Error(`DB Error (Leads): ${error.message}`);
  }

  return data.id;
};

const calculateLeadScore = (lead: LeadData): number => {
  let score = 50;
  if (lead.email.match(/\.(com|com\.br|net|org)$/) && !lead.email.includes('gmail') && !lead.email.includes('yahoo')) score += 20;
  if (lead.company.trim().length > 2) score += 10;
  const seniorTitles = ['director', 'gerente', 'manager', 'head', 'founder', 'ceo', 'cto', 'diretor', 'coordenador'];
  if (seniorTitles.some(title => lead.jobTitle?.toLowerCase().includes(title))) score += 15;
  if (lead.contactPreference === 'whatsapp') score += 10;
  if (lead.acceptMarketing) score += 5;
  return Math.min(100, score);
};

export const validateLeadForm = (form: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!form.name || form.name.trim().length < 2) errors.push('Nome deve ter pelo menos 2 caracteres');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) errors.push('Email inválido');
  if (!form.company || form.company.trim().length < 2) errors.push('Empresa deve ter pelo menos 2 caracteres');
  if (!form.phone || form.phone.length < 8) errors.push('Telefone inválido');
  if (!form.acceptTerms) errors.push('Você precisa aceitar os termos e condições');
  return { valid: errors.length === 0, errors };
};

export const sendConfirmationEmail = async (email: string, leadId: string): Promise<void> => {
    // Stub
};
