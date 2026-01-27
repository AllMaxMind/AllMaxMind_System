import React, { useState } from 'react';
import Button from './Button';
import Card from './ui/Card';
import { generateStructuralAnalysis } from '../services/geminiService';

interface ProblemIntakeProps {
  onNext: (data: string) => void;
  onBack: () => void;
}

const ProblemIntake: React.FC<ProblemIntakeProps> = ({ onNext, onBack }) => {
  const [problem, setProblem] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsAnalyzing(true);
    try {
      // In a real scenario, we might pre-validate here with Gemini
      // For now, we simulate the handoff to the next stage
      await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
      onNext(problem);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen px-4 py-8 max-w-2xl mx-auto justify-center bg-ds-bg">
      <div className="space-y-8 animate-fade-in">
        <div className="text-center md:text-left">
          <h2 className="text-ds-text-primary mb-2">Identify the Obstacle</h2>
          <p className="text-ds-text-secondary">Describe the challenge you are facing. Be as raw and unstructured as needed. The system will organize it.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-1 bg-transparent border-0 shadow-none">
             {/* Glow effect wrapper */}
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-ds-gradient-primary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
               <div className="relative">
                  <textarea
                    className="input-field min-h-[240px] resize-none text-lg leading-relaxed bg-ds-card/90"
                    placeholder="e.g., I need to scale my engineering team without losing our startup culture, but budget is tight..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    autoFocus
                  />
               </div>
            </div>
          </Card>

          <div className="flex justify-between items-center pt-2">
             <Button type="button" variant="ghost" onClick={onBack}>
               Back
             </Button>
             <Button 
               type="submit" 
               variant="primary" 
               size="lg" 
               disabled={problem.length < 10}
               isLoading={isAnalyzing}
             >
               Analyze Vector
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemIntake;