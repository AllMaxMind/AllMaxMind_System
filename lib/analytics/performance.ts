export class PerformanceMonitor {
  private reportCallback: (metric: string, value: number, rating: 'good' | 'poor' | 'needs-improvement') => void;
  
  constructor(reportCallback: (metric: string, value: number, rating: 'good' | 'poor' | 'needs-improvement') => void) {
    this.reportCallback = reportCallback;
  }
  
  public trackCoreWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // LCP (Largest Contentful Paint)
      // Goal: < 2500ms
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          // PerformanceEntry interface for LCP includes 'startTime'
          const lcp = lastEntry.startTime;
          this.report(
            'LCP', 
            lcp, 
            lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor'
          );
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // FID (First Input Delay)
      // Goal: < 100ms
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          // processingStart and startTime exist on PerformanceEventTiming
          if (entry.processingStart) {
             const fid = entry.processingStart - entry.startTime;
             this.report(
               'FID', 
               fid, 
               fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor'
             );
          }
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

    } catch (e) {
      // Observer might fail in some contexts or browsers
      console.warn("[Analytics] Performance observer error:", e);
    }
  }

  private report(metric: string, value: number, rating: 'good' | 'poor' | 'needs-improvement') {
    this.reportCallback(metric, Math.round(value), rating);
  }
}