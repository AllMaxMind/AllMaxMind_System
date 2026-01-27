import React, { useState } from 'react';
import { ArrowRight, Sparkles, ChevronDown, AlertCircle, Users, RefreshCw, Target, Brain, Shield, Zap, Lock, Clock, CheckCircle } from 'lucide-react';
import Button from './Button';
import Badge from './ui/Badge';
import { APP_NAME } from '../constants';

interface LandingPageProps {
  onAnalyze: (problem: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze }) => {
  const [problem, setProblem] = useState('');
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  const handleScrollToProblem = () => {
    const element = document.getElementById('problem-intake');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (problem.trim().length > 10) {
      onAnalyze(problem);
    }
  };

  return (
    <div className="w-full bg-ds-bg text-ds-text-primary overflow-x-hidden font-display">
      
      {/* --- HERO SECTION --- */}
      <section className="min-h-[90vh] relative flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-ds-bg z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ds-primary-900/20 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ds-accent/10 rounded-full blur-[100px]" />
          
           {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{
                 backgroundImage: `linear-gradient(rgba(32, 128, 141, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(32, 128, 141, 0.5) 1px, transparent 1px)`,
                 backgroundSize: '50px 50px'
               }} 
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center mt-10">
          
          <Badge variant="accent" pulse className="mb-6">AI-Driven Logistics Intelligence</Badge>

          {/* Glitch/Glow Text Effect */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter"
              onMouseEnter={() => setIsHoveringHero(true)}
              onMouseLeave={() => setIsHoveringHero(false)}>
            <span className="block text-white mb-2">TRANSFORME</span>
            <span className="block relative inline-block">
              <span className="bg-clip-text text-transparent bg-ds-gradient-primary">
                DORES LOGÍSTICAS
              </span>
              <span className="absolute inset-0 text-ds-accent/50 blur-lg animate-pulse opacity-50" aria-hidden="true">
                DORES LOGÍSTICAS
              </span>
            </span>
            <span className="block text-white mt-2">EM SOLUÇÕES</span>
          </h1>
          
          {/* Subtitle with typewriter effect feel */}
          <p className="text-xl md:text-2xl text-ds-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            {APP_NAME}: Fast Soft-House AI-Driven para{' '}
            <span className="text-ds-primary-400 font-semibold">Logística</span>,{' '}
            <span className="text-ds-primary-400 font-semibold">Supply Chain</span>,{' '}
            <span className="text-ds-primary-400 font-semibold">COMEX</span> e{' '}
            <span className="text-ds-primary-400 font-semibold">Financeiro</span>.
          </p>
          
          {/* Animated CTA Button */}
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-ds-gradient-primary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-glow-pulse" />
            <Button 
              size="lg" 
              className="relative px-8 py-5 text-lg"
              onClick={handleScrollToProblem}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                DESCREVA SUA DOR AGORA (GRATUITO)
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-ds-text-tertiary">
            <div className="text-center">
              <div className="text-3xl font-bold text-ds-primary-400">7 DIAS</div>
              <div className="text-sm font-medium tracking-wide">PROTÓTIPO</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ds-primary-400">100+</div>
              <div className="text-sm font-medium tracking-wide">SOLUÇÕES</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ds-primary-400">15-60</div>
              <div className="text-sm font-medium tracking-wide">DIAS IMPLEMENTAÇÃO</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={handleScrollToProblem}>
          <ChevronDown className="w-8 h-8 text-ds-primary-500/50 hover:text-ds-primary-500 transition-colors" />
        </div>
      </section>

      {/* --- SOCIAL PROOF / VALUE STRIP --- */}
      <section className="py-10 border-y border-ds-border bg-ds-surface/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {['LOGISTICS', 'SUPPLY CHAIN', 'FINTECH', 'COMEX'].map((tech) => (
             <span key={tech} className="text-xl font-bold tracking-widest text-ds-text-tertiary">{tech} AI</span>
          ))}
        </div>
      </section>

      {/* --- PROBLEM INTAKE SECTION (Integrated Phase 1) --- */}
      <section id="problem-intake" className="py-24 relative bg-ds-bg">
        <div className="container mx-auto px-4">
          <div className="glass-card p-8 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
            {/* Decorator */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-ds-primary-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center md:text-left">
                Descreva sua dor operacional
              </h2>
              <p className="text-ds-text-secondary mb-10 text-lg md:max-w-2xl">
                Use as guias abaixo para estruturar seu pensamento. Quanto mais detalhes, mais preciso será nosso diagnóstico inicial.
              </p>
              
              {/* Thinking Guides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: AlertCircle, text: "O problema que quero resolver é…" },
                  { icon: Users, text: "Quem tem essa dor na empresa?" },
                  { icon: RefreshCw, text: "Como resolvem hoje?" },
                  { icon: Target, text: "Cenário ideal (como gostaria que fosse)" }
                ].map((guide, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-ds-surface/50 rounded-xl border border-ds-border/50 hover:border-ds-primary-500/30 transition-colors">
                    <guide.icon className="w-5 h-5 text-ds-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-ds-text-secondary">{guide.text}</span>
                  </div>
                ))}
              </div>
              
              {/* Text Area with Character Counter & AI Assistant */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-ds-primary-500 to-ds-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <textarea
                  className="relative w-full p-6 bg-ds-bg/90 border border-ds-border rounded-xl text-lg text-ds-text-primary placeholder-ds-text-tertiary focus:outline-none focus:ring-2 focus:ring-ds-primary-500/50 min-h-[240px] resize-none leading-relaxed"
                  placeholder="Exemplo: 'Preciso automatizar o processo de importação que hoje é feito manualmente em Excel, causando erros frequentes nos cálculos de impostos e atrasos na liberação aduaneira...'"
                  maxLength={2000}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
                
                {/* AI Assistant Floating Icon */}
                <div className="absolute bottom-6 right-6 p-2 bg-ds-primary-500/10 rounded-lg animate-pulse-slow pointer-events-none">
                  <Brain className="w-6 h-6 text-ds-primary-400" />
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 mb-8">
                <span className="text-sm text-ds-text-tertiary flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Dados criptografados e seguros
                </span>
                <span className="text-sm text-ds-text-tertiary font-mono">
                  <span className={problem.length > 0 ? "text-ds-primary-400" : ""}>{problem.length}</span>/2000
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="flex-1 text-center justify-center py-4"
                  onClick={handleSubmit}
                  disabled={problem.length < 10}
                >
                  ANALISAR MINHA DOR COM IA
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="flex-1 text-center justify-center py-4"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  VER EXEMPLOS DE SOLUÇÕES
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS / VALUE PROP --- */}
      <section className="py-20 bg-ds-surface/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-ds-card/50 border border-ds-border/50 hover:bg-ds-card transition-all">
              <Zap className="w-10 h-10 text-ds-warning mb-4" />
              <h3 className="text-xl font-bold mb-2">Velocidade Extrema</h3>
              <p className="text-ds-text-secondary">De zero a protótipo em 7 dias. Validamos sua ideia antes de escrever uma linha de código complexo.</p>
            </div>
            <div className="p-6 rounded-2xl bg-ds-card/50 border border-ds-border/50 hover:bg-ds-card transition-all">
              <Brain className="w-10 h-10 text-ds-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Deep Reasoning AI</h3>
              <p className="text-ds-text-secondary">Utilizamos Gemini 3 Pro para desconstruir problemas complexos em arquiteturas escaláveis.</p>
            </div>
            <div className="p-6 rounded-2xl bg-ds-card/50 border border-ds-border/50 hover:bg-ds-card transition-all">
              <Lock className="w-10 h-10 text-ds-success mb-4" />
              <h3 className="text-xl font-bold mb-2">Enterprise Grade</h3>
              <p className="text-ds-text-secondary">Segurança, compliance e escalabilidade desde o primeiro dia. Seus dados são sua propriedade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-ds-border bg-ds-bg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center opacity-50">
          <div className="mb-4 md:mb-0">
            <span className="font-display font-bold text-lg">{APP_NAME}</span>
            <span className="text-sm ml-2">© 2025</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-ds-primary-400">Privacidade</a>
            <a href="#" className="hover:text-ds-primary-400">Termos</a>
            <a href="#" className="hover:text-ds-primary-400">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;