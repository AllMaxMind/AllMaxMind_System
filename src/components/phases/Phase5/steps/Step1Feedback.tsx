import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, Meh, Clock, X, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../ui/LoadingSpinner';

interface Step1FeedbackProps {
  score: number;
  onScoreChange: (score: number) => void;
  onNext: () => void;
  onBack?: () => void;
  isLoading: boolean;
}

const FEEDBACK_OPTIONS = [
  { value: 100, labelKey: 'veryInterested', icon: ThumbsUp, color: 'text-ds-success' },
  { value: 70, labelKey: 'interested', icon: ThumbsUp, color: 'text-ds-primary-400' },
  { value: 40, labelKey: 'maybe', icon: Meh, color: 'text-yellow-500' },
  { value: 20, labelKey: 'notNow', icon: Clock, color: 'text-ds-text-tertiary' },
];

export const Step1Feedback: React.FC<Step1FeedbackProps> = ({
  score,
  onScoreChange,
  onNext,
  onBack,
  isLoading,
}) => {
  const { t } = useTranslation('phase5');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          {t('step1.title')}
        </h2>
        <p className="text-ds-text-secondary text-sm">
          {t('step1.description')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {FEEDBACK_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onScoreChange(option.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                score === option.value
                  ? 'border-ds-primary-500 bg-ds-primary-500/10'
                  : 'border-ds-border bg-ds-surface hover:border-ds-primary-500/50'
              }`}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${option.color}`} />
              <span className="block text-sm font-medium text-ds-text-primary">
                {t(`step1.options.${option.labelKey}`)}
              </span>
              <span className="block text-xs text-ds-text-tertiary mt-1">
                +{option.value} {t('points')}
              </span>
            </button>
          );
        })}
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
          disabled={score === 0 || isLoading}
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
