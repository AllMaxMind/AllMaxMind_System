import React from 'react';
import { Button } from '../Button';

interface Phase2Props {
  onSubmit: (dimensions: string[]) => void;
  loading?: boolean;
}

export const Phase2 = ({ onSubmit, loading = false }: Phase2Props) => {
  const [selected, setSelected] = React.useState<string[]>([]);

  const dimensions = ['Technical', 'Business', 'Resource', 'Timeline', 'Risk'];

  const handleToggle = (dim: string) => {
    setSelected(prev =>
      prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Affected Dimensions</h2>
      <div className="space-y-2">
        {dimensions.map(dim => (
          <label key={dim} className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(dim)}
              onChange={() => handleToggle(dim)}
              disabled={loading}
              className="w-4 h-4 mr-2"
            />
            <span>{dim}</span>
          </label>
        ))}
      </div>
      <Button onClick={() => onSubmit(selected)} loading={loading} className="w-full">
        Continue
      </Button>
    </div>
  );
};
