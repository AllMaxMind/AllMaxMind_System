import React, { useEffect, useState } from 'react';
import Button from './Button';
import { APP_NAME, APP_TAGLINE } from '../constants';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Badge from './ui/Badge';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 bg-ds-bg">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full bg-ds-bg z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-ds-primary-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-ds-accent/10 rounded-full blur-[100px] mix-blend-screen" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 max-w-4xl w-full text-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Floating Badge */}
        <div className="flex justify-center mb-8 animate-float">
          <Badge variant="primary" pulse>System Online v1.0</Badge>
        </div>

        {/* Hero Text */}
        <h1 className="font-display font-bold tracking-tight text-white mb-6 leading-[1.1]">
          {APP_NAME}
          <span className="block text-transparent bg-clip-text bg-ds-gradient-primary">
             PROTOCOL
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-ds-text-secondary max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          {APP_TAGLINE}. Transform chaotic thoughts into structured strategic blueprints using next-generation AI reasoning.
        </p>

        {/* Call to Action Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Button 
            variant="glow" 
            size="lg" 
            onClick={onStart} 
            className="w-full sm:w-auto"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Initiate Sequence
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="w-full sm:w-auto group"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            View Documentation
            <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>

        {/* Feature Grid (Mini Preview) */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
           {[
             { label: "Deep Reasoning", val: "Gemini 3 Pro" },
             { label: "Architecture", val: "Mobile-First" },
             { label: "Latency", val: "< 50ms" },
             { label: "Security", val: "Edge Encrypted" }
           ].map((stat, i) => (
             <div key={i} className="p-4 rounded-xl glass-card border-ds-border/50 hover:bg-ds-surface/50 transition-colors">
               <div className="text-ds-text-tertiary text-xs uppercase tracking-wider mb-1">{stat.label}</div>
               <div className="text-ds-text-primary font-mono font-medium">{stat.val}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;