import React, { useState, useEffect } from 'react';
import {
  Check,
  FileText,
  Calendar,
  DollarSign,
  Lock,
  Zap,
  CheckCircle,
  MessageCircle,
  Mail,
  Phone,
  Download,
  Shield,
  Clock,
  Users,
  Target,
  Layers,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { DimensionSelection } from '../../lib/supabase/dimensions';
import { QuestionAnswer } from '../../lib/supabase/answers';
import { generateTechnicalBlueprint, Blueprint } from '../../lib/ai/blueprint';
import { saveLeadToSupabase, validateLeadForm, sendConfirmationEmail } from '../../lib/leads/manager';
import { analytics } from '../../lib/analytics';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../src/contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Phase4Props { 
  problemId: string;
  problemText: string;
  dimensions: DimensionSelection[];
  questionsAnswers: QuestionAnswer[];
  complexity: 'small' | 'medium' | 'large';
  onLeadCaptured: (leadId: string, leadStatus: 'morno' | 'quente') => void;
}

const FullBlueprintContent: React.FC<{ blueprint: Blueprint }> = ({ blueprint }) => (
  <div className="space-y-8 animate-slide-up">
    {/* Problem Statement */}
    <div className="p-6 bg-ds-surface rounded-xl border border-ds-border">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-ds-primary-400">
        <AlertTriangle className="w-5 h-5" />
        Definição do Problema
      </h3>
      <p className="text-ds-text-secondary leading-relaxed">{blueprint.problemStatement}</p>
    </div>

    {/* Objectives */}
    <div className="p-6 bg-ds-surface rounded-xl border border-ds-border">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-ds-primary-400">
        <Target className="w-5 h-5" />
        Objetivos Estratégicos
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {blueprint.objectives.map((obj, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ds-text-secondary">
            <CheckCircle className="w-4 h-4 text-ds-success shrink-0 mt-0.5" />
            <span>{obj}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Tech Stack */}
    <div className="p-6 bg-ds-surface rounded-xl border border-ds-border">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-ds-primary-400">
        <Layers className="w-5 h-5" />
        Arquitetura Técnica
      </h3>
      <div className="flex flex-wrap gap-2">
        {blueprint.technicalArchitecture.map((tech, i) => (
          <span key={i} className="px-3 py-1 bg-ds-bg rounded-full text-sm font-mono text-ds-text-primary border border-ds-border">
            {tech}
          </span>
        ))}
      </div>
    </div>

    {/* Key Features */}
    <div className="p-6 bg-ds-surface rounded-xl border border-ds-border">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-ds-primary-400">
        <Zap className="w-5 h-5" />
        Funcionalidades Chave
      </h3>
      <ul className="space-y-3">
        {blueprint.keyFeatures.map((feat, i) => (
          <li key={i} className="flex items-center gap-3 p-3 bg-ds-bg rounded-lg border border-ds-border/50">
            <div className="w-2 h-2 rounded-full bg-ds-accent" />
            <span className="text-ds-text-primary text-sm">{feat}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Metrics & Risks */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="p-6 bg-ds-surface rounded-xl border border-ds-border">
        <h3 className="text-lg font-bold mb-3 text-ds-success">Métricas de Sucesso</h3>
        <ul className="space-y-2">
          {blueprint.successMetrics.map((metric, i) => (
            <li key={i} className="text-sm text-ds-text-secondary list-disc list-inside">{metric}</li>
          ))}
        </ul>
      </div>
      <div className="p-6 bg-ds-surface rounded-xl border border-ds-border">
        <h3 className="text-lg font-bold mb-3 text-ds-warning">Riscos & Mitigação</h3>
        <ul className="space-y-2">
          {blueprint.risksAndMitigations.map((risk, i) => (
            <li key={i} className="text-sm text-ds-text-secondary list-disc list-inside">{risk}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Next Steps */}
    <div className="p-6 bg-ds-primary-500/10 rounded-xl border border-ds-primary-500/30">
      <h3 className="text-lg font-bold mb-4 text-ds-primary-300">Próximos Passos Recomendados</h3>
      <div className="space-y-4">
        {blueprint.nextSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-ds-primary-500 flex items-center justify-center text-white font-bold shrink-0">
              {i + 1}
            </div>
            <div className="text-ds-text-primary text-sm font-medium">{step}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Phase4: React.FC<Phase4Props> = ({
  problemId,
  problemText,
  dimensions,
  questionsAnswers,
  complexity,
  onLeadCaptured
}) => {
  const { user, isAuthenticated, signInWithGoogle, signInWithMagicLink, loading: authLoading } = useAuth();
  const [showFullBlueprint, setShowFullBlueprint] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    jobTitle: '',
    contactPreference: 'whatsapp' as 'whatsapp' | 'email' | 'phone',
    acceptTerms: false,
    acceptMarketing: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedBlueprint, setGeneratedBlueprint] = useState<Blueprint | null>(null);
  const toast = useToast();

  // Gerar blueprint na montagem
  useEffect(() => {
    const init = async () => {
        // Scroll to top
        window.scrollTo(0, 0);
        await generateBlueprintContent();
    };
    init();
  }, []);

  const generateBlueprintContent = async () => {
    try {
      const blueprint = await generateTechnicalBlueprint({
        problemText,
        dimensions,
        questionsAnswers,
        complexity
      });
      setGeneratedBlueprint(blueprint);
    } catch (error) {
      console.error('[Phase4] Error generating blueprint:', error);
    }
  };

  const handleLogin = async (method: 'google' | 'email') => {
    setIsLoggingIn(true);

    try {
      if (method === 'google') {
        await signInWithGoogle();
        // Redirect happens automatically
      } else {
        // Magic Link
        if (!leadForm.email) {
          toast.error('Preencha seu email primeiro');
          setIsLoggingIn(false);
          return;
        }

        const result = await signInWithMagicLink(leadForm.email);

        if (result.success) {
          toast.success('Link de acesso enviado! Verifique seu email.');
        } else {
          toast.error(result.error || 'Erro ao enviar magic link');
        }
      }
    } catch (error: any) {
      console.error('[Phase4] Login error:', error);
      toast.error(error.message || 'Erro no login. Tente novamente.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadForm.acceptTerms) {
      toast.error('Você precisa aceitar os termos e condições');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Validar dados
      const validation = validateLeadForm(leadForm);
      if (!validation.valid) {
        validation.errors.forEach(err => toast.error(err));
        return;
      }

      // 2. Salvar lead no Supabase
      const leadId = await saveLeadToSupabase({
        problemId,
        blueprintId: generatedBlueprint?.id,
        ...leadForm,
        complexity,
        source: 'blueprint_request',
        campaign: window.location.search || 'organic'
      });

      // 3. Track analytics
      analytics.trackEvent('lead_submitted', {
        lead_id: leadId,
        lead_status: 'morno',
        contact_preference: leadForm.contactPreference,
        has_marketing_consent: leadForm.acceptMarketing
      });

      // 4. Enviar email de confirmação (non-blocking)
      sendConfirmationEmail(leadForm.email, leadId);

      // 5. Mostrar blueprint completo
      setShowFullBlueprint(true);
      
      // 6. Notificar componente pai
      onLeadCaptured(leadId, 'morno');
      
      toast.success('Blueprint liberado com sucesso!');
      
      // Scroll up slightly to see content
      setTimeout(() => {
          const bpContainer = document.getElementById('blueprint-container');
          bpContainer?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error: any) {
      console.error('[Phase4] Lead submission error:', error);
      if (error.message.includes('Aguarde')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao processar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    // Deep link para WhatsApp Business
    const phoneNumber = '5511999999999'; // Número da empresa
    const message = `Olá! Acabei de solicitar o blueprint para meu projeto de ${complexity}. Meu código é: ${problemId}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Track
    analytics.trackEvent('whatsapp_redirect', {
      problem_id: problemId,
      complexity
    });
  };

  const timelineMap = {
    small: '10-15 dias',
    medium: '20-30 dias',
    large: '40-60 dias'
  };

  const investmentRange = {
    small: 'R$ 15.000 - R$ 30.000',
    medium: 'R$ 30.000 - R$ 60.000',
    large: 'R$ 60.000 - R$ 120.000+'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Progress Complete */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ds-gradient-primary mb-6 shadow-lg shadow-ds-primary-500/30 animate-scale-in">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Análise Concluída! 🎉</h1>
        <p className="text-ds-text-secondary text-lg max-w-2xl mx-auto">
          Nossa IA processou seus dados e gerou um blueprint técnico personalizado para sua solução.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Project Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blueprint Preview Card */}
          <div id="blueprint-container" className="glass-card overflow-hidden border-ds-primary-500/20">
            {/* Blueprint Header */}
            <div className="p-6 border-b border-ds-border bg-ds-surface/50">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-ds-primary-400 mb-1">
                    {generatedBlueprint?.title || 'Blueprint Técnico'}
                  </h2>
                  <p className="text-sm text-ds-text-secondary">
                    Solução de {complexity === 'small' ? 'baixa' : complexity === 'medium' ? 'média' : 'alta'} complexidade
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start px-4 py-1.5 bg-ds-primary-500/20 rounded-full border border-ds-primary-500/30">
                  <Zap className="w-4 h-4 text-ds-primary-400" />
                  <span className="text-xs font-bold text-ds-primary-300 uppercase">
                    {complexity}
                  </span>
                </div>
              </div>
            </div>

            {/* Blueprint Content - Preview (First Page) */}
            <div className="p-6">
              {/* Executive Summary (Visible) */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-ds-accent" />
                  Resumo Executivo
                </h3>
                <div className="p-5 bg-ds-surface/50 rounded-xl border border-ds-border/50">
                  <p className="text-ds-text-secondary leading-relaxed">
                    {generatedBlueprint?.executiveSummary || 
                      "Gerando resumo da solução tecnológica personalizada para resolver seus gargalos operacionais com foco em automação e escalabilidade..."}
                  </p>
                </div>
              </div>

              {/* Timeline & Investment (Visible) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 bg-ds-surface/50 rounded-xl border border-ds-border/50">
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-ds-text-primary">
                    <Calendar className="w-4 h-4 text-ds-primary-400" />
                    Estimativa de Timeline
                  </h4>
                  <div className="text-2xl font-bold text-ds-primary-400 mb-1 font-mono">
                    {timelineMap[complexity]}
                  </div>
                  <p className="text-xs text-ds-text-tertiary">
                    Desenvolvimento completo
                  </p>
                  
                  {/* Disclaimer */}
                  <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-700/20 rounded-lg">
                    <p className="text-xs text-yellow-500/90 leading-snug">
                      ⚠️ <strong>Nota:</strong> Estimativa preliminar sujeita a alinhamento técnico.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-ds-surface/50 rounded-xl border border-ds-border/50">
                  <h4 className="font-bold mb-2 flex items-center gap-2 text-ds-text-primary">
                    <DollarSign className="w-4 h-4 text-ds-primary-400" />
                    Faixa de Investimento
                  </h4>
                  <div className="text-2xl font-bold text-ds-primary-400 mb-1 font-mono">
                    {investmentRange[complexity]}
                  </div>
                  <p className="text-xs text-ds-text-tertiary">
                    Valor estimado (variável)
                  </p>
                  
                  <div className="mt-4 p-3 bg-ds-primary-500/10 rounded-lg border border-ds-primary-500/10">
                    <p className="text-xs text-ds-text-secondary leading-snug">
                      💰 <strong>Inclui:</strong> Protótipo em 7 dias + Implementação + Suporte 30d
                    </p>
                  </div>
                </div>
              </div>

              {/* Locked Content Overlay */}
              {!showFullBlueprint && (
                <div className="relative mt-8">
                  <div className="absolute inset-0 bg-ds-card/80 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-8 z-10 border border-ds-border">
                    <div className="p-4 bg-ds-primary-500/20 rounded-full mb-4 animate-pulse">
                         <Lock className="w-8 h-8 text-ds-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">Conteúdo Bloqueado</h3>
                    <p className="text-ds-text-secondary text-center mb-8 max-w-md">
                      Para acessar a <strong>Arquitetura Técnica</strong>, <strong>Funcionalidades Detalhadas</strong> e <strong>Plano de Implementação</strong>, libere o acesso gratuito abaixo.
                    </p>
                    
                    {/* CTA para formulário */}
                    <button
                      onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      LIBERAR BLUEPRINT COMPLETO
                    </button>
                  </div>
                  
                  {/* Locked Content Preview (Visual only, blurred) */}
                  <div className="filter blur-md opacity-30 pointer-events-none select-none" aria-hidden="true">
                    <div className="space-y-6">
                      <div className="h-32 bg-ds-surface rounded-xl"></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 bg-ds-surface rounded-xl"></div>
                          <div className="h-24 bg-ds-surface rounded-xl"></div>
                      </div>
                      <div className="h-40 bg-ds-surface rounded-xl"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Blueprint Content (when unlocked) */}
              {showFullBlueprint && generatedBlueprint && (
                <div className="mt-8 pt-8 border-t border-ds-border">
                  <FullBlueprintContent blueprint={generatedBlueprint} />
                </div>
              )}
            </div>
          </div>

          {/* Special Offer Card */}
          <div className="glass-card p-6 border border-ds-primary-500/30 bg-ds-primary-900/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-ds-primary-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-ds-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">🚀 Oferta Especial - Protótipo em 7 Dias</h3>
                <p className="text-ds-text-secondary mb-4 text-sm">
                  Deixe seus dados e nossos especialistas entrarão em contato para:
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Reunião de alinhamento técnico (30min)',
                    'Proposta detalhada com escopo validado',
                    'Protótipo navegável em 7 dias úteis',
                    'Implementação com garantia de satisfação'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-ds-text-secondary">
                      <CheckCircle className="w-5 h-5 text-ds-success flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WHATSAPP AGORA
                  </button>
                  <button
                    onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary flex-1 py-3 text-sm"
                  >
                    SOLICITAR POR EMAIL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Lead Capture Form */}
        <div className="space-y-6">
          {/* Lead Form Card */}
          <div id="lead-form" className={`glass-card p-6 md:p-8 relative transition-all duration-500 ${showFullBlueprint ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            
            {showFullBlueprint && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-ds-bg/50 backdrop-blur-sm rounded-2xl">
                    <div className="px-4 py-2 bg-ds-success/20 text-ds-success border border-ds-success/30 rounded-full font-bold flex items-center gap-2">
                        <Check className="w-5 h-5" /> Enviado com Sucesso
                    </div>
                </div>
            )}

            <div className="mb-6">
                 <h3 className="text-xl font-bold text-white mb-2">Acesse seu Blueprint Completo</h3>
                 <p className="text-sm text-ds-text-secondary">Preencha para liberar o acesso imediato.</p>
            </div>
            
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-ds-text-tertiary uppercase tracking-wider">Nome completo *</label>
                <input
                  type="text"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                  className="input-field py-2.5 text-sm"
                  placeholder="João Silva"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-ds-text-tertiary uppercase tracking-wider">Email corporativo *</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                  className="input-field py-2.5 text-sm"
                  placeholder="joao@empresa.com"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-ds-text-tertiary uppercase tracking-wider">Empresa *</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                  className="input-field py-2.5 text-sm"
                  placeholder="Sua empresa"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-ds-text-tertiary uppercase tracking-wider">Telefone/WhatsApp *</label>
                <input
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                  className="input-field py-2.5 text-sm"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-ds-text-tertiary uppercase tracking-wider">Cargo</label>
                <select
                  value={leadForm.jobTitle}
                  onChange={(e) => setLeadForm({...leadForm, jobTitle: e.target.value})}
                  className="input-field py-2.5 text-sm bg-ds-surface"
                >
                  <option value="">Selecione seu cargo</option>
                  <option value="founder">Fundador/Diretor</option>
                  <option value="manager">Gerente/Coordenador</option>
                  <option value="analyst">Analista/Especialista</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-xs font-medium mb-2 text-ds-text-tertiary uppercase tracking-wider">Prefiro contato por:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'phone', label: 'Telefone', icon: Phone }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLeadForm({...leadForm, contactPreference: option.value as any})}
                      className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1.5 transition-all ${
                        leadForm.contactPreference === option.value
                          ? 'bg-ds-primary-500/20 border-2 border-ds-primary-500 text-white'
                          : 'bg-ds-surface hover:bg-ds-surface/80 border border-ds-border text-ds-text-secondary'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={leadForm.acceptTerms}
                    onChange={(e) => setLeadForm({...leadForm, acceptTerms: e.target.checked})}
                    className="mt-1 rounded border-ds-border bg-ds-surface text-ds-primary-500 focus:ring-ds-primary-500/50"
                    required
                  />
                  <label htmlFor="terms" className="text-xs text-ds-text-secondary cursor-pointer">
                    Concordo com os <a href="#" className="text-ds-primary-400 hover:underline">Termos de Uso</a> e <a href="#" className="text-ds-primary-400 hover:underline">Política de Privacidade</a> *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={leadForm.acceptMarketing}
                    onChange={(e) => setLeadForm({...leadForm, acceptMarketing: e.target.checked})}
                    className="mt-1 rounded border-ds-border bg-ds-surface text-ds-primary-500 focus:ring-ds-primary-500/50"
                  />
                  <label htmlFor="marketing" className="text-xs text-ds-text-secondary cursor-pointer">
                    Aceito receber novidades e ofertas da ALL MAX MIND
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !leadForm.acceptTerms}
                className={`btn-primary w-full py-4 mt-2 ${
                  (!leadForm.acceptTerms || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" className="text-white" />
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    BAIXAR BLUEPRINT COMPLETO
                  </span>
                )}
              </button>

              <p className="text-[10px] text-ds-text-tertiary text-center leading-tight">
                Seu blueprint será liberado nesta tela e uma cópia será enviada para o email cadastrado.
              </p>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="glass-card p-5 border border-ds-border/50">
            <h4 className="font-bold mb-4 text-sm text-white">Segurança e Garantia</h4>
            <div className="space-y-3">
              {[
                { icon: Shield, text: 'Dados 100% criptografados' },
                { icon: Clock, text: 'Atendimento rápido' },
                { icon: CheckCircle, text: 'Consultoria Especializada' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-1.5 bg-ds-primary-500/10 rounded-md">
                    <item.icon className="w-3.5 h-3.5 text-ds-primary-400" />
                  </div>
                  <span className="text-xs text-ds-text-secondary">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Auth Methods */}
      {!isAuthenticated && !showFullBlueprint && (
        <div className="mt-12 text-center opacity-60 hover:opacity-100 transition-opacity">
          <p className="text-xs text-ds-text-tertiary mb-3 uppercase tracking-widest">Ou acesse rapidamente com</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleLogin('google')}
              disabled={isLoggingIn || authLoading}
              className="flex items-center gap-2 px-5 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isLoggingIn ? (
                 <LoadingSpinner size="sm" className="text-gray-800" />
               ) : (
                 <svg className="w-4 h-4" viewBox="0 0 24 24">
                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                   <path fill="#EA4335" d="M12 4.36c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.05 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
               )}
              Google
            </button>
            <button
              onClick={() => handleLogin('email')}
              disabled={isLoggingIn || authLoading}
              className="flex items-center gap-2 px-5 py-2 bg-ds-surface border border-ds-border text-ds-text-primary rounded-lg hover:bg-ds-card transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Magic Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phase4;
