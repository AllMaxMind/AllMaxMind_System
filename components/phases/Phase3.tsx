import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { analytics } from '../../lib/analytics';
import { DimensionSelection } from '../../lib/supabase/dimensions';
import { adaptiveQuestionEngine, AdaptiveQuestion } from '../../lib/ai/questions/engine';
import { saveAnswersToSupabase, QuestionAnswer } from '../../lib/supabase/answers';

interface Phase3Props { 
  problemId: string;
  problemText: string;
  dimensions: DimensionSelection[];
  intentScore: number;
  onComplete: (answers: QuestionAnswer[], finalComplexity: 'small' | 'medium' | 'large') => void;
}

const Phase3: React.FC<Phase3Props> = ({
  problemId,
  problemText,
  dimensions,
  intentScore,
  onComplete
}) => {
  const { i18n } = useTranslation('phase3');
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Helper functions
  const getComplexityFromIntent = (score: number): 'small' | 'medium' | 'large' => {
    if (score < 40) return 'small';
    if (score < 70) return 'medium';
    return 'large';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'context': 'Contexto Operacional',
      'process': 'Processo Atual',
      'pain': 'Dor Real',
      'technical': 'Escopo Técnico',
      'scale': 'Escala e Prioridade'
    };
    return labels[category] || category;
  };

  const generateAdaptiveQuestions = async () => {
    setIsGenerating(true);

    try {
      const generatedQuestions = await adaptiveQuestionEngine.generate({
        problemText,
        dimensions,
        intentScore,
        previousAnswers: [], // Primeira rodada
        language: i18n.language
      });
      
      setQuestions(generatedQuestions);
      
      // Track analytics
      analytics.trackEvent('questions_generated', {
        problem_id: problemId,
        question_count: generatedQuestions.length,
        intent_score: intentScore,
        estimated_complexity: getComplexityFromIntent(intentScore)
      });
      
    } catch (error) {
      console.error('[Phase3] Error generating questions:', error);
      // Engine handles fallback, so we shouldn't get here typically with empty array
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar perguntas adaptativas na montagem
  useEffect(() => {
    generateAdaptiveQuestions();
  }, []);

  const calculateFinalComplexity = (answers: QuestionAnswer[], score: number): 'small' | 'medium' | 'large' => {
     let adjustedScore = score;

     // Analyze answers for complexity indicators
     answers.forEach(a => {
        // Long detailed answers indicate more complex scenarios
        if (a.isCritical && a.answer.length > 200) adjustedScore += 5;
        if (a.answer.length > 300) adjustedScore += 3;

        // Keywords that indicate complexity
        const complexityKeywords = [
          'integração', 'integration', 'api', 'sistema legado', 'legacy',
          'múltiplos', 'multiple', 'escalabilidade', 'scalability',
          'segurança', 'security', 'compliance', 'auditoria', 'audit',
          'real-time', 'tempo real', 'alta disponibilidade', 'high availability'
        ];

        const lowerAnswer = a.answer.toLowerCase();
        complexityKeywords.forEach(keyword => {
          if (lowerAnswer.includes(keyword)) adjustedScore += 2;
        });
     });

     // Cap the adjustment
     adjustedScore = Math.min(100, adjustedScore);

     return getComplexityFromIntent(adjustedScore);
  };

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Salvar resposta
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    // Se não for a última pergunta, carregar próxima
    if (currentQuestionIndex < questions.length - 1) {
      setIsLoadingNext(true);
      
      // Pequena pausa para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentQuestionIndex(prev => prev + 1);
      setIsLoadingNext(false);
      setShowExplanation(false);
      
    } else {
      // Última pergunta respondida
      setIsLoadingNext(true);
      await processCompleteAnswers(answer); // Pass current answer to ensure it's included
    }
    
    // Track
    analytics.trackEvent('question_answered', {
      question_id: currentQuestion.id,
      answer_length: answer.length,
      question_index: currentQuestionIndex
    });
  };

  const processCompleteAnswers = async (lastAnswer: string) => {
    const finalAnswersObj = { ...answers, [questions[questions.length - 1].id]: lastAnswer };
    
    const questionAnswers: QuestionAnswer[] = questions.map(q => ({
      questionId: q.id,
      question: q.text,
      answer: finalAnswersObj[q.id] || '',
      category: q.category,
      isCritical: q.isCritical
    }));
    
    // Calcular complexidade final
    const complexity = calculateFinalComplexity(questionAnswers, intentScore);
    
    try {
        // Salvar no Supabase
        await saveAnswersToSupabase(problemId, questionAnswers, complexity);
        onComplete(questionAnswers, complexity);
    } catch (e) {
        console.error("Error saving answers", e);
        // Proceed anyway for UX
        onComplete(questionAnswers, complexity);
    } finally {
        setIsLoadingNext(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Progress & Context */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Perguntas Personalizadas</h2>
            <p className="text-ds-text-secondary text-sm">
              Baseado na sua descrição, temos {questions.length} perguntas para refinar a solução
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-ds-text-tertiary uppercase tracking-wider">Complexidade estimada</div>
            <div className="text-xl font-bold text-ds-primary-400 font-mono">
              {getComplexityFromIntent(intentScore).toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-ds-surface rounded-full overflow-hidden mb-2 border border-ds-border/30">
          <div 
            className="h-full bg-ds-gradient-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(41,160,177,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-ds-text-tertiary font-mono">
          <span>PERGUNTA {currentQuestionIndex + 1} DE {questions.length}</span>
          <span>{Math.round(progress)}% COMPLETO</span>
        </div>
      </div>

      {isGenerating ? (
        // Loading State
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="inline-block relative mb-6">
            <Brain className="w-16 h-16 text-ds-primary-500/30 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <LoadingSpinner size="lg" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Gerando perguntas personalizadas</h3>
          <p className="text-ds-text-secondary max-w-md mx-auto">
            Nossa IA está analisando seu problema e as dimensões selecionadas para criar as perguntas mais relevantes...
          </p>
        </div>
        
      ) : currentQuestion ? (
        // Question Interface
        <div className="space-y-6 animate-slide-up">
          {/* Question Card */}
          <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
            {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-ds-primary-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="p-3 bg-ds-primary-500/20 rounded-xl border border-ds-primary-500/30">
                <HelpCircle className="w-6 h-6 text-ds-primary-400" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    currentQuestion.category === 'context' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                    currentQuestion.category === 'process' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                    currentQuestion.category === 'pain' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
                    currentQuestion.category === 'technical' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                    'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                  }`}>
                    {getCategoryLabel(currentQuestion.category)}
                  </span>
                  {currentQuestion.isCritical && (
                    <span className="px-3 py-1 bg-ds-primary-500/20 text-ds-primary-300 border border-ds-primary-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" /> Crítica
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white leading-tight">{currentQuestion.text}</h3>
                
                {currentQuestion.explanation && (
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex items-center gap-2 text-ds-primary-400 hover:text-ds-primary-300 hover:underline text-sm transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    Por que estamos perguntando isso?
                  </button>
                )}
              </div>
            </div>
            
            {showExplanation && currentQuestion.explanation && (
              <div className="mt-4 mb-6 p-4 bg-ds-surface/80 rounded-lg border border-ds-border animate-fade-in">
                <p className="text-sm text-ds-text-secondary">{currentQuestion.explanation}</p>
              </div>
            )}
            
            {/* Answer Input */}
            <div className="mt-6">
              <div className="relative">
                <MessageSquare className="absolute top-4 left-4 w-5 h-5 text-ds-text-tertiary" />
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => {
                    const newAnswers = { ...answers, [currentQuestion.id]: e.target.value };
                    setAnswers(newAnswers);
                  }}
                  className="input-field min-h-[150px] pl-12 resize-none bg-ds-bg/50 focus:bg-ds-bg transition-colors"
                  placeholder={`Exemplo: ${currentQuestion.example || 'Forneça detalhes específicos...'}`}
                  disabled={isLoadingNext}
                  autoFocus
                />
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-ds-text-tertiary">
                  {currentQuestion.isCritical ? (
                    <span className="text-ds-warning flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Esta pergunta é fundamental para o diagnóstico
                    </span>
                  ) : (
                    'Quanto mais detalhes, melhor'
                  )}
                </div>
                <div className="text-xs font-mono text-ds-text-tertiary">
                  {(answers[currentQuestion.id] || '').length}/1000 chars
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0 || isLoadingNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                 currentQuestionIndex === 0 || isLoadingNext 
                 ? 'opacity-0 pointer-events-none' 
                 : 'text-ds-text-secondary hover:text-white hover:bg-ds-surface'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
            
            <button
              onClick={() => handleAnswer(answers[currentQuestion.id] || '')}
              disabled={
                (currentQuestion.isCritical && !(answers[currentQuestion.id] || '').trim()) ||
                isLoadingNext
              }
              className={`relative px-8 py-3 bg-ds-gradient-primary text-white font-semibold rounded-xl 
                 transition-all duration-300 hover:scale-105 hover:shadow-lg 
                 hover:shadow-ds-primary-500/30 active:scale-95 
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                 ${isLoadingNext ? 'opacity-80' : ''}`}
            >
              {isLoadingNext ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Processando...</span>
                </>
              ) : currentQuestionIndex === questions.length - 1 ? (
                <>
                  CONCLUIR PERGUNTAS
                  <Check className="w-5 h-5 ml-1" />
                </>
              ) : (
                <>
                  PRÓXIMA
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
        
      ) : (
        // Error State
        <div className="glass-card p-8 text-center animate-fade-in">
          <AlertTriangle className="w-12 h-12 text-ds-warning mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-white">Erro ao carregar perguntas</h3>
          <p className="text-ds-text-secondary mb-6">
            Não foi possível gerar perguntas personalizadas neste momento.
          </p>
          <button
            onClick={generateAdaptiveQuestions}
            className="px-6 py-2 bg-ds-primary-500 text-white rounded-lg hover:bg-ds-primary-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Complexity Indicator */}
      <div className="mt-8 p-6 bg-ds-card/50 border border-ds-border rounded-xl">
        <h4 className="font-bold mb-4 text-white text-sm uppercase tracking-wider">Classificação de Complexidade (Estimativa)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['small', 'medium', 'large'] as const).map((size) => {
            const isCurrent = getComplexityFromIntent(intentScore) === size;
            const timeline = size === 'small' ? '≤15 dias' : size === 'medium' ? '15-30 dias' : '30-60 dias';
            const label = size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande';
            
            return (
              <div
                key={size}
                className={`p-4 rounded-xl text-center transition-all duration-300 relative overflow-hidden ${
                  isCurrent
                    ? 'bg-ds-primary-500/10 border-2 border-ds-primary-500 shadow-lg shadow-ds-primary-500/10'
                    : 'bg-ds-surface/30 border border-ds-border/50 opacity-60 grayscale'
                }`}
              >
                <div className={`text-lg font-bold mb-1 ${isCurrent ? 'text-white' : 'text-ds-text-secondary'}`}>
                  {label}
                </div>
                <div className="text-sm text-ds-text-tertiary">{timeline}</div>
                {isCurrent && (
                   <div className="absolute inset-0 bg-ds-primary-500/5 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ds-text-tertiary mt-4 text-center">
          Esta classificação é dinâmica e será refinada com base nas suas respostas detalhadas.
        </p>
      </div>
    </div>
  );
};

export default Phase3;
