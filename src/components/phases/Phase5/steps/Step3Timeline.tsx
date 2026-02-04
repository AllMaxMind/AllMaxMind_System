import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Zap, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../ui/LoadingSpinner';

interface Step3TimelineProps {
  timeline: number;
  onTimelineChange: (timeline: number) => void;
  onNext: () => void;
  onBack?: () => void;
  isLoading: boolean;
}

const TIMELINE_OPTIONS = [
  { value: 14, labelKey: 'urgent', icon: Zap, points: 30 },
  { value: 30, labelKey: 'nextMonth', icon: Calendar, points: 20 },
  { value: 90, labelKey: 'threeMonths', icon: CalendarDays, points: 10 },
  { value: 180, labelKey: 'future', icon: Clock, points: 5 },
];

export const Step3Timeline: React.FC<Step3TimelineProps> = ({
  timeline,
  onTimelineChange,
  onNext,
  onBack,
  isLoading,
}) => {
  const { t } = useTranslation('phase5');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ds-primary-500/20 mb-4">
          <Calendar className="w-6 h-6 text-ds-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('step3.title')}
        </h2>
        <p className="text-ds-text-secondary text-sm">
          {t('step3.description')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TIMELINE_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onTimelineChange(option.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                timeline === option.value
                  ? 'border-ds-primary-500 bg-ds-primary-500/10'
                  : 'border-ds-border bg-ds-surface hover:border-ds-primary-500/50'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-ds-primary-400" />
              <span className="block text-sm font-medium text-ds-text-primary">
                {t(`step3.options.${option.labelKey}`)}
              </span>
              <span className="block text-xs text-ds-text-tertiary mt-1">
                +{option.points} {t('points')}
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
          disabled={timeline === 0 || isLoading}
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
