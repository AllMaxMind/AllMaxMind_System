export class SessionManager {
  private sessionStart: Date;
  private lastActivity: Date;
  private activityTimeout = 30 * 60 * 1000; // 30 minutes
  private isActive: boolean = true;
  
  constructor() {
    this.sessionStart = new Date();
    this.lastActivity = new Date();
    if (typeof window !== 'undefined') {
      this.setupActivityListeners();
      this.setupVisibilityChange();
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

    events.forEach(event => {
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
  
  public getSessionDuration(): number {
    return Date.now() - this.sessionStart.getTime();
  }
  
  public isSessionActive(): boolean {
    const now = Date.now();
    const isTimeout = now - this.lastActivity.getTime() > this.activityTimeout;
    if (isTimeout) this.isActive = false;
    return this.isActive;
  }
}