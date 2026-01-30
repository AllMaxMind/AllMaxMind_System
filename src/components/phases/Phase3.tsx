import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';

interface Phase3Props {
  questions: { id: string; text: string }[];
  onSubmit: (answers: Record<string, string>) => void;
  loading?: boolean;
}

export const Phase3 = ({ questions, onSubmit, loading = false }: Phase3Props) => {
  const { t, i18n } = useTranslation('phase3');
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>
      <p className="text-gray-600">{t('subtitle')}</p>
      <div className="text-sm text-gray-500 mb-4">
        {t('progress', { current: '1', total: questions.length })}
      </div>
      {questions.map((q, idx) => (
        <div key={q.id} className="space-y-2">
          <label className="font-semibold text-gray-900">
            {idx + 1}. {q.text}
          </label>
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            placeholder={t('placeholders.answer')}
            className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      ))}
      <Button onClick={() => onSubmit(answers)} loading={loading} className="w-full">
        {t('buttons.next')}
      </Button>
    </div>
  );
};
