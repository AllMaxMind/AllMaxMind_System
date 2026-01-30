import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';

interface Phase2Props {
  onSubmit: (dimensions: string[]) => void;
  loading?: boolean;
}

export const Phase2 = ({ onSubmit, loading = false }: Phase2Props) => {
  const { t } = useTranslation('phase2');
  const [selected, setSelected] = React.useState<string[]>([]);

  const dimensionKeys = ['technical_impact', 'business_scope', 'resource_constraint', 'urgency', 'complexity'];

  const handleToggle = (dimKey: string) => {
    setSelected(prev =>
      prev.includes(dimKey) ? prev.filter(d => d !== dimKey) : [...prev, dimKey]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>
      <p className="text-gray-600">{t('subtitle')}</p>
      <div className="space-y-4">
        {dimensionKeys.map(dimKey => (
          <div key={dimKey} className="p-4 border border-gray-200 rounded-lg">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(dimKey)}
                onChange={() => handleToggle(dimKey)}
                disabled={loading}
                className="w-4 h-4 mr-3 mt-1"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{t(`dimensions.${dimKey}.label`)}</div>
                <p className="text-sm text-gray-600 mt-1">{t(`dimensions.${dimKey}.description`)}</p>
              </div>
            </label>
          </div>
        ))}
      </div>
      <Button onClick={() => onSubmit(selected)} loading={loading} className="w-full">
        {t('buttons.next')}
      </Button>
    </div>
  );
};
