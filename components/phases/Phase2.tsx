import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Brain,
  LucideIcon
} from 'lucide-react';
import Button from '../Button';
import { saveDimensionsToSupabase, DimensionSelection } from '../../lib/supabase/dimensions';
import { analytics } from '../../lib/analytics';
import { useToast } from '../ui/Toast';

interface DimensionOption {
  id: string;
  label: string;
  value: string;
  description: string;
  impactScore: number;
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
  const { t } = useTranslation('phase2');
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [currentDimension, setCurrentDimension] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const toast = useToast();

  const dimensions: Dimension[] = [
    {
      id: 'frequency',
      name: t('dimensions.frequency.name', 'Frequency'),
      description: t('dimensions.frequency.description', 'How often does this problem occur?'),
      icon: Repeat,
      options: [
        { id: 'daily', label: t('dimensions.frequency.options.daily', 'Daily'), value: 'daily', description: t('dimensions.frequency.options.dailyDesc', 'Occurs every day, impacts continuous operation'), impactScore: 9 },
        { id: 'weekly', label: t('dimensions.frequency.options.weekly', 'Weekly'), value: 'weekly', description: t('dimensions.frequency.options.weeklyDesc', 'Occurs every week, planning needed'), impactScore: 7 },
        { id: 'monthly', label: t('dimensions.frequency.options.monthly', 'Monthly'), value: 'monthly', description: t('dimensions.frequency.options.monthlyDesc', 'Occurs every month, cyclical'), impactScore: 5 },
        { id: 'quarterly', label: t('dimensions.frequency.options.quarterly', 'Quarterly'), value: 'quarterly', description: t('dimensions.frequency.options.quarterlyDesc', 'Occurs quarterly, seasonal'), impactScore: 3 },
        { id: 'rarely', label: t('dimensions.frequency.options.rarely', 'Rarely'), value: 'rarely', description: t('dimensions.frequency.options.rarelyDesc', 'Occurs occasionally, but impacts when it happens'), impactScore: 6 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: 'impact',
      name: t('dimensions.impact.name', 'Impact'),
      description: t('dimensions.impact.description', 'What is the business impact of this problem?'),
      icon: TrendingDown,
      options: [
        { id: 'critical', label: t('dimensions.impact.options.critical', 'Critical'), value: 'critical', description: t('dimensions.impact.options.criticalDesc', 'Stops operation, generates significant fines/losses'), impactScore: 10 },
        { id: 'high', label: t('dimensions.impact.options.high', 'High'), value: 'high', description: t('dimensions.impact.options.highDesc', 'Significantly impacts efficiency or costs'), impactScore: 8 },
        { id: 'medium', label: t('dimensions.impact.options.medium', 'Medium'), value: 'medium', description: t('dimensions.impact.options.mediumDesc', 'Causes moderate delays or additional costs'), impactScore: 6 },
        { id: 'low', label: t('dimensions.impact.options.low', 'Low'), value: 'low', description: t('dimensions.impact.options.lowDesc', 'Limited impact, but generates manual work'), impactScore: 4 },
        { id: 'nuisance', label: t('dimensions.impact.options.nuisance', 'Inconvenient'), value: 'nuisance', description: t('dimensions.impact.options.nuisanceDesc', 'Just inconvenient, no direct financial impact'), impactScore: 2 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: 'business_area',
      name: t('dimensions.businessArea.name', 'Business Area'),
      description: t('dimensions.businessArea.description', 'Which main area is affected?'),
      icon: Building,
      options: [
        { id: 'logistics', label: t('dimensions.businessArea.options.logistics', 'Logistics'), value: 'logistics', description: t('dimensions.businessArea.options.logisticsDesc', 'Transportation, distribution, freight'), impactScore: 7 },
        { id: 'supply_chain', label: t('dimensions.businessArea.options.supplyChain', 'Supply Chain'), value: 'supply_chain', description: t('dimensions.businessArea.options.supplyChainDesc', 'Supply chain, inventory'), impactScore: 8 },
        { id: 'comex', label: t('dimensions.businessArea.options.comex', 'COMEX'), value: 'comex', description: t('dimensions.businessArea.options.comexDesc', 'Foreign trade, import/export'), impactScore: 9 },
        { id: 'procurement', label: t('dimensions.businessArea.options.procurement', 'Procurement'), value: 'procurement', description: t('dimensions.businessArea.options.procurementDesc', 'Purchasing, suppliers, negotiation'), impactScore: 6 },
        { id: 'finance', label: t('dimensions.businessArea.options.finance', 'Finance'), value: 'finance', description: t('dimensions.businessArea.options.financeDesc', 'Controlling, costs, cash flow'), impactScore: 7 },
        { id: 'operations', label: t('dimensions.businessArea.options.operations', 'Operations'), value: 'operations', description: t('dimensions.businessArea.options.operationsDesc', 'Production, manufacturing, processes'), impactScore: 6 },
        { id: 'commercial', label: t('dimensions.businessArea.options.commercial', 'Commercial'), value: 'commercial', description: t('dimensions.businessArea.options.commercialDesc', 'Sales, customer relationships'), impactScore: 5 }
      ],
      required: true,
      multiSelect: true
    },
    {
      id: 'urgency',
      name: t('dimensions.urgency.name', 'Urgency'),
      description: t('dimensions.urgency.description', 'How urgent is solving this problem?'),
      icon: Clock,
      options: [
        { id: 'immediate', label: t('dimensions.urgency.options.immediate', 'Immediate'), value: 'immediate', description: t('dimensions.urgency.options.immediateDesc', 'Must be solved immediately, causing damage now'), impactScore: 9 },
        { id: 'high', label: t('dimensions.urgency.options.high', 'High'), value: 'high', description: t('dimensions.urgency.options.highDesc', 'Must be solved in the next few weeks'), impactScore: 7 },
        { id: 'medium', label: t('dimensions.urgency.options.medium', 'Medium'), value: 'medium', description: t('dimensions.urgency.options.mediumDesc', 'Important to solve in the next few months'), impactScore: 5 },
        { id: 'low', label: t('dimensions.urgency.options.low', 'Low'), value: 'low', description: t('dimensions.urgency.options.lowDesc', 'Can be planned for long term'), impactScore: 3 },
        { id: 'strategic', label: t('dimensions.urgency.options.strategic', 'Strategic'), value: 'strategic', description: t('dimensions.urgency.options.strategicDesc', 'Strategic improvement, no operational urgency'), impactScore: 4 }
      ],
      required: true,
      multiSelect: false
    },
    {
      id: 'affected_resources',
      name: t('dimensions.resources.name', 'Affected Resources'),
      description: t('dimensions.resources.description', 'Which resources are most impacted?'),
      icon: Users,
      options: [
        { id: 'time', label: t('dimensions.resources.options.time', 'Team time'), value: 'time', description: t('dimensions.resources.options.timeDesc', 'Lots of manual time being spent'), impactScore: 7 },
        { id: 'money', label: t('dimensions.resources.options.money', 'Money/Costs'), value: 'money', description: t('dimensions.resources.options.moneyDesc', 'Direct financial costs'), impactScore: 8 },
        { id: 'quality', label: t('dimensions.resources.options.quality', 'Quality'), value: 'quality', description: t('dimensions.resources.options.qualityDesc', 'Impacts product/service quality'), impactScore: 6 },
        { id: 'customer', label: t('dimensions.resources.options.customer', 'Customer satisfaction'), value: 'customer', description: t('dimensions.resources.options.customerDesc', 'Impacts customer experience'), impactScore: 9 },
        { id: 'compliance', label: t('dimensions.resources.options.compliance', 'Compliance'), value: 'compliance', description: t('dimensions.resources.options.complianceDesc', 'Regulatory or compliance risk'), impactScore: 10 },
        { id: 'scalability', label: t('dimensions.resources.options.scalability', 'Scalability'), value: 'scalability', description: t('dimensions.resources.options.scalabilityDesc', 'Prevents growth or expansion'), impactScore: 7 }
      ],
      required: true,
      multiSelect: true
    }
  ];

  const handleOptionSelect = (dimensionId: string, optionId: string, isMulti: boolean) => {
    setSelections(prev => {
      const current = prev[dimensionId] || [];

      if (!isMulti) {
        return { ...prev, [dimensionId]: [optionId] };
      }

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
    let criticalFactors = 0;

    Object.entries(selections).forEach(([dimensionId, ids]) => {
      const optionIds = ids as string[];
      const dimension = dimensions.find(d => d.id === dimensionId);
      if (!dimension) return;

      optionIds.forEach(optionId => {
        const option = dimension.options.find(o => o.id === optionId);
        if (option) {
          totalImpact += option.impactScore;
          count++;

          // Track critical factors that push complexity up
          if (option.impactScore >= 9) criticalFactors++;
          if (dimensionId === 'impact' && option.id === 'critical') criticalFactors += 2;
          if (dimensionId === 'urgency' && option.id === 'immediate') criticalFactors++;
          if (dimensionId === 'affected_resources' && option.id === 'compliance') criticalFactors++;
        }
      });
    });

    // Calculate average impact (0-10 scale)
    const avgImpact = count > 0 ? totalImpact / count : 5;

    // Convert to 0-100 scale with proper distribution
    // Low (0-39): avgImpact < 5
    // Medium (40-69): avgImpact 5-7
    // High (70-100): avgImpact > 7
    let baseScore = Math.round((avgImpact / 10) * 100);

    // Boost for critical factors (each adds 5 points, max 20)
    const criticalBoost = Math.min(criticalFactors * 5, 20);

    // Multi-selection penalty/boost: more selections = more complex
    const selectionCount = Object.values(selections).flat().length;
    const selectionBoost = selectionCount > 5 ? Math.min((selectionCount - 5) * 2, 10) : 0;

    // Final score calculation
    const finalScore = Math.min(100, Math.max(0, baseScore + criticalBoost + selectionBoost));

    return finalScore;
  };

  const handleNext = async () => {
    if (currentDimension < dimensions.length - 1) {
      setCurrentDimension(prev => prev + 1);
    } else {
      setIsSubmitting(true);

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

      try {
        await saveDimensionsToSupabase(problemId, dimensionSelections, refinedScore);

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
        toast.success(t('messages.success', 'Structure completed!'));
      } catch (error) {
        console.error('[Phase2] Error saving dimensions:', error);
        toast.error(t('messages.error', 'Error saving. Please try again.'));
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
    <div className="max-w-4xl mx-auto px-4 py-8 pt-24 animate-fade-in">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold font-display text-white">
            {t('title', 'Structure your problem')}
          </h2>
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
            <span className="font-medium text-ds-text-primary">
              {t('reviewProblem', 'Review problem description')}
            </span>
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
                <span className="text-xs font-medium text-ds-primary-300">
                  {t('multiSelectAllowed', 'Multiple selection allowed')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Options - Responsive flex layout */}
        <div className="flex flex-wrap gap-3">
          {currentDim.options.map((option) => {
            const isSelected = currentSelections.includes(option.id);

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentDim.id, option.id, currentDim.multiSelect)}
                className={`px-4 py-3 rounded-xl text-left transition-all duration-200 relative group flex-grow sm:flex-grow-0 min-w-[140px] max-w-full sm:max-w-[48%] ${
                  isSelected
                    ? 'bg-ds-primary-500/20 border-2 border-ds-primary-500 shadow-lg shadow-ds-primary-500/10'
                    : 'bg-ds-surface hover:bg-ds-card border border-ds-border hover:border-ds-primary-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`font-medium whitespace-nowrap ${isSelected ? 'text-white' : 'text-ds-text-primary'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="p-1 bg-ds-primary-500 rounded-full animate-fade-in ml-2 flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-ds-text-tertiary group-hover:text-ds-text-secondary transition-colors">
                  {option.description}
                </p>

                {/* Impact Indicator */}
                <div className="mt-3 flex items-center justify-between opacity-80">
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
                    {t('impact', 'Impact')} {option.impactScore}/10
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
                {currentSelections.length} {t('optionsSelected', 'option(s) selected')}
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
          {t('buttons.back', 'Back')}
        </Button>

        <Button
          variant="primary"
          onClick={handleNext}
          disabled={
            (currentDim.required && currentSelections.length === 0) ||
            isSubmitting
          }
          isLoading={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? (
            t('buttons.processing', 'Processing...')
          ) : currentDimension === dimensions.length - 1 ? (
            <>
              {t('buttons.complete', 'COMPLETE')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              {t('buttons.next', 'NEXT')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Fixed Intent Score Preview - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="p-4 bg-ds-card/95 backdrop-blur-md border border-ds-border rounded-xl shadow-2xl shadow-black/20 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-ds-primary-400 animate-pulse" />
            <span className="text-xs font-medium text-ds-text-secondary">
              {t('intentScore.label', 'AI Refining')}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-ds-primary-400 font-mono">
              {calculateRefinedIntentScore()}
            </span>
            <span className="text-ds-text-tertiary text-sm">/100</span>
          </div>
          <div className="h-1.5 bg-ds-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-ds-gradient-primary transition-all duration-1000 ease-out"
              style={{ width: `${calculateRefinedIntentScore()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase2;
