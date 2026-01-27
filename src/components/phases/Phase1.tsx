import React from 'react';
import { Button } from '../Button';

interface Phase1Props {
  onSubmit?: (data: { problemText: string; domain: string }) => void;
  onComplete?: (data: { problemText: string; domain: string }) => void;
  loading?: boolean;
}

export const Phase1 = ({ onSubmit, onComplete, loading = false }: Phase1Props) => {
  const [problemText, setProblemText] = React.useState('');
  const [domain, setDomain] = React.useState('technical');

  const handleSubmit = () => {
    if (problemText.trim()) {
      const data = { problemText, domain };
      if (onSubmit) {
        onSubmit(data);
      }
      if (onComplete) {
        onComplete(data);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Define Your Problem</h2>
      <textarea
        value={problemText}
        onChange={(e) => setProblemText(e.target.value)}
        placeholder="Describe your problem in detail..."
        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <select
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="technical">Technical</option>
        <option value="business">Business</option>
        <option value="strategic">Strategic</option>
      </select>
      <Button onClick={handleSubmit} loading={loading} className="w-full">
        Continue
      </Button>
    </div>
  );
};

export default Phase1;
