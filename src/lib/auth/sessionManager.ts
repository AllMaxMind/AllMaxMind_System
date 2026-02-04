/**
 * Session Manager
 * Story: SPRINT-2-P3 (Auth + Session)
 *
 * Manages anonymous session IDs for pre-authentication blueprint tracking.
 * Sessions are linked to user accounts post-authentication.
 */

const SESSION_KEY = 'session_id';
const SESSION_CREATED_KEY = 'session_created_at';

/**
 * Generate a new UUID v4 session ID
 */
function generateSessionId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create session ID
 * Persists in localStorage and returns the same ID across page reloads
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId(); // SSR fallback
  }

  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
    localStorage.setItem(SESSION_CREATED_KEY, new Date().toISOString());
    console.log('[Session] New session created:', sessionId.substring(0, 8) + '...');
  }

  return sessionId;
}

/**
 * Check if session exists
 */
export function hasSession(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(SESSION_KEY);
}

/**
 * Get session creation timestamp
 */
export function getSessionCreatedAt(): Date | null {
  if (typeof window === 'undefined') return null;
  const timestamp = localStorage.getItem(SESSION_CREATED_KEY);
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Clear session (called after successful auth linking)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  const sessionId = localStorage.getItem(SESSION_KEY);
  if (sessionId) {
    console.log('[Session] Session cleared after linking:', sessionId.substring(0, 8) + '...');
  }

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_CREATED_KEY);
}

/**
 * Check if session is expired (default: 30 days)
 */
export function isSessionExpired(maxAgeDays: number = 30): boolean {
  const createdAt = getSessionCreatedAt();
  if (!createdAt) return false;

  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  const age = Date.now() - createdAt.getTime();
  return age > maxAgeMs;
}

/**
 * Refresh session if expired
 */
export function refreshSessionIfExpired(maxAgeDays: number = 30): string {
  if (isSessionExpired(maxAgeDays)) {
    clearSession();
  }
  return getSessionId();
}

/**
 * Get session header for API calls
 */
export function getSessionHeader(): Record<string, string> {
  const sessionId = getSessionId();
  return { 'x-session-id': sessionId };
}

/**
 * Export session info for debugging
 */
export function getSessionInfo(): {
  id: string;
  createdAt: Date | null;
  ageMs: number | null;
  isExpired: boolean;
} {
  const id = getSessionId();
  const createdAt = getSessionCreatedAt();
  const ageMs = createdAt ? Date.now() - createdAt.getTime() : null;

  return {
    id,
    createdAt,
    ageMs,
    isExpired: isSessionExpired()
  };
}
