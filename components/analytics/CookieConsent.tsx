import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import Button from '../Button';
import Card from '../ui/Card';
import { analytics, AnalyticsEvents } from '../../lib/analytics';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay check slightly to prevent flash
    const timer = setTimeout(() => {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    analytics.setConsent(true);
    analytics.trackEvent(AnalyticsEvents.CONSENT_ACCEPTED, { type: 'all' });
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    analytics.setConsent(false);
    analytics.trackEvent(AnalyticsEvents.CONSENT_REJECTED, { type: 'none' });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:max-w-md z-50 animate-slide-up">
      <Card className="p-6 bg-ds-card/95 backdrop-blur-xl border-ds-primary-500/20 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-ds-primary-500/20 rounded-lg text-ds-primary-400">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg mb-2 text-white">Privacidade e Dados</h3>
            <p className="text-sm text-ds-text-secondary mb-6 leading-relaxed">
              Usamos cookies e analytics para otimizar o motor de inteligência e melhorar sua experiência. 
              Sua privacidade é nossa prioridade.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAccept} 
                variant="primary" 
                size="sm"
                className="flex-1"
              >
                Aceitar
              </Button>
              <Button 
                onClick={handleReject} 
                variant="secondary" 
                size="sm"
                className="flex-1"
              >
                Recusar
              </Button>
            </div>
            <div className="mt-4 text-center">
               <a href="#" className="text-xs text-ds-text-tertiary hover:text-ds-primary-400 transition-colors">
                 Política de Privacidade
               </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;