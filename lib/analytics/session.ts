import { supabase } from '../supabaseClient';

interface SessionRecord {
  session_id: string;
  visitor_id: string;
  session_start: string;
  session_end?: string;
  scroll_depth: number;
  session_duration: number;
  click_count: number;
  page_views: number;
  created_at: string;
}

export class SessionManager {
  private sessionStart: Date;
  private lastActivity: Date;
  private activityTimeout = 30 * 60 * 1000; // 30 minutes
  private isActive: boolean = true;
  private clickCount = 0;
  private pageViews = 1;
  private maxScrollDepth = 0;
  private persistenceInterval?: NodeJS.Timer;
  private hasPersistedSession = false;

  constructor(private visitorId: string, private sessionId: string) {
    this.sessionStart = new Date();
    this.lastActivity = new Date();
    if (typeof window !== 'undefined') {
      this.setupActivityListeners();
      this.setupVisibilityChange();
      this.setupSessionPersistence();
    }
  }

  private setupActivityListeners() {
    const events = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function(this: any) {
        if (!inThrottle) {
          func.apply(this, arguments);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };

    const updateActivity = throttle(() => this.recordActivity(), 1000);

    // Track clicks
    document.addEventListener('click', () => {
      this.clickCount++;
      updateActivity.call(this);
    }, { passive: true });

    // Track scroll depth
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
      updateActivity.call(this);
    }, { passive: true });

    // Track other events
    const otherEvents = ['keydown', 'mousemove', 'touchstart'];
    otherEvents.forEach(event => {
      document.addEventListener(event, updateActivity as EventListener, { passive: true });
    });
  }

  private setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.recordActivity();
      }
    });
  }

  private recordActivity() {
    this.lastActivity = new Date();
    this.isActive = true;
  }

  private setupSessionPersistence() {
    // Persist session data every 30 seconds
    this.persistenceInterval = setInterval(() => {
      this.persistSessionToSupabase();
    }, 30000);

    // Also persist on page unload
    window.addEventListener('beforeunload', () => {
      if (this.persistenceInterval) clearInterval(this.persistenceInterval);
      this.persistSessionToSupabase(true);
    });
  }

  private async persistSessionToSupabase(isFinal = false): Promise<void> {
    try {
      const now = new Date().toISOString();
      const sessionDuration = Date.now() - this.sessionStart.getTime();

      const sessionRecord: SessionRecord = {
        session_id: this.sessionId,
        visitor_id: this.visitorId,
        session_start: this.sessionStart.toISOString(),
        session_end: isFinal ? now : undefined,
        scroll_depth: this.maxScrollDepth,
        session_duration: sessionDuration,
        click_count: this.clickCount,
        page_views: this.pageViews,
        created_at: this.sessionStart.toISOString()
      };

      const { error } = await supabase
        .from('sessions')
        .upsert(sessionRecord, { onConflict: 'session_id' });

      if (error) {
        // Silently ignore AbortError - expected when component unmounts or page transitions
        if (error.message?.includes('AbortError') || error.message?.includes('aborted')) {
          return;
        }
        console.warn('[Analytics] Could not persist session:', error.message);
      } else if (!this.hasPersistedSession) {
        console.log('[Analytics] ✅ Session persisted:', this.sessionId);
        this.hasPersistedSession = true;
      }
    } catch (error) {
      // Silently ignore AbortError - expected when component unmounts or page transitions
      if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
        return;
      }
      console.error('[Analytics] Error persisting session:', error);
      // Non-critical - continue anyway
    }
  }

  public getSessionDuration(): number {
    return Date.now() - this.sessionStart.getTime();
  }

  public isSessionActive(): boolean {
    const now = Date.now();
    const isTimeout = now - this.lastActivity.getTime() > this.activityTimeout;
    if (isTimeout) this.isActive = false;
    return this.isActive;
  }

  public getSessionMetrics() {
    return {
      duration: this.getSessionDuration(),
      clickCount: this.clickCount,
      maxScrollDepth: this.maxScrollDepth,
      pageViews: this.pageViews
    };
  }

  public destroy() {
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
    }
    this.persistSessionToSupabase(true);
  }
}