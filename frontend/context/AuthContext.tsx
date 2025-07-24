'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import type { User, Session } from '@supabase/supabase-js';

// Define comprehensive auth state
interface AuthState {
  user: User | null;
  session: Session | null;
  features: string[];
  loading: boolean;
  initialized: boolean;
}

// Define auth context interface
interface AuthContextType extends AuthState {
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  
  // Permission checks
  hasFeature: (featureKey: string) => boolean;
  hasAnyFeature: (featureKeys: string[]) => boolean;
  requireFeature: (featureKey: string) => { allowed: boolean; loading: boolean };
  
  // Session management
  refreshSession: () => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
  
  // User state
  updateUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Session refresh interval (15 minutes)
const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000;

// Feature cache duration (5 minutes)
const FEATURE_CACHE_DURATION = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // Core auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    features: [],
    loading: true,
    initialized: false,
  });
  
  // Feature cache state
  const [featureCache, setFeatureCache] = useState<{
    features: string[];
    timestamp: number;
  } | null>(null);
  
  // Session refresh timer
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setAuthState({
          user: null,
          session: null,
          features: [],
          loading: false,
          initialized: true,
        });
        return;
      }
      
      if (session?.user) {
        // Fetch user features
        const features = await fetchUserFeatures(session.user.id);
        
        // Update login timestamp
        try {
          await fetch('/api/user/update-login', { 
            method: 'POST',
            credentials: 'include'
          });
        } catch (loginError) {
          console.warn('Failed to update login timestamp:', loginError);
        }
        
        setAuthState({
          user: session.user,
          session,
          features,
          loading: false,
          initialized: true,
        });
        
        // Set up session refresh timer
        setupSessionRefresh();
      } else {
        setAuthState({
          user: null,
          session: null,
          features: [],
          loading: false,
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        session: null,
        features: [],
        loading: false,
        initialized: true,
      });
    }
  }, []);

  // Fetch user features with caching
  const fetchUserFeatures = useCallback(async (userId: string): Promise<string[]> => {
    // Check cache first
    if (featureCache && Date.now() - featureCache.timestamp < FEATURE_CACHE_DURATION) {
      return featureCache.features;
    }
    
    try {
      const response = await fetch('/api/user/features', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const features = data.features || [];
      
      // Update cache
      setFeatureCache({
        features,
        timestamp: Date.now(),
      });
      
      return features;
    } catch (error) {
      console.error('Failed to fetch user features:', error);
      return featureCache?.features || [];
    }
  }, [featureCache]);

  // Setup session refresh timer
  const setupSessionRefresh = useCallback(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    
    const timer = setInterval(async () => {
      await refreshSession();
    }, SESSION_REFRESH_INTERVAL);
    
    setRefreshTimer(timer);
  }, [refreshTimer]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        // If refresh fails, sign out user
        await signOut();
        return false;
      }
      
      if (data.session && data.session.user) {
        const session = data.session; // Store in variable to help TypeScript
        setAuthState(prev => ({
          ...prev,
          session: session,
          user: session.user,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh exception:', error);
      return false;
    }
  }, []);

  // Refresh permissions
  const refreshPermissions = useCallback(async () => {
    if (!authState.user) return;
    
    try {
      const features = await fetchUserFeatures(authState.user.id);
      setAuthState(prev => ({ ...prev, features }));
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  }, [authState.user, fetchUserFeatures]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { error: error.message };
      }
      
      if (data.session?.user) {
        const features = await fetchUserFeatures(data.session.user.id);
        
        // Update login timestamp
        try {
          await fetch('/api/user/update-login', { 
            method: 'POST',
            credentials: 'include'
          });
        } catch (loginError) {
          console.warn('Failed to update login timestamp:', loginError);
        }
        
        setAuthState({
          user: data.session.user,
          session: data.session,
          features,
          loading: false,
          initialized: true,
        });
        
        setupSessionRefresh();
        return {};
      }
      
      return { error: 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { error: 'An unexpected error occurred' };
    }
  }, [fetchUserFeatures, setupSessionRefresh]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Clear refresh timer
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
      
      // Clear cache
      setFeatureCache(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
      setAuthState({
        user: null,
        session: null,
        features: [],
        loading: false,
        initialized: true,
      });
      
      // Redirect to login
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [router, refreshTimer]);

  // Update user info
  const updateUserInfo = useCallback(async () => {
    if (!authState.user) return;
    
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
        }));
      }
    } catch (error) {
      console.error('Failed to update user info:', error);
    }
  }, [authState.user]);

  // Permission check helpers
  const hasFeature = useCallback((featureKey: string): boolean => {
    return authState.features.includes(featureKey);
  }, [authState.features]);

  const hasAnyFeature = useCallback((featureKeys: string[]): boolean => {
    return featureKeys.some(key => authState.features.includes(key));
  }, [authState.features]);

  const requireFeature = useCallback((featureKey: string) => {
    if (!authState.initialized) {
      return { allowed: false, loading: true };
    }
    
    if (!authState.user) {
      return { allowed: false, loading: false };
    }
    
    return {
      allowed: authState.features.includes(featureKey),
      loading: false,
    };
  }, [authState]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setAuthState({
            user: null,
            session: null,
            features: [],
            loading: false,
            initialized: true,
          });
          
          // Clear refresh timer
          if (refreshTimer) {
            clearInterval(refreshTimer);
            setRefreshTimer(null);
          }
          
          // Clear cache
          setFeatureCache(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session.user) {
            const features = await fetchUserFeatures(session.user.id);
            
            setAuthState({
              user: session.user,
              session,
              features,
              loading: false,
              initialized: true,
            });
            
            if (event === 'SIGNED_IN') {
              setupSessionRefresh();
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserFeatures, setupSessionRefresh, refreshTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [refreshTimer]);

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    hasFeature,
    hasAnyFeature,
    requireFeature,
    refreshSession,
    refreshPermissions,
    updateUserInfo,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected component wrapper
export function ProtectedRoute({ 
  children, 
  requiredFeature, 
  fallback 
}: { 
  children: React.ReactNode;
  requiredFeature: string;
  fallback?: React.ReactNode;
}) {
  const { requireFeature } = useAuth();
  const { allowed, loading } = requireFeature(requiredFeature);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!allowed) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
