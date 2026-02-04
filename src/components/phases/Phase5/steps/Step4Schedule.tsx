import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, ArrowRight, Clock } from 'lucide-react';
import LoadingSpinner from '../../../ui/LoadingSpinner';

interface Step4ScheduleProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  onNext: () => void;
  onBack?: () => void;
  isLoading: boolean;
}

// Simulated available time slots
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export const Step4Schedule: React.FC<Step4ScheduleProps> = ({
  date,
  onDateChange,
  onNext,
  onBack,
  isLoading,
}) => {
  const { t } = useTranslation('phase5');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate next 5 available days (skip weekends)
  const getAvailableDays = () => {
    const days: Date[] = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow

    while (days.length < 5) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const availableDays = getAvailableDays();

  const handleDateSelect = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const fullDate = new Date(day);
      fullDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onDateChange(fullDate);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':');
      const fullDate = new Date(selectedDate);
      fullDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      onDateChange(fullDate);
    }
  };

  const handleSkipSchedule = () => {
    onDateChange(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ds-primary-500/20 mb-4">
          <CalendarCheck className="w-6 h-6 text-ds-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('step4.title')}
        </h2>
        <p className="text-ds-text-secondary text-sm">
          {t('step4.description')}
        </p>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-ds-text-tertiary mb-3">
          {t('step4.selectDate')}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {availableDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => handleDateSelect(day)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-ds-primary-500 bg-ds-primary-500/10'
                    : 'border-ds-border bg-ds-surface hover:border-ds-primary-500/50'
                }`}
              >
                <span className="block text-xs text-ds-text-tertiary uppercase">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </span>
                <span className="block text-lg font-bold text-ds-text-primary">
                  {day.getDate()}
                </span>
                <span className="block text-xs text-ds-text-tertiary">
                  {day.toLocaleDateString('pt-BR', { month: 'short' })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-ds-text-tertiary mb-3">
            {t('step4.selectTime')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'border-ds-primary-500 bg-ds-primary-500/10'
                      : 'border-ds-border bg-ds-surface hover:border-ds-primary-500/50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-ds-primary-400" />
                  <span className="font-medium text-ds-text-primary">{time}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Summary */}
      {date && (
        <div className="p-4 bg-ds-success/10 border border-ds-success/30 rounded-lg animate-fade-in">
          <p className="text-sm text-ds-success">
            <CalendarCheck className="w-4 h-4 inline mr-2" />
            {t('step4.scheduled')}: {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })} {t('step4.at')} {selectedTime}
          </p>
          <p className="text-xs text-ds-text-tertiary mt-1">
            +30 {t('points')}
          </p>
        </div>
      )}

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
          onClick={date ? onNext : handleSkipSchedule}
          disabled={isLoading}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              {date ? t('buttons.continue') : t('step4.skipSchedule')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
