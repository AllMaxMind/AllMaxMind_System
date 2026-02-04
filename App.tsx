import React, { useState, useEffect } from 'react';
import { AppStage } from './types';
import LandingPage from './components/LandingPage';
import Phase2 from './components/phases/Phase2';
import Phase3 from './components/phases/Phase3';
import Phase4 from './components/phases/Phase4';
import AdminPage from './src/pages/AdminPage';
import { Navbar, Footer } from './components/layout';
import CookieConsent from './components/analytics/CookieConsent';
import { analytics, AnalyticsEvents } from './lib/analytics';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { DimensionSelection } from './lib/supabase/dimensions';
import { QuestionAnswer } from './lib/supabase/answers';

type DomainType = 'technical' | 'business' | 'strategic';

const AppContent: React.FC = () => {
  // State Machine for the Application Flow
  const [currentStage, setCurrentStage] = useState<AppStage>(AppStage.LANDING);
  const { user, userRole, loading: authLoading } = useAuth();
  const [sessionData, setSessionData] = useState<{
    problemStatement?: string;
    problemId?: string;
    domain?: DomainType;
    dimensions?: DimensionSelection[];
    refinedIntentScore?: number;
    answers?: QuestionAnswer[];
    finalComplexity?: string;
    leadId?: string;
    leadStatus?: string;
  }>({});

  // Check for hash navigation to /admin
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      if (hash === '#/admin') {
        // Check if user is authenticated and has admin role
        if (user && (userRole === 'admin' || userRole === 'super_admin')) {
          setCurrentStage(AppStage.ADMIN);
        } else if (user) {
          // User is authenticated but not admin - redirect to landing
          window.location.hash = '';
          setCurrentStage(AppStage.LANDING);
        } else {
          // User not authenticated - redirect to landing
          window.location.hash = '';
          setCurrentStage(AppStage.LANDING);
        }
      }
    };

    // Check on initial load and whenever hash changes
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, userRole]);

  // Initialize Analytics on Mount
  useEffect(() => {
    const checkConsent = localStorage.getItem('cookie_consent');
    if (checkConsent === 'accepted') {
      analytics.setConsent(true);
    }
  }, []);

  // Helper to get intent score (default score since Phase1 was removed)
  const getInitialIntentScore = (): number => {
    // Default intent score - will be refined in Phase 2
    return 50;
  };

  // Handlers
  const handleLandingAnalyze = (problemStatement: string, domain: DomainType, problemId: string) => {
    // Store data from Landing Page (integrated Phase 1 logic)
    setSessionData({
      ...sessionData,
      problemStatement,
      domain,
      problemId
    });

    analytics.trackEvent(AnalyticsEvents.PROBLEM_SUBMITTED, {
      length: problemStatement.length,
      domain: domain,
      has_context: problemStatement.length > 50,
      source: 'landing_integrated'
    });

    // Go directly to Phase 2 (Dimension Selection)
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
    analytics.trackEvent('conversion_completed', {
      lead_id: leadId,
      stage: 'phase4_complete'
    });
  };

  const goBack = () => {
    // Simple history management
    if (currentStage === AppStage.BLUEPRINT_PREVIEW) setCurrentStage(AppStage.ADAPTIVE_QUESTIONS);
    else if (currentStage === AppStage.ADAPTIVE_QUESTIONS) setCurrentStage(AppStage.DIMENSION_SELECTION);
    else if (currentStage === AppStage.DIMENSION_SELECTION) setCurrentStage(AppStage.LANDING);
  };

  // View Router
  const renderStage = () => {
    switch (currentStage) {
      case AppStage.LANDING:
        return <LandingPage onAnalyze={handleLandingAnalyze} />;

      case AppStage.DIMENSION_SELECTION:
        return (
          <Phase2
            problemId={sessionData.problemId || ''}
            problemText={sessionData.problemStatement || ''}
            initialIntentScore={getInitialIntentScore()}
            onComplete={handlePhase2Complete}
          />
        );

      case AppStage.ADAPTIVE_QUESTIONS:
        return (
          <Phase3
            problemId={sessionData.problemId || ''}
            problemText={sessionData.problemStatement || ''}
            dimensions={sessionData.dimensions || []}
            intentScore={sessionData.refinedIntentScore || 50}
            onComplete={handlePhase3Complete}
          />
        );

      case AppStage.BLUEPRINT_PREVIEW:
        return (
          <Phase4
            problemId={sessionData.problemId || ''}
            problemText={sessionData.problemStatement || ''}
            dimensions={sessionData.dimensions || []}
            questionsAnswers={sessionData.answers || []}
            complexity={sessionData.finalComplexity || 'medium'}
            onLeadCaptured={handleLeadCaptured}
          />
        );

      case AppStage.ADMIN:
        // Check admin access
        if (!user || !authLoading) {
          if (!user || (userRole !== 'admin' && userRole !== 'super_admin')) {
            // Not authenticated or not admin - redirect to landing
            setTimeout(() => setCurrentStage(AppStage.LANDING), 0);
            return (
              <div className="min-h-screen flex items-center justify-center text-white bg-ds-bg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold font-display">Redirecting...</h2>
                  <p className="text-ds-text-tertiary">You don't have access to this page</p>
                </div>
              </div>
            );
          }
        }
        return <AdminPage />;

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

  // P8: Landing page handles its own padding, other stages need pt-24 to compensate fixed navbar
  const needsNavbarPadding = currentStage !== AppStage.LANDING;

  return (
    <div className="bg-ds-bg min-h-screen text-ds-text-primary selection:bg-ds-primary-500/30 flex flex-col">
      <Navbar />
      <main className={`flex-1 ${needsNavbarPadding ? 'pt-24' : ''}`}>
        {renderStage()}
      </main>
      {currentStage === AppStage.LANDING && <Footer />}
      <CookieConsent />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
