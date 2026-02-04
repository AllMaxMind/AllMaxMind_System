import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Step1Feedback } from './steps/Step1Feedback';
import { Step2Budget } from './steps/Step2Budget';
import { Step3Timeline } from './steps/Step3Timeline';
import { Step4Schedule } from './steps/Step4Schedule';
import { Step5WhatsApp } from './steps/Step5WhatsApp';
import { updateLeadPhase5Data, startPhase5 } from '../../../lib/leads/phase5Manager';
import { calculateDynamicScore, LeadStatus } from '../../../lib/leads/scorer';
import { useToast } from '../../ui/Toast';
import { analytics } from '../../../lib/analytics';

export interface Phase5FormData {
  feedbackScore: number;
  budgetRange: string;
  projectTimeline: number;
  scheduleDate: Date | null;
  whatsappPhone: string;
}

export interface Phase5Props {
  leadId: string;
  problemId: string;
  leadEmail: string;
  leadName?: string;
  companyName?: string;
  complexity: 'small' | 'medium' | 'large';
  onComplete: (score: number, status: LeadStatus) => void;
  onSkip?: () => void;
}

const TOTAL_STEPS = 5;

export const Phase5: React.FC<Phase5Props> = ({
  leadId,
  problemId,
  leadEmail,
  leadName,
  companyName,
  complexity,
  onComplete,
  onSkip,
}) => {
  const { t } = useTranslation('phase5');
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Phase5FormData>({
    feedbackScore: 0,
    budgetRange: '',
    projectTimeline: 0,
    scheduleDate: null,
    whatsappPhone: '',
  });

  const [currentScore, setCurrentScore] = useState(50);
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>('morno');

  // Mark Phase5 as started
  useEffect(() => {
    startPhase5(leadId).catch(console.error);
    analytics.trackEvent('phase5_started', { lead_id: leadId, problem_id: problemId });
  }, [leadId, problemId]);

  const handleStepComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Save current step data
      await updateLeadPhase5Data(leadId, currentStep, formData);

      // Calculate new score
      const { score, status } = calculateDynamicScore({
        feedbackScore: formData.feedbackScore,
        budgetRange: formData.budgetRange,
        timeline: formData.projectTimeline,
        callScheduled: !!formData.scheduleDate,
        whatsappAdded: !!formData.whatsappPhone,
      });

      setCurrentScore(score);
      setCurrentStatus(status);

      // Track step completion
      analytics.trackEvent(`phase5_step${currentStep}_completed`, {
        lead_id: leadId,
        score,
        status,
      });

      // Check if completed
      if (currentStep === TOTAL_STEPS) {
        toast.success(t('complete.success'));
        onComplete(score, status);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (err: any) {
      console.error('[Phase5] Step error:', err);
      setError(err.message || t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    analytics.trackEvent('phase5_skipped', { lead_id: leadId, step: currentStep });
    onSkip?.();
  };

  const renderStep = () => {
    const commonProps = {
      isLoading,
      onNext: handleStepComplete,
      onBack: currentStep > 1 ? handleStepBack : undefined,
    };

    switch (currentStep) {
      case 1:
        return (
          <Step1Feedback
            {...commonProps}
            score={formData.feedbackScore}
            onScoreChange={(score) => setFormData({ ...formData, feedbackScore: score })}
          />
        );
      case 2:
        return (
          <Step2Budget
            {...commonProps}
            budget={formData.budgetRange}
            onBudgetChange={(budget) => setFormData({ ...formData, budgetRange: budget })}
          />
        );
      case 3:
        return (
          <Step3Timeline
            {...commonProps}
            timeline={formData.projectTimeline}
            onTimelineChange={(timeline) => setFormData({ ...formData, projectTimeline: timeline })}
          />
        );
      case 4:
        return (
          <Step4Schedule
            {...commonProps}
            date={formData.scheduleDate}
            onDateChange={(date) => setFormData({ ...formData, scheduleDate: date })}
          />
        );
      case 5:
        return (
          <Step5WhatsApp
            {...commonProps}
            phone={formData.whatsappPhone}
            onPhoneChange={(phone) => setFormData({ ...formData, whatsappPhone: phone })}
            leadId={leadId}
            leadName={leadName}
            companyName={companyName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-ds-text-secondary">
          {t('subtitle')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-ds-text-tertiary">
            {t('progress', { current: currentStep, total: TOTAL_STEPS })}
          </span>
          <span className="text-sm font-medium text-ds-primary-400">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-ds-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-ds-gradient-primary transition-all duration-500"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Score Indicator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-ds-surface rounded-lg border border-ds-border">
          <span className="text-xs text-ds-text-tertiary uppercase">{t('score.label')}</span>
          <span className={`text-lg font-bold ${
            currentStatus === 'quente' ? 'text-ds-success' :
            currentStatus === 'acompanhando' ? 'text-yellow-500' :
            'text-ds-text-secondary'
          }`}>
            {currentScore}%
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
          currentStatus === 'quente' ? 'bg-ds-success/20 text-ds-success' :
          currentStatus === 'acompanhando' ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-ds-surface text-ds-text-secondary'
        }`}>
          {t(`status.${currentStatus}`)}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-300 hover:underline mt-2"
          >
            {t('errors.dismiss')}
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="glass-card p-6 md:p-8">
        {renderStep()}
      </div>

      {/* Skip Option */}
      {onSkip && currentStep < TOTAL_STEPS && (
        <div className="text-center mt-6">
          <button
            onClick={handleSkip}
            className="text-sm text-ds-text-tertiary hover:text-ds-text-secondary transition-colors"
          >
            {t('skip')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Phase5;
