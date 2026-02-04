/**
 * useSession Hook
 * Story: SPRINT-2-P3 (Auth + Session)
 *
 * React hook for accessing session management functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSessionId,
  hasSession,
  getSessionCreatedAt,
  clearSession,
  isSessionExpired,
  refreshSessionIfExpired,
  getSessionInfo
} from '../lib/auth/sessionManager';

interface UseSessionReturn {
  sessionId: string;
  hasSession: boolean;
  createdAt: Date | null;
  isExpired: boolean;
  clear: () => void;
  refresh: () => string;
  info: () => {
    id: string;
    createdAt: Date | null;
    ageMs: number | null;
    isExpired: boolean;
  };
}

/**
 * Hook to manage anonymous session state
 *
 * @example
 * ```tsx
 * const { sessionId, clear, isExpired } = useSession();
 *
 * // Use sessionId in API calls
 * await saveBlueprintWithSession(blueprintData, sessionId);
 *
 * // Clear after successful auth linking
 * const handleAuthSuccess = () => {
 *   clear();
 * };
 * ```
 */
export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>('');
  const [sessionExists, setSessionExists] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [expired, setExpired] = useState<boolean>(false);

  // Initialize session on mount
  useEffect(() => {
    const id = refreshSessionIfExpired();
    setSessionId(id);
    setSessionExists(hasSession());
    setCreatedAt(getSessionCreatedAt());
    setExpired(isSessionExpired());
  }, []);

  // Clear session handler
  const clear = useCallback(() => {
    clearSession();
    setSessionId('');
    setSessionExists(false);
    setCreatedAt(null);
    setExpired(false);
  }, []);

  // Refresh session handler
  const refresh = useCallback(() => {
    const id = refreshSessionIfExpired();
    setSessionId(id);
    setSessionExists(hasSession());
    setCreatedAt(getSessionCreatedAt());
    setExpired(isSessionExpired());
    return id;
  }, []);

  // Get full session info
  const info = useCallback(() => {
    return getSessionInfo();
  }, []);

  return {
    sessionId,
    hasSession: sessionExists,
    createdAt,
    isExpired: expired,
    clear,
    refresh,
    info
  };
}

export default useSession;
