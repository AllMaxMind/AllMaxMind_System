import React from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../ui/LoadingSpinner';

interface Step2BudgetProps {
  budget: string;
  onBudgetChange: (budget: string) => void;
  onNext: () => void;
  onBack?: () => void;
  isLoading: boolean;
}

const BUDGET_OPTIONS = [
  { value: 'ate_30k', labelKey: 'under30k', points: 10 },
  { value: '30_60k', labelKey: '30to60k', points: 20 },
  { value: '60_120k', labelKey: '60to120k', points: 30 },
  { value: 'acima_120k', labelKey: 'over120k', points: 40 },
];

export const Step2Budget: React.FC<Step2BudgetProps> = ({
  budget,
  onBudgetChange,
  onNext,
  onBack,
  isLoading,
}) => {
  const { t } = useTranslation('phase5');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ds-primary-500/20 mb-4">
          <DollarSign className="w-6 h-6 text-ds-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('step2.title')}
        </h2>
        <p className="text-ds-text-secondary text-sm">
          {t('step2.description')}
        </p>
      </div>

      <div className="space-y-3">
        {BUDGET_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              budget === option.value
                ? 'border-ds-primary-500 bg-ds-primary-500/10'
                : 'border-ds-border bg-ds-surface hover:border-ds-primary-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="budget"
                value={option.value}
                checked={budget === option.value}
                onChange={(e) => onBudgetChange(e.target.value)}
                className="w-4 h-4 text-ds-primary-500 border-ds-border bg-ds-surface focus:ring-ds-primary-500"
              />
              <span className="text-ds-text-primary font-medium">
                {t(`step2.options.${option.labelKey}`)}
              </span>
            </div>
            <span className="text-xs text-ds-primary-400 font-medium">
              +{option.points} {t('points')}
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="btn-secondary flex-1 py-3"
          >
            {t('buttons.back')}
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!budget || isLoading}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              {t('buttons.continue')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
