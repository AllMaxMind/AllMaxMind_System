import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Check, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../ui/LoadingSpinner';
import { supabase } from '../../../../lib/supabaseClient';

interface Step5WhatsAppProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onNext: () => void;
  onBack?: () => void;
  isLoading: boolean;
  leadId: string;
  leadName?: string;
  companyName?: string;
}

export const Step5WhatsApp: React.FC<Step5WhatsAppProps> = ({
  phone,
  onPhoneChange,
  onNext,
  onBack,
  isLoading,
  leadId,
  leadName,
  companyName,
}) => {
  const { t } = useTranslation('phase5');
  const [error, setError] = useState<string | null>(null);
  const [addToGroup, setAddToGroup] = useState(true);
  const [receiveUpdates, setReceiveUpdates] = useState(true);

  const formatPhoneInput = (value: string): string => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, '');

    // Format: (XX) XXXXX-XXXX
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    onPhoneChange(formatted);
    setError(null);
  };

  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const handleSubmit = async () => {
    if (!phone) {
      // Allow skipping
      onNext();
      return;
    }

    if (!validatePhone(phone)) {
      setError(t('step5.invalidPhone'));
      return;
    }

    setIsSendingWhatsApp(true);
    setError(null);

    try {
      // Call edge function to send WhatsApp message
      const { data, error: funcError } = await supabase.functions.invoke('add-to-whatsapp', {
        body: {
          leadId,
          phone: phone.replace(/\D/g, ''),
          leadName,
          companyName,
        },
      });

      if (funcError) {
        console.error('[Step5WhatsApp] Edge function error:', funcError);
        // Don't block - continue even if WhatsApp fails
      } else if (data && !data.success) {
        console.warn('[Step5WhatsApp] WhatsApp send failed:', data.error);
        // Don't block - continue even if message send fails
      } else {
        console.log('[Step5WhatsApp] WhatsApp message sent successfully');
      }

      // Continue regardless of WhatsApp result (phone is saved)
      onNext();
    } catch (err: any) {
      console.error('[Step5WhatsApp] Error:', err);
      // Don't block on error - continue to next step
      onNext();
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleSkip = () => {
    onPhoneChange('');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-4">
          <MessageCircle className="w-6 h-6 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('step5.title')}
        </h2>
        <p className="text-ds-text-secondary text-sm">
          {t('step5.description')}
        </p>
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-ds-text-tertiary mb-2">
          {t('step5.phoneLabel')}
        </label>
        <div className="flex items-center gap-2">
          <span className="px-3 py-3 bg-ds-surface border border-ds-border rounded-lg text-ds-text-primary">
            +55
          </span>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(11) 99999-9999"
            className="input-field flex-1 py-3"
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 mt-2">{error}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 bg-ds-surface rounded-lg border border-ds-border cursor-pointer hover:border-ds-primary-500/50 transition-colors">
          <input
            type="checkbox"
            checked={addToGroup}
            onChange={(e) => setAddToGroup(e.target.checked)}
            className="mt-1 rounded border-ds-border bg-ds-surface text-ds-primary-500 focus:ring-ds-primary-500/50"
          />
          <div>
            <span className="block text-sm font-medium text-ds-text-primary">
              {t('step5.addToGroup')}
            </span>
            <span className="block text-xs text-ds-text-tertiary mt-1">
              {t('step5.addToGroupDesc')}
            </span>
          </div>
        </label>

        <label className="flex items-start gap-3 p-4 bg-ds-surface rounded-lg border border-ds-border cursor-pointer hover:border-ds-primary-500/50 transition-colors">
          <input
            type="checkbox"
            checked={receiveUpdates}
            onChange={(e) => setReceiveUpdates(e.target.checked)}
            className="mt-1 rounded border-ds-border bg-ds-surface text-ds-primary-500 focus:ring-ds-primary-500/50"
          />
          <div>
            <span className="block text-sm font-medium text-ds-text-primary">
              {t('step5.receiveUpdates')}
            </span>
            <span className="block text-xs text-ds-text-tertiary mt-1">
              {t('step5.receiveUpdatesDesc')}
            </span>
          </div>
        </label>
      </div>

      {/* Points indicator */}
      {phone && validatePhone(phone) && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-fade-in">
          <p className="text-sm text-green-500">
            <Check className="w-4 h-4 inline mr-2" />
            {t('step5.phoneValid')}
          </p>
          <p className="text-xs text-ds-text-tertiary mt-1">
            +10 {t('points')}
          </p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isLoading || isSendingWhatsApp}
            className="btn-secondary flex-1 py-3"
          >
            {t('buttons.back')}
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading || isSendingWhatsApp}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {(isLoading || isSendingWhatsApp) ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              {phone ? t('step5.connect') : t('step5.skip')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
