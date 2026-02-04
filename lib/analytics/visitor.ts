import { supabase } from '../supabaseClient';

interface VisitorRecord {
  anonymous_id: string;
  ip?: string;
  country?: string;
  city?: string;
  device?: string;
  os?: string;
  browser?: string;
  browser_version?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  language?: string;
  timezone?: string;
  screen_resolution?: string;
  created_at: string;
  last_seen: string;
  total_sessions?: number;
}

export class VisitorTracker {
  private visitorId: string;
  private sessionId: string;
  private hasPersistedVisitor = false;
  private abortController: AbortController | null = null;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.abortController = new AbortController();
    this.persistVisitorToSupabase();
  }

  /**
   * Cleanup method to abort any pending operations
   * Call this when the tracker is no longer needed (e.g., component unmount)
   */
  public destroy(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  public getVisitorId(): string {
    return this.visitorId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  private getOrCreateVisitorId(): string {
    try {
      const storedId = localStorage.getItem('am_visitor_id');
      if (storedId) return storedId;

      const newId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('am_visitor_id', newId);
      return newId;
    } catch (e) {
      // Fallback for incognito/private mode where localStorage might fail
      return `vis_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  private getOrCreateSessionId(): string {
    try {
        const storedSession = sessionStorage.getItem('am_session_id');
        if (storedSession) return storedSession;

        const newSession = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('am_session_id', newSession);
        return newSession;
    } catch (e) {
        return `sess_temp_${Date.now()}`;
    }
  }

  private parseUserAgent(): { device: string; os: string; browser: string; browserVersion: string } {
    const ua = navigator.userAgent;

    // Detect device
    let device = 'desktop';
    if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) {
      device = 'mobile';
    } else if (/ipad|tablet|kindle/i.test(ua)) {
      device = 'tablet';
    }

    // Detect OS
    let os = 'unknown';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac|iphone|ipad|ipod/i.test(ua)) os = 'macOS';
    else if (/linux|android/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';

    // Detect browser
    let browser = 'unknown';
    let browserVersion = 'unknown';

    if (/chrome|chromium|crios/i.test(ua)) {
      browser = 'Chrome';
      browserVersion = ua.match(/chrome\/(\d+)/i)?.[1] || 'unknown';
    } else if (/firefox/i.test(ua)) {
      browser = 'Firefox';
      browserVersion = ua.match(/firefox\/(\d+)/i)?.[1] || 'unknown';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
      browser = 'Safari';
      browserVersion = ua.match(/version\/(\d+)/i)?.[1] || 'unknown';
    } else if (/edg/i.test(ua)) {
      browser = 'Edge';
      browserVersion = ua.match(/edg\/(\d+)/i)?.[1] || 'unknown';
    }

    return { device, os, browser, browserVersion };
  }

  private getUTMParams(): Record<string, string | null> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign')
    };
  }

  private async persistVisitorToSupabase(): Promise<void> {
    if (this.hasPersistedVisitor) return;

    try {
      // Check if already aborted before starting
      if (this.abortController?.signal.aborted) {
        return;
      }

      const { device, os, browser, browserVersion } = this.parseUserAgent();
      const utmParams = this.getUTMParams();
      const now = new Date().toISOString();

      const visitorRecord: VisitorRecord = {
        anonymous_id: this.visitorId,
        device,
        os,
        browser,
        browser_version: browserVersion,
        source: utmParams.utm_source || 'direct',
        utm_source: utmParams.utm_source || undefined,
        utm_medium: utmParams.utm_medium || undefined,
        utm_campaign: utmParams.utm_campaign || undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_resolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : undefined,
        created_at: now,
        last_seen: now,
        total_sessions: 1
      };

      console.log('[Analytics] Persisting visitor to Supabase...');

      const { error } = await supabase
        .from('visitors')
        .upsert(visitorRecord, { onConflict: 'anonymous_id' });

      // Check if aborted during the async operation
      if (this.abortController?.signal.aborted) {
        return;
      }

      if (error) {
        // Silently ignore AbortError - expected when component unmounts or page transitions
        if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
          return;
        }
        console.warn('[Analytics] Could not persist visitor:', error.message);
        // Don't throw - non-critical for UX
      } else {
        console.log('[Analytics] ✅ Visitor persisted:', this.visitorId);
        this.hasPersistedVisitor = true;
      }
    } catch (error) {
      // Silently ignore AbortError - this is expected when component unmounts
      if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
        return;
      }
      console.error('[Analytics] Error persisting visitor:', error);
      // Non-critical - continue anyway
    }
  }

  public getPassiveData() {
    return {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown',
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
  }
}