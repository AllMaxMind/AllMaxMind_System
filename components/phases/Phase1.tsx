import React, { useState } from 'react';
import { AlertCircle, Users, RefreshCw, Target, Brain, Shield } from 'lucide-react';
import Button from '../Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Tooltip from '../ui/Tooltip';
import { processProblemText } from '../../lib/ai/processor';
import { saveProblemToSupabase } from '../../lib/supabase/problems';
import { validateProblemText, checkRateLimit } from '../../lib/validation/problem';
import { analytics } from '../../lib/analytics';
import { useToast } from '../ui/Toast';

interface Phase1Props {
  onComplete: (problemId: string) => void;
  initialText?: string;
}

const Phase1: React.FC<Phase1Props> = ({ onComplete, initialText = '' }) => {
  const [problemText, setProblemText] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeGuide, setActiveGuide] = useState<number | null>(null);
  const [characterCount, setCharacterCount] = useState(initialText.length);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const toast = useToast();
  
  const thinkingGuides = [
    {
      id: 1,
      icon: AlertCircle,
      title: "Defina o problema",
      description: "O problema que quero resolver é…",
      examples: ["atrasos na liberação aduaneira", "erros nos cálculos de impostos", "falta de visibilidade do estoque"]
    },
    {
      id: 2,
      icon: Users,
      title: "Identifique quem sofre",
      description: "Quem tem essa dor na empresa?",
      examples: ["equipe de importação", "controladoria financeira", "compras internacionais"]
    },
    {
      id: 3,
      icon: RefreshCw,
      title: "Processo atual",
      description: "Como resolvem hoje?",
      examples: ["planilhas Excel manuais", "sistema legado", "processo sem automação"]
    },
    {
      id: 4,
      icon: Target,
      title: "Cenário ideal",
      description: "Como gostaria que fosse?",
      examples: ["automação completa", "dashboards em tempo real", "integração com ERP"]
    }
  ];

  const handleGuideClick = (guideId: number) => {
    setActiveGuide(guideId);
    const guide = thinkingGuides.find(g => g.id === guideId);
    if (guide) {
      const example = guide.examples[Math.floor(Math.random() * guide.examples.length)];
      const prefix = problemText ? '\n\n' : '';
      const newText = `${problemText}${prefix}• ${guide.description} ${example}`;
      setProblemText(newText);
      setCharacterCount(newText.length);
    }
  };

  const analyzeWithAI = async () => {
    // 1. Validation
    const validation = validateProblemText(problemText);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    // 2. Rate Limiting
    const visitorId = localStorage.getItem('am_visitor_id') || 'unknown';
    const rateLimit = checkRateLimit(visitorId);
    if (!rateLimit.allowed) {
      toast.error(`Aguarde ${rateLimit.retryAfter}s para nova análise.`);
      return;
    }

    setIsProcessing(true);
    try {
      // 3. Processamento NLP básico
      const analysis = await processProblemText(problemText);
      
      // 4. Salvar no Supabase
      const problemId = await saveProblemToSupabase({
        raw_text: problemText,
        processed_text: analysis.processedText,
        domain: analysis.domain,
        persona: analysis.persona,
        intent_score: analysis.intentScore,
        metadata: analysis.metadata
      });

      // 5. Track analytics
      analytics.trackEvent('problem_processed', {
        problem_length: problemText.length,
        domain: analysis.domain,
        intent_score: analysis.intentScore,
        processing_time: analysis.processingTime
      });

      toast.success('Análise concluída! Vamos para o próximo passo.');
      
      // 6. Avançar para Fase 2
      // Small delay for UX to show success state
      setTimeout(() => {
        onComplete(problemId);
      }, 1000);
      
    } catch (error) {
      console.error('[Phase1] Error processing problem:', error);
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-ds-gradient-primary flex items-center justify-center shadow-lg shadow-ds-primary-500/20">
            <span className="font-bold text-white">1</span>
          </div>
          <div className="w-16 sm:w-20 h-1 bg-ds-surface border-t border-b border-ds-border"></div>
          <div className="w-10 h-10 rounded-full bg-ds-surface border border-ds-border flex items-center justify-center text-ds-text-tertiary">
            <span>2</span>
          </div>
          <div className="w-16 sm:w-20 h-1 bg-ds-surface border-t border-b border-ds-border"></div>
          <div className="w-10 h-10 rounded-full bg-ds-surface border border-ds-border flex items-center justify-center text-ds-text-tertiary">
            <span>3</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
          Descreva sua dor operacional
        </h2>
        <p className="text-ds-text-secondary max-w-xl mx-auto">
          Quanto mais detalhes sobre processos, pessoas e consequências, mais preciso será o diagnóstico da nossa IA.
        </p>
      </div>

      {/* Thinking Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {thinkingGuides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => handleGuideClick(guide.id)}
            className={`p-4 rounded-xl text-left transition-all duration-300 group ${
              activeGuide === guide.id 
                ? 'bg-ds-primary-500/10 border-ds-primary-500 shadow-lg shadow-ds-primary-500/10' 
                : 'bg-ds-surface hover:bg-ds-card border border-ds-border hover:border-ds-primary-500/30'
            } border`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg transition-colors ${
                activeGuide === guide.id ? 'bg-ds-primary-500 text-white' : 'bg-ds-bg text-ds-primary-400 group-hover:text-ds-primary-300'
              }`}>
                <guide.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-ds-text-primary">{guide.title}</h3>
                <p className="text-sm text-ds-text-secondary mb-2">
                  {guide.description}
                </p>
                <div className="text-xs text-ds-text-tertiary font-mono bg-ds-bg/50 inline-block px-2 py-1 rounded">
                  Ex: {guide.examples[0]}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Text Area with AI Features */}
      <div className="glass-card p-1 mb-8 relative group">
        <div className="absolute -inset-0.5 bg-ds-gradient-primary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
        <div className="bg-ds-card rounded-xl p-6 relative">
            <textarea
              value={problemText}
              onChange={(e) => {
                setProblemText(e.target.value);
                setCharacterCount(e.target.value.length);
              }}
              className="w-full bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-ds-text-primary placeholder-ds-text-tertiary/50 min-h-[300px] resize-none scrollbar-thin"
              placeholder={`Exemplo detalhado:
              
"Nossa empresa sofre com atrasos constantes na importação de componentes eletrônicos da China. O processo atual é todo manual em Excel: a equipe de compras internacionais cria uma planilha com os produtos, valores e prazos, mas frequentemente há erros nos cálculos de impostos (II, IPI, PIS/COFINS) que só são descobertos na hora do desembaraço aduaneiro...

A equipe financeira precisa refazer todos os cálculos, e a produção fica parada esperando os componentes. Gostaríamos de automatizar esse processo, com cálculo automático de impostos, integração com o SAP que usamos..."`}
              maxLength={3000}
              disabled={isProcessing}
            />
            
            {/* Character Counter & Warnings */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-ds-bg/80 backdrop-blur px-3 py-1 rounded-full border border-ds-border">
              {characterCount > 0 && characterCount < 100 && (
                <Tooltip content="Adicione mais detalhes para uma análise precisa">
                  <AlertCircle className="w-4 h-4 text-ds-warning animate-pulse" />
                </Tooltip>
              )}
              <div className={`text-xs font-mono font-medium ${
                characterCount > 2500 ? 'text-ds-warning' : 
                characterCount > 1000 ? 'text-ds-success' : 
                'text-ds-text-tertiary'
              }`}>
                {characterCount}/3000
              </div>
            </div>
        </div>

        {/* AI Suggestions (Mocked for UI visualization as per specs) */}
        {aiSuggestions.length > 0 && (
          <div className="mt-4 p-4 bg-ds-primary-500/10 rounded-lg border border-ds-primary-500/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-ds-primary-300">
              <Brain className="w-4 h-4" />
              Sugestões da IA para completar sua descrição:
            </h4>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setProblemText(prev => prev + '\n' + suggestion)}
                  className="text-sm text-left p-2 hover:bg-ds-primary-500/20 rounded w-full text-ds-text-secondary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={analyzeWithAI}
          disabled={isProcessing}
          variant="primary"
          size="lg"
          className="flex-1"
          isLoading={isProcessing}
          icon={!isProcessing && <Brain className="w-5 h-5" />}
        >
          {isProcessing ? 'Processando...' : 'ANALISAR MINHA DOR COM IA'}
        </Button>
        
        <Button
          onClick={() => {
            // Load example problem
            setProblemText(`Exemplo: Problema de gestão de fretes internacionais

Nossa empresa de eletrônicos sofre com a falta de controle sobre os fretes internacionais. Atualmente, cada importação é negociada separadamente por email, sem histórico de cotações, e frequentemente pagamos valores acima do mercado.

Consequências:
• Custo de frete 15-20% acima da média do mercado
• Atrasos na cotação atrasam a produção
• Não temos visibilidade do custo total (produto + frete + impostos)

Quem sofre: Gerente de Compras Internacionais e Controladoria

Processo atual: Planilha Excel manual, emails soltos, sem integração

Cenário ideal: Plataforma unificada com histórico de cotações, alertas de melhores preços, integração com SAP`);
            setCharacterCount(580); // Approx
            toast.info('Exemplo carregado. Edite conforme sua necessidade.');
          }}
          variant="secondary"
          size="lg"
        >
          VER EXEMPLO COMPLETO
        </Button>
      </div>

      {/* Processing Status Detail */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-ds-surface rounded-xl border border-ds-border animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 border-2 border-ds-primary-500/30 rounded-full"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-ds-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <Brain className="absolute inset-0 m-auto w-5 h-5 text-ds-primary-500 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-medium text-white">Analisando sua dor com IA...</p>
              <div className="h-1.5 w-full bg-ds-bg rounded-full overflow-hidden">
                 <div className="h-full bg-ds-primary-500 animate-[width_2s_ease-in-out_infinite] w-1/3 rounded-full"></div>
              </div>
              <p className="text-xs text-ds-text-tertiary">
                Identificando domínio, keywords e intenção estratégica
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ds-surface/50 border border-ds-border text-xs text-ds-text-tertiary">
           <Shield className="w-3 h-3 text-ds-success" />
           <span>Seus dados são criptografados e nunca compartilhados publicamente.</span>
         </div>
      </div>
    </div>
  );
};

export default Phase1;