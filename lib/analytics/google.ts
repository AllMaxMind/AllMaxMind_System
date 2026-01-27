declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Safely access environment variables
const getEnvVar = (key: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}
  return undefined;
};

export class GoogleAnalytics {
  private measurementId: string | undefined;
  private gtmId: string | undefined;
  private initialized: boolean = false;
  
  constructor() {
    this.measurementId = getEnvVar('REACT_APP_GA4_ID') || getEnvVar('VITE_GA4_MEASUREMENT_ID');
    this.gtmId = getEnvVar('REACT_APP_GTM_ID') || getEnvVar('VITE_GTM_CONTAINER_ID');
  }
  
  public init(consentGiven: boolean) {
    if (this.initialized) return;
    
    // Only initialize GTM/GA4 if consent is given or strictly required by config
    // For strict GDPR, we usually wait for explicit consent.
    // Here we initialize if consent is present in storage or passed as true.
    if (consentGiven) {
        if (this.gtmId) this.initGTM();
        if (this.measurementId) this.initGA4();
        this.initialized = true;
    }
  }

  private initGTM() {
    if (!this.gtmId) return;
    
    (function(w: any, d: any, s: any, l: any, i: any) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', this.gtmId);
  }
  
  private initGA4() {
    if (!this.measurementId) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: true,
      anonymize_ip: true 
    });
  }
  
  public trackEvent(eventName: string, eventParams: Record<string, any> = {}) {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
        timestamp: new Date().toISOString()
      });
    }
  }
}