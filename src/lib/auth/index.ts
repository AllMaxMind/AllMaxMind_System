/**
 * Auth Module Exports
 * Story: SPRINT-2-P3 (Auth + Session)
 */

// Session management
export {
  getSessionId,
  hasSession,
  getSessionCreatedAt,
  clearSession,
  isSessionExpired,
  refreshSessionIfExpired,
  getSessionHeader,
  getSessionInfo
} from './sessionManager';

// Session-to-user linking
export {
  linkSessionToUser,
  getUserBlueprintCount,
  getLatestUserBlueprint
} from './linkSessionToUser';
