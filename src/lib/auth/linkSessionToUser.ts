/**
 * Link Session to User
 * Story: SPRINT-2-P3 (Auth + Session)
 *
 * Links anonymous session data (blueprints) to authenticated user.
 * Called after successful authentication.
 */

import { supabase } from '../supabaseClient';
import { getSessionId, clearSession, hasSession } from './sessionManager';

interface LinkSessionResult {
  success: boolean;
  blueprintsLinked: number;
  error?: string;
}

/**
 * Link all blueprints from current session to the authenticated user
 *
 * This function:
 * 1. Gets the current session_id from localStorage
 * 2. Updates all blueprints with that session_id to include user_id
 * 3. Clears the session_id from localStorage (prevents reuse)
 * 4. Returns the number of blueprints linked
 *
 * @param userId - The authenticated user's ID
 * @returns LinkSessionResult with success status and count
 */
export async function linkSessionToUser(userId: string): Promise<LinkSessionResult> {
  try {
    // Check if we have a session to link
    if (!hasSession()) {
      console.log('[LinkSession] No session to link');
      return { success: true, blueprintsLinked: 0 };
    }

    const sessionId = getSessionId();
    console.log('[LinkSession] Linking session to user:', {
      sessionId: sessionId.substring(0, 8) + '...',
      userId: userId.substring(0, 8) + '...'
    });

    // Update blueprints with this session_id to include user_id
    const { data, error } = await supabase
      .from('blueprints')
      .update({
        user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .is('user_id', null) // Only update if not already linked
      .select('id');

    if (error) {
      console.error('[LinkSession] Error linking session:', error);
      return {
        success: false,
        blueprintsLinked: 0,
        error: error.message
      };
    }

    const linkedCount = data?.length || 0;
    console.log('[LinkSession] Successfully linked', linkedCount, 'blueprints');

    // Clear the session to prevent reuse
    clearSession();

    // Log the linking event for audit
    await logLinkingEvent(sessionId, userId, linkedCount);

    return {
      success: true,
      blueprintsLinked: linkedCount
    };
  } catch (error) {
    console.error('[LinkSession] Unexpected error:', error);
    return {
      success: false,
      blueprintsLinked: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Log session linking event for audit purposes
 */
async function logLinkingEvent(
  sessionId: string,
  userId: string,
  blueprintsLinked: number
): Promise<void> {
  try {
    // Log to blueprint_audit_logs if it exists
    await supabase
      .from('blueprint_audit_logs')
      .insert({
        action: 'session_linked',
        user_id: userId,
        metadata: {
          session_id: sessionId,
          blueprints_linked: blueprintsLinked,
          linked_at: new Date().toISOString()
        }
      });
  } catch (e) {
    // Audit logging is optional, don't fail the main operation
    console.debug('[LinkSession] Audit log skipped:', e);
  }
}

/**
 * Check if user has any blueprints (linked or from current session)
 */
export async function getUserBlueprintCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('blueprints')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('[LinkSession] Error getting blueprint count:', error);
      return 0;
    }

    return count || 0;
  } catch (e) {
    console.error('[LinkSession] Unexpected error getting count:', e);
    return 0;
  }
}

/**
 * Get user's latest blueprint
 */
export async function getLatestUserBlueprint(userId: string) {
  try {
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error('[LinkSession] Error getting latest blueprint:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('[LinkSession] Unexpected error:', e);
    return null;
  }
}
