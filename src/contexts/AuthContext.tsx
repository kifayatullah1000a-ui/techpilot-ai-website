import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  signInWithEmailPassword, 
  signOutSession, 
  getSupabaseSession, 
  onSupabaseAuthStateChange,
  isSupabaseConfigured
} from '../lib/supabase';
import { AdminUser } from '../types';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  openLoginModal: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Helper to determine if user has administrator authorization
  const evaluateAdminStatus = (currentUser: User | null): boolean => {
    if (!currentUser) return false;
    // Exclusively verify against the administrator UUID
    return currentUser.id === '6212d070-05b0-46d1-a98a-3c77087626d3';
  };

  const isAdmin = evaluateAdminStatus(user);

  const adminUser: AdminUser | null = user
    ? {
        id: user.id,
        email: user.email || 'administrator@techpilot.internal',
        role: (user.app_metadata?.role || (user.id === '6212d070-05b0-46d1-a98a-3c77087626d3' ? 'System Administrator' : 'Administrator')) as string,
        lastSignIn: user.last_sign_in_at || new Date().toISOString(),
      }
    : null;

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data, error } = await getSupabaseSession();
        if (mounted) {
          if (!error && data?.session) {
            setSession(data.session);
            setUser(data.session.user);
          } else {
            setSession(null);
            setUser(null);
          }
        }
      } catch (err: any) {
        console.warn('Supabase auth session initialization note:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to auth state changes (e.g. login, logout, token refresh)
    const { data: authListener } = onSupabaseAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setLoading(true);

    if (!email || !email.includes('@')) {
      const err = 'Please enter a valid administrator email address.';
      setAuthError(err);
      setLoading(false);
      return { success: false, error: err };
    }

    if (!password || password.length < 6) {
      const err = 'Password must be at least 6 characters.';
      setAuthError(err);
      setLoading(false);
      return { success: false, error: err };
    }

    try {
      const result = await signInWithEmailPassword(email, password);
      if (result.error) {
        let cleanMsg = result.error.message || 'Authentication failed.';
        if (cleanMsg.includes('Invalid login credentials')) {
          cleanMsg = 'Invalid email or password. Verify the administrator credentials configured in your Supabase Dashboard.';
        } else if (cleanMsg.includes('Email not confirmed')) {
          cleanMsg = 'This email has not been confirmed in Supabase yet. Please toggle "Auto-Confirm User" or verify email in Supabase Authentication.';
        }
        setAuthError(cleanMsg);
        setLoading(false);
        return { success: false, error: cleanMsg };
      }

      if (result.data?.session && result.data?.user) {
        setSession(result.data.session);
        setUser(result.data.user);
        setShowLoginModal(false);
        setLoading(false);
        return { success: true };
      }

      const unknownErr = 'Session could not be established. Please retry.';
      setAuthError(unknownErr);
      setLoading(false);
      return { success: false, error: unknownErr };
    } catch (err: any) {
      const errText = err?.message || 'Network error attempting administrator sign in.';
      setAuthError(errText);
      setLoading(false);
      return { success: false, error: errText };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutSession();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setSession(null);
      setAuthError(null);
      setLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);
  const openLoginModal = () => {
    setAuthError(null);
    setShowLoginModal(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        session,
        isAdmin,
        loading,
        authError,
        login,
        logout,
        clearAuthError,
        showLoginModal,
        setShowLoginModal,
        openLoginModal,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
