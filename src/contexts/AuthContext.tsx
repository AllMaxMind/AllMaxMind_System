// AuthContext - Global authentication state management
// Provides Google OAuth and Magic Link authentication

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  linkUserToLeads: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Link user to existing leads by email
  const linkUserToLeads = useCallback(async () => {
    if (!user?.id || !user?.email) return;

    try {
      // Update leads that match user email and have no user_id
      const { error } = await supabase
        .from('leads')
        .update({ user_id: user.id })
        .eq('user_email', user.email)
        .is('user_id', null);

      if (error) {
        console.warn('[Auth] Failed to link user to leads:', error.message);
      } else {
        console.log('[Auth] User linked to existing leads');
      }
    } catch (err) {
      console.error('[Auth] Error linking user to leads:', err);
    }
  }, [user]);

  // Handle auth state changes
  const handleAuthChange = useCallback(async (event: AuthChangeEvent, newSession: Session | null) => {
    console.log('[Auth] Auth state changed:', event);

    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);

    // Link user to leads on sign in
    if (event === 'SIGNED_IN' && newSession?.user) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        linkUserToLeads();
      }, 100);
    }

    // Clear return URL on sign out
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('auth_return_to');
    }
  }, [linkUserToLeads]);

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

        if (mounted) {
          setSession(existingSession);
          setUser(existingSession?.user ?? null);
          setLoading(false);
        }
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
  }, [handleAuthChange]);

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
