// Analytics module - Tracks user events and interactions

export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  console.log(`[Analytics] Event: ${eventName}`, data);

  // Send to analytics service (Google Analytics, etc)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, data);
  }
}

export function trackPageView(pageName: string) {
  trackEvent('page_view', { page_name: pageName });
}

export function trackConversion(conversionType: string, value?: number) {
  trackEvent('conversion', { type: conversionType, value });
}

export const analytics = {
  trackEvent,
  trackPageView,
  trackConversion,
};
