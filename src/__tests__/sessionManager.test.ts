/**
 * Session Manager Tests
 * Story: SPRINT-2-P3 (Auth + Session)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Import after mocking
import {
  getSessionId,
  hasSession,
  clearSession,
  isSessionExpired,
  getSessionInfo
} from '../lib/auth/sessionManager';

describe('Session Manager', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getSessionId', () => {
    it('should generate new session ID when none exists', () => {
      const sessionId = getSessionId();
      expect(sessionId).toBeDefined();
      expect(sessionId.length).toBe(36); // UUID format
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should return same session ID on subsequent calls', () => {
      const first = getSessionId();
      const second = getSessionId();
      expect(first).toBe(second);
    });

    it('should persist session ID in localStorage', () => {
      const sessionId = getSessionId();
      const stored = localStorageMock.getItem('session_id');
      expect(stored).toBe(sessionId);
    });
  });

  describe('hasSession', () => {
    it('should return false when no session exists', () => {
      expect(hasSession()).toBe(false);
    });

    it('should return true after session is created', () => {
      getSessionId();
      expect(hasSession()).toBe(true);
    });
  });

  describe('clearSession', () => {
    it('should remove session from localStorage', () => {
      getSessionId();
      expect(hasSession()).toBe(true);

      clearSession();
      expect(hasSession()).toBe(false);
      expect(localStorageMock.getItem('session_id')).toBeNull();
    });

    it('should handle clearing non-existent session', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });

  describe('isSessionExpired', () => {
    it('should return false for new session', () => {
      getSessionId();
      expect(isSessionExpired()).toBe(false);
    });

    it('should return false when no session exists', () => {
      expect(isSessionExpired()).toBe(false);
    });
  });

  describe('getSessionInfo', () => {
    it('should return complete session info', () => {
      const info = getSessionInfo();

      expect(info.id).toBeDefined();
      expect(info.createdAt).toBeInstanceOf(Date);
      expect(info.ageMs).toBeGreaterThanOrEqual(0);
      expect(info.isExpired).toBe(false);
    });
  });

  describe('UUID format validation', () => {
    it('should generate valid UUID v4', () => {
      const sessionId = getSessionId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where y is 8, 9, a, or b
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(sessionId).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        localStorageMock.clear();
        ids.add(getSessionId());
      }
      expect(ids.size).toBe(100);
    });
  });
});

describe('Session Persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should persist across simulated page reloads', () => {
    // First "page load"
    const originalId = getSessionId();

    // Simulate page reload by re-importing (mock)
    // In real scenario, this would be a new module instance
    const reloadedId = getSessionId();

    expect(reloadedId).toBe(originalId);
  });
});
