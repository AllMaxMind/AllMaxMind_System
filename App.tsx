import React, { useState, useEffect } from 'react';
import { AppStage } from './types';
import LandingPage from './components/LandingPage';
import Phase1 from './components/phases/Phase1';
import Phase2 from './components/phases/Phase2';
import Phase3 from './components/phases/Phase3';
import Phase4 from './components/phases/Phase4';
import CookieConsent from './components/analytics/CookieConsent';
import { analytics, AnalyticsEvents } from './lib/analytics';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { DimensionSelection } from './lib/supabase/dimensions';
import { QuestionAnswer } from './lib/supabase/answers';

const App: React.FC = () => {
  // State Machine for the 10-Stage Plan
  const [currentStage, setCurrentStage] = useState<AppStage>(AppStage.LANDING);
  const [sessionData, setSessionData] = useState<any>({});

  // Initialize Analytics on Mount
  useEffect(() => {
    const checkConsent = localStorage.getItem('cookie_consent');
    if (checkConsent === 'accepted') {
        analytics.setConsent(true);
    }
  }, []);

  // Helper to get intent score (from Phase 1 storage if available, else default)
  const getInitialIntentScore = (problemId: string): number => {
    try {
      const local = localStorage.getItem(`problem_${problemId}`);
      if (local) {
        return JSON.parse(local).intent_score || 50;
      }
    } catch (e) {
      console.warn("Could not retrieve local problem data", e);
    }
    return 50;
  };

  // Handlers
  const handleLandingAnalyze = (problemStatement: string) => {
    // Store preliminary data
    setSessionData({ ...sessionData, problemStatement });
    
    analytics.trackEvent(AnalyticsEvents.PROBLEM_SUBMITTED, {
        length: problemStatement.length,
        has_context: problemStatement.length > 50,
        source: 'landing_hero'
    });

    // Move to Phase 1 (Problem Intake)
    setCurrentStage(AppStage.PROBLEM_INTAKE);
  };

  const handlePhase1Complete = (problemId: string) => {
    setSessionData(prev => ({ ...prev, problemId }));
    // Transition to Phase 2
    setCurrentStage(AppStage.DIMENSION_SELECTION);
  };

  const handlePhase2Complete = (selections: DimensionSelection[], refinedScore: number) => {
    setSessionData(prev => ({ 
      ...prev, 
      dimensions: selections,
      refinedIntentScore: refinedScore 
    }));
    
    // Transition to Phase 3 (Adaptive Questions)
    setCurrentStage(AppStage.ADAPTIVE_QUESTIONS);
  };

  const handlePhase3Complete = (answers: QuestionAnswer[], finalComplexity: string) => {
      setSessionData(prev => ({
          ...prev,
          answers,
          finalComplexity
      }));

      // Transition to Phase 4 (Blueprint Preview)
      setCurrentStage(AppStage.BLUEPRINT_PREVIEW);
  };

  const handleLeadCaptured = (leadId: string, leadStatus: string) => {
     setSessionData(prev => ({
       ...prev,
       leadId,
       leadStatus
     }));
     // Currently we stay in Phase 4 to show the unlocked content
     // In future phases, this might trigger a redirect to a dashboard
     analytics.trackEvent('conversion_completed', {
       lead_id: leadId,
       stage: 'phase4_complete'
     });
  };

  const goBack = () => {
    // Simple history management for dev/testing
    if (currentStage === AppStage.BLUEPRINT_PREVIEW) setCurrentStage(AppStage.ADAPTIVE_QUESTIONS);
    else if (currentStage === AppStage.ADAPTIVE_QUESTIONS) setCurrentStage(AppStage.DIMENSION_SELECTION);
    else if (currentStage === AppStage.DIMENSION_SELECTION) setCurrentStage(AppStage.PROBLEM_INTAKE);
    else if (currentStage === AppStage.PROBLEM_INTAKE) setCurrentStage(AppStage.LANDING);
  };

  // View Router
  const renderStage = () => {
    switch (currentStage) {
      case AppStage.LANDING:
        return <LandingPage onAnalyze={handleLandingAnalyze} />;
      
      case AppStage.PROBLEM_INTAKE:
        return (
          <Phase1 
             onComplete={handlePhase1Complete} 
             initialText={sessionData.problemStatement} 
          />
        );

      case AppStage.DIMENSION_SELECTION:
        return (
          <Phase2 
            problemId={sessionData.problemId}
            problemText={sessionData.problemStatement}
            initialIntentScore={getInitialIntentScore(sessionData.problemId)}
            onComplete={handlePhase2Complete}
          />
        );
      
      case AppStage.ADAPTIVE_QUESTIONS:
        return (
           <Phase3
              problemId={sessionData.problemId}
              problemText={sessionData.problemStatement}
              dimensions={sessionData.dimensions}
              intentScore={sessionData.refinedIntentScore}
              onComplete={handlePhase3Complete}
           />
        );

      case AppStage.BLUEPRINT_PREVIEW:
        return (
          <Phase4
            problemId={sessionData.problemId}
            problemText={sessionData.problemStatement}
            dimensions={sessionData.dimensions}
            questionsAnswers={sessionData.answers}
            complexity={sessionData.finalComplexity}
            onLeadCaptured={handleLeadCaptured}
          />
        );
        
      default:
        return (
          <div className="min-h-screen flex items-center justify-center text-white bg-ds-bg">
            <div className="text-center">
              <h2 className="text-2xl font-bold font-display">Module Under Construction</h2>
              <p className="text-ds-text-tertiary">Stage: {currentStage}</p>
              <button 
                onClick={() => setCurrentStage(AppStage.LANDING)}
                className="mt-4 text-ds-primary-400 hover:underline"
              >
                Return to Base
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <main className="bg-ds-bg min-h-screen text-ds-text-primary selection:bg-ds-primary-500/30">
          {renderStage()}
          <CookieConsent />
        </main>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
