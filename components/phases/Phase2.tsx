import React, { useState } from 'react';
import { 
  Repeat, 
  TrendingDown, 
  Building, 
  Clock, 
  Users, 
  FileText, 
  ChevronDown, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  LucideIcon
} from 'lucide-react';
import Button from '../Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { saveDimensionsToSupabase, DimensionSelection } from '../../lib/supabase/dimensions';
import { analytics } from '../../lib/analytics';
import { useToast } from '../ui/Toast';

interface DimensionOption {
  id: string;
  label: string;
  value: any;
  description: string;
  impactScore: number; // 1-10
}

interface Dimension {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  options: DimensionOption[];
  required: boolean;
  multiSelect: boolean;
}

interface Phase2Props { 
  problemId: string;
  problemText: string;
  initialIntentScore: number;
  onComplete: (selections: DimensionSelection[], refinedIntentScore: number) => void;
}

const Phase2: React.FC<Phase2Props> = ({ 
  problemId, 
  problemText, 
  initialIntentScore,
  onComplete 
}) => {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [currentDimension, setCurrentDimension] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const toast = useToast();

  const dimensions: Dimension[] = [
    {
      id: 'frequency',
      name: 'Frequência',
      description: 'Com que frequência esse problema ocorre?',
      icon: Repeat,
      options: [
        { id: 'daily', label: 'Diariamente', value: 'daily', description: 'Ocorre todo dia, impacta operação contínua', impactScore: 9 },
        { id: 'weekly', label: 'Semanalmente', value: 'weekly', description: 'Ocorre toda semana, planejamento necessário', impactScore: 7 },
        { id: 'monthly', label: 'Mensalmente', value: 'monthly', description: 'Ocorre todo mês, cíclico', impactScore: 5 },
        { id: 'quarterly', label: 'Trimestralmente', value: 'quarterly', description: 'Ocorre a cada trimestre, sazonal', impactScore: 3 },
        { id: 'rarely', label: 'Raramente', value: 'rarely', description: 'Ocorre ocasionalmente, mas impacta quando acontece', impactScore: 6 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: 'impact',
      name: 'Impacto',
      description: 'Qual o impacto desse problema no negócio?',
      icon: TrendingDown,
      options: [
        { id: 'critical', label: 'Crítico', value: 'critical', description: 'Para operação, gera multas/perdas financeiras significativas', impactScore: 10 },
        { id: 'high', label: 'Alto', value: 'high', description: 'Impacta significativamente eficiência ou custos', impactScore: 8 },
        { id: 'medium', label: 'Médio', value: 'medium', description: 'Causa atrasos ou custos adicionais moderados', impactScore: 6 },
        { id: 'low', label: 'Baixo', value: 'low', description: 'Impacto limitado, mas gera trabalho manual', impactScore: 4 },
        { id: 'nuisance', label: 'Inconveniente', value: 'nuisance', description: 'Apenas inconveniente, sem impacto financeiro direto', impactScore: 2 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: 'business_area',
      name: 'Área de Negócio',
      description: 'Qual área principal é afetada?',
      icon: Building,
      options: [
        { id: 'logistics', label: 'Logística', value: 'logistics', description: 'Transporte, distribuição, fretes', impactScore: 7 },
        { id: 'supply_chain', label: 'Supply Chain', value: 'supply_chain', description: 'Cadeia de suprimentos, estoques', impactScore: 8 },
        { id: 'comex', label: 'COMEX', value: 'comex', description: 'Comércio exterior, importação/exportação', impactScore: 9 },
        { id: 'procurement', label: 'Compras', value: 'procurement', description: 'Aquisições, fornecedores, negociação', impactScore: 6 },
        { id: 'finance', label: 'Financeiro', value: 'finance', description: 'Controladoria, custos, fluxo de caixa', impactScore: 7 },
        { id: 'operations', label: 'Operações', value: 'operations', description: 'Produção, manufatura, processos', impactScore: 6 },
        { id: 'commercial', label: 'Comercial', value: 'commercial', description: 'Vendas, relacionamento com cliente', impactScore: 5 }
      ],
      required: true,
      multiSelect: true
    },
    {
      id: 'urgency',
      name: 'Urgência',
      description: 'Qual a urgência para resolver esse problema?',
      icon: Clock,
      options: [
        { id: 'immediate', label: 'Imediata', value: 'immediate', description: 'Precisa ser resolvido imediatamente, está causando prejuízo agora', impactScore: 9 },
        { id: 'high', label: 'Alta', value: 'high', description: 'Precisa ser resolvido nas próximas semanas', impactScore: 7 },
        { id: 'medium', label: 'Média', value: 'medium', description: 'Importante resolver nos próximos meses', impactScore: 5 },
        { id: 'low', label: 'Baixa', value: 'low', description: 'Pode ser planejado para longo prazo', impactScore: 3 },
        { id: 'strategic', label: 'Estratégica', value: 'strategic', description: 'Melhoria estratégica, sem urgência operacional', impactScore: 4 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: 'affected_resources',
      name: 'Recursos Afetados',
      description: 'Quais recursos são mais impactados?',
      icon: Users,
      options: [
        { id: 'time', label: 'Tempo da equipe', value: 'time', description: 'Muito tempo manual sendo gasto', impactScore: 7 },
        { id: 'money', label: 'Dinheiro/Custos', value: 'money', description: 'Custos financeiros diretos', impactScore: 8 },
        { id: 'quality', label: 'Qualidade', value: 'quality', description: 'Impacta qualidade do produto/serviço', impactScore: 6 },
        { id: 'customer', label: 'Satisfação do cliente', value: 'customer', description: 'Impacta experiência do cliente', impactScore: 9 },
        { id: 'compliance', label: 'Conformidade', value: 'compliance', description: 'Risco regulatório ou de conformidade', impactScore: 10 },
        { id: 'scalability', label: 'Escalabilidade', value: 'scalability', description: 'Impede crescimento ou expansão', impactScore: 7 }
      ],
      required: true,
      multiSelect: true
    }
  ];

  const handleOptionSelect = (dimensionId: string, optionId: string, isMulti: boolean) => {
    setSelections(prev => {
      const current = prev[dimensionId] || [];
      
      if (!isMulti) {
        // Single select - replace
        return { ...prev, [dimensionId]: [optionId] };
      }
      
      // Multi select - toggle
      if (current.includes(optionId)) {
        return { ...prev, [dimensionId]: current.filter(id => id !== optionId) };
      } else {
        return { ...prev, [dimensionId]: [...current, optionId] };
      }
    });
  };

  const calculateRefinedIntentScore = (): number => {
    let totalImpact = 0;
    let count = 0;
    
    // Explicitly casting ids to string[] to satisfy TypeScript strict checks
    Object.entries(selections).forEach(([dimensionId, ids]) => {
      const optionIds = ids as string[];
      const dimension = dimensions.find(d => d.id === dimensionId);
      if (!dimension) return;
      
      optionIds.forEach(optionId => {
        const option = dimension.options.find(o => o.id === optionId);
        if (option) {
          totalImpact += option.impactScore;
          count++;
        }
      });
    });
    
    const avgImpact = count > 0 ? totalImpact / count : 0;
    
    // Combinar score inicial com impacto das dimensões
    // Fórmula: 70% do score inicial + 30% do impacto normalizado
    const normalizedImpact = (avgImpact / 10) * 100; // Converter para 0-100
    const safeInitialScore = initialIntentScore || 50;
    return Math.min(100, Math.round(safeInitialScore * 0.7 + normalizedImpact * 0.3));
  };

  const handleNext = async () => {
    if (currentDimension < dimensions.length - 1) {
      setCurrentDimension(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      
      // Preparar dados para envio
      // Explicitly casting ids to string[] to satisfy TypeScript strict checks
      const dimensionSelections: DimensionSelection[] = Object.entries(selections).map(([dimensionId, ids]) => {
        const optionIds = ids as string[];
        const dimension = dimensions.find(d => d.id === dimensionId)!;
        const selectedOptions = dimension.options.filter(o => optionIds.includes(o.id));
        const avgImpact = selectedOptions.length > 0 
          ? selectedOptions.reduce((sum, o) => sum + o.impactScore, 0) / selectedOptions.length
          : 0;
        
        return {
          dimensionId,
          selectedOptionIds: optionIds,
          impactScore: avgImpact,
          timestamp: new Date()
        };
      });
      
      const refinedScore = calculateRefinedIntentScore();
      
      // Salvar no Supabase
      try {
        await saveDimensionsToSupabase(problemId, dimensionSelections, refinedScore);
        
        // Track analytics
        analytics.trackEvent('dimensions_completed', {
          problem_id: problemId,
          dimension_count: dimensionSelections.length,
          refined_intent_score: refinedScore,
          selections_summary: JSON.stringify(dimensionSelections.map(ds => ({
            dimension: ds.dimensionId,
            selections: ds.selectedOptionIds.length
          })))
        });
        
        onComplete(dimensionSelections, refinedScore);
        toast.success('Estruturação concluída!');
      } catch (error) {
        console.error('[Phase2] Error saving dimensions:', error);
        toast.error('Erro ao salvar. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentDimension > 0) {
      setCurrentDimension(prev => prev - 1);
    }
  };

  const currentDim = dimensions[currentDimension];
  const currentSelections = selections[currentDim.id] || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold font-display text-white">Estruturar seu problema</h2>
          <span className="text-ds-text-tertiary font-mono">
            {currentDimension + 1} / {dimensions.length}
          </span>
        </div>
        <div className="h-2 bg-ds-surface rounded-full overflow-hidden border border-ds-border/30">
          <div 
            className="h-full bg-ds-gradient-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(41,160,177,0.5)]"
            style={{ width: `${((currentDimension + 1) / dimensions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Problem Summary (Collapsible) */}
      <div className="mb-6">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center justify-between w-full p-4 bg-ds-surface rounded-xl border border-ds-border hover:bg-ds-card transition-all"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-ds-primary-400" />
            <span className="font-medium text-ds-text-primary">Revisar descrição do problema</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-ds-text-tertiary transition-transform ${showSummary ? 'rotate-180' : ''}`} />
        </button>
        
        {showSummary && (
          <div className="mt-2 p-4 bg-ds-surface/50 rounded-lg border border-ds-border/50 animate-slide-down">
            <p className="text-ds-text-secondary whitespace-pre-line leading-relaxed">{problemText}</p>
          </div>
        )}
      </div>

      {/* Current Dimension Card */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-ds-primary-500/20 rounded-xl border border-ds-primary-500/30">
            <currentDim.icon className="w-6 h-6 text-ds-primary-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1 text-white">{currentDim.name}</h3>
            <p className="text-ds-text-secondary">{currentDim.description}</p>
            {currentDim.multiSelect && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-ds-primary-500/10 rounded-full border border-ds-primary-500/20">
                <Check className="w-3 h-3 text-ds-primary-400" />
                <span className="text-xs font-medium text-ds-primary-300">Seleção múltipla permitida</span>
              </div>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentDim.options.map((option) => {
            const isSelected = currentSelections.includes(option.id);
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentDim.id, option.id, currentDim.multiSelect)}
                className={`p-4 rounded-xl text-left transition-all duration-200 relative group ${
                  isSelected
                    ? 'bg-ds-primary-500/20 border-2 border-ds-primary-500 shadow-lg shadow-ds-primary-500/10'
                    : 'bg-ds-surface hover:bg-ds-card border border-ds-border hover:border-ds-primary-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`font-medium ${isSelected ? 'text-white' : 'text-ds-text-primary'}`}>{option.label}</span>
                  {isSelected && (
                    <div className="p-1 bg-ds-primary-500 rounded-full animate-fade-in">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-ds-text-tertiary group-hover:text-ds-text-secondary transition-colors">{option.description}</p>
                
                {/* Impact Indicator */}
                <div className="mt-4 flex items-center justify-between opacity-80">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < Math.ceil(option.impactScore / 2)
                            ? 'bg-ds-primary-400'
                            : 'bg-ds-surface border border-ds-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-ds-text-tertiary">
                    Impacto {option.impactScore}/10
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selection Summary */}
        {currentSelections.length > 0 && (
          <div className="mt-6 p-4 bg-ds-success/10 border border-ds-success/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-ds-success" />
            <div>
              <p className="font-medium text-ds-text-primary">
                {currentSelections.length} opção{currentSelections.length !== 1 ? 'es' : ''} selecionada{currentSelections.length !== 1 ? 's' : ''}
              </p>
              {!currentDim.multiSelect && currentSelections[0] && (
                <p className="text-sm text-ds-text-secondary">
                  {currentDim.options.find(o => o.id === currentSelections[0])?.label}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentDimension === 0}
          className={currentDimension === 0 ? 'opacity-0 pointer-events-none' : ''}
          icon={<ChevronLeft className="w-5 h-5" />}
        >
          Voltar
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={
            (currentDim.required && currentSelections.length === 0) ||
            isSubmitting
          }
          isLoading={isSubmitting}
          className="px-8"
        >
          {isSubmitting ? (
            'Processando...'
          ) : currentDimension === dimensions.length - 1 ? (
            <>
              CONCLUIR ESTRUTURAÇÃO
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              PRÓXIMA DIMENSÃO
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Intent Score Preview */}
      <div className="mt-8 p-4 bg-ds-card border border-ds-border rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-ds-text-secondary font-medium">Score de Intenção Refinado:</span>
          <span className="text-xl font-bold text-ds-primary-400 font-mono">
            {calculateRefinedIntentScore()}/100
          </span>
        </div>
        <div className="h-2 bg-ds-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-ds-gradient-primary transition-all duration-1000 ease-out"
            style={{ width: `${calculateRefinedIntentScore()}%` }}
          />
        </div>
        <p className="text-xs text-ds-text-tertiary mt-2 text-center">
          Quanto maior o score, mais personalizada será a próxima fase.
        </p>
      </div>
    </div>
  );
};

export default Phase2;