// AuthContext - Global authentication state management
// Provides Google OAuth and Magic Link authentication

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { linkSessionToUser } from '../lib/auth/linkSessionToUser';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: (User & { role?: string }) | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | 'super_admin' | null;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  linkUserToLeads: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'super_admin' | null>(null);

  // Refs to prevent duplicate calls and infinite loops
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetchingRole = useRef(false);
  const lastAuthEvent = useRef<string | null>(null);

  // Fetch user role from user_profiles table (with deduplication)
  const fetchUserRole = useCallback(async (userId: string): Promise<string> => {
    // Prevent duplicate fetches for same user
    if (lastFetchedUserId.current === userId || isFetchingRole.current) {
      return userRole || 'user';
    }

    isFetchingRole.current = true;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // Real error (not just "no rows")
        console.error('[Auth] Error fetching user role:', error.message);
        setUserRole('user');
        return 'user';
      }

      if (!data) {
        // Profile doesn't exist yet - user will be created by trigger
        console.debug('[Auth] User profile not found, will be created by trigger');
        setUserRole('user');
        lastFetchedUserId.current = userId;
        return 'user';
      }

      const role = data.role || 'user';
      setUserRole(role as 'user' | 'admin' | 'super_admin');
      lastFetchedUserId.current = userId;
      return role;
    } catch (err) {
      console.error('[Auth] Error fetching user role:', err);
      setUserRole('user');
      return 'user';
    } finally {
      isFetchingRole.current = false;
    }
  }, [userRole]);

  // Link user to existing leads by email
  const linkUserToLeads = useCallback(async () => {
    const currentUser = user;
    if (!currentUser?.id || !currentUser?.email) return;

    try {
      // Update leads that match user email and have no user_id
      const { error } = await supabase
        .from('leads')
        .update({ user_id: currentUser.id })
        .eq('user_email', currentUser.email)
        .is('user_id', null);

      if (error) {
        console.warn('[Auth] Failed to link user to leads:', error.message);
      } else {
        console.log('[Auth] User linked to existing leads');
      }
    } catch (err) {
      console.error('[Auth] Error linking user to leads:', err);
    }
  }, [user?.id, user?.email]);

  // Handle auth state changes (with deduplication to prevent loops)
  const handleAuthChange = useCallback(async (event: AuthChangeEvent, newSession: Session | null) => {
    // Skip duplicate events for same user
    const eventKey = `${event}-${newSession?.user?.id || 'none'}`;
    if (lastAuthEvent.current === eventKey && event !== 'SIGNED_OUT') {
      console.debug('[Auth] Skipping duplicate event:', event);
      return;
    }
    lastAuthEvent.current = eventKey;

    console.log('[Auth] Auth state changed:', event);

    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);

    // Fetch user role and link data on sign in (only once per user)
    if (event === 'SIGNED_IN' && newSession?.user) {
      // Fetch role first (has internal deduplication)
      const role = await fetchUserRole(newSession.user.id);

      // Then update user object with role
      setUser(prev => prev ? { ...prev, role } : null);

      // Link session to user (P3: anonymous blueprints → user account)
      try {
        const linkResult = await linkSessionToUser(newSession.user.id);
        if (linkResult.success && linkResult.blueprintsLinked > 0) {
          console.log('[Auth] Linked', linkResult.blueprintsLinked, 'blueprints from session');
        }
      } catch (e) {
        console.warn('[Auth] Session linking skipped:', e);
      }

      // Link leads to user (delay to avoid race conditions)
      setTimeout(() => {
        if (newSession?.user?.id && newSession?.user?.email) {
          supabase
            .from('leads')
            .update({ user_id: newSession.user.id })
            .eq('user_email', newSession.user.email)
            .is('user_id', null)
            .then(({ error }) => {
              if (!error) {
                console.log('[Auth] User linked to existing leads');
              }
            });
        }
      }, 100);
    }

    // Clear return URL and role on sign out
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('auth_return_to');
      setUserRole(null);
      lastFetchedUserId.current = null;
      lastAuthEvent.current = null;
    }
  }, [fetchUserRole]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for existing session
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Error getting session:', error);
        }

        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);

          // Fetch role for existing session
          const role = await fetchUserRole(existingSession.user.id);
          setUser(prev => prev ? { ...prev, role } : null);
        } else if (mounted) {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('[Auth] Error initializing auth:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle auth callback from URL hash (for OAuth and Magic Link)
  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have auth tokens in URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && refreshToken) {
        console.log('[Auth] Processing auth callback from URL hash');

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[Auth] Error setting session from hash:', error);
          } else {
            console.log('[Auth] Session set successfully from hash');

            // Clean up URL hash
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        } catch (err) {
          console.error('[Auth] Error processing auth callback:', err);
        }
      }

      // Also check for error in URL params (for OAuth errors)
      const urlParams = new URLSearchParams(window.location.search);
      const authError = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (authError) {
        console.error('[Auth] Auth error from URL:', authError, errorDescription);
        // Clean up URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleCallback();
  }, []);

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    // Save current location for return after auth
    localStorage.setItem('auth_return_to', window.location.pathname + window.location.search);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Auth] Google sign in error:', error);
      throw error;
    }
  };

  // Sign in with Magic Link
  const signInWithMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Email invalido' };
    }

    // Save current location for return after auth
    localStorage.setItem('auth_return_to', window.location.pathname + window.location.search);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('[Auth] Magic link error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] Sign out error:', error);
      throw error;
    }

    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    userRole,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    linkUserToLeads,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export types
export type { AuthContextType };
