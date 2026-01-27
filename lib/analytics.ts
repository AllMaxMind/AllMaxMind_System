import { VisitorTracker } from './analytics/visitor';
import { SessionManager } from './analytics/session';
import { GoogleAnalytics } from './analytics/google';
import { PerformanceMonitor } from './analytics/performance';

export const AnalyticsEvents = {
  SESSION_START: 'session_start',
  PROBLEM_SUBMITTED: 'problem_submitted',
  BLUEPRINT_GENERATED: 'blueprint_generated',
  ERROR_OCCURRED: 'error_occurred',
  PAGE_VIEW: 'page_view',
  CONSENT_ACCEPTED: 'cookie_consent_accepted',
  CONSENT_REJECTED: 'cookie_consent_rejected'
};

/**
 * Unified Analytics Interface for ALL MAX MIND
 * Handles dispatching events to GA4, GTM, or other providers.
 */

type EventParams = Record<string, string | number | boolean | null | undefined>;

class AnalyticsService {
  private visitorTracker: VisitorTracker;
  private sessionManager: SessionManager;
  private googleAnalytics: GoogleAnalytics;
  private performanceMonitor: PerformanceMonitor;
  private consentGiven: boolean = false;

  constructor() {
    this.visitorTracker = new VisitorTracker();
    this.sessionManager = new SessionManager();
    this.googleAnalytics = new GoogleAnalytics();
    
    this.performanceMonitor = new PerformanceMonitor((metric, value, rating) => {
      this.trackEvent(`web_vital_${rating}`, { metric, value });
    });

    // Check for existing consent
    if (typeof window !== 'undefined') {
        const storedConsent = localStorage.getItem('cookie_consent');
        if (storedConsent === 'accepted') {
            this.setConsent(true);
        }
    }
  }

  public setConsent(accepted: boolean) {
    this.consentGiven = accepted;
    if (accepted) {
      this.googleAnalytics.init(true);
      this.performanceMonitor.trackCoreWebVitals();
      
      // Track session start if not already tracked this session load
      this.trackEvent(AnalyticsEvents.SESSION_START, {
         ...this.visitorTracker.getPassiveData(),
         referrer: document.referrer
      });
    }
  }

  public trackEvent(eventName: string, params?: EventParams) {
    // We only track if consent is given, OR if the event is critical/internal (GDPR compliant logic needed here)
    // For this implementation, we allow internal logging but gate GA4/External calls behind consent
    
    const enrichedParams = {
      ...params,
      visitor_id: this.visitorTracker.getVisitorId(),
      session_id: this.visitorTracker.getSessionId(),
      session_duration: this.sessionManager.getSessionDuration(),
    };

    // Console Log (Dev only)
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[Analytics] ${eventName}`, enrichedParams);
    }

    // External Providers (GTM / GA4) - only if consent given
    if (this.consentGiven) {
      this.googleAnalytics.trackEvent(eventName, enrichedParams);
    }
  }
}

export const analytics = new AnalyticsService();

export const trackEvent = (eventName: string, params?: EventParams) => {
  analytics.trackEvent(eventName, params);
};