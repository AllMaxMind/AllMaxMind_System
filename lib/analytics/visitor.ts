export class VisitorTracker {
  private visitorId: string;
  private sessionId: string;
  
  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
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