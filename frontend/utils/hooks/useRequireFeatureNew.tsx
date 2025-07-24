'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Enhanced hook for checking feature permissions using centralized auth
 * @param featureKey - The feature key to check
 * @param redirectOnFail - Whether to redirect to login if unauthorized (default: true)
 */
export function useRequireFeature(featureKey: string, redirectOnFail: boolean = true) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to login
    if (!auth.loading && !auth.user && redirectOnFail) {
      router.replace('/');
    }
  }, [auth.loading, auth.user, redirectOnFail, router]);

  // Return loading state during initialization
  if (!auth.initialized || auth.loading) {
    return {
      allowed: false,
      loading: true,
      forbidden: false,
    };
  }

  // User not authenticated
  if (!auth.user) {
    return {
      allowed: false,
      loading: false,
      forbidden: true,
    };
  }

  // Check feature permission
  const hasFeature = auth.hasFeature(featureKey);

  return {
    allowed: hasFeature,
    loading: false,
    forbidden: !hasFeature,
  };
}

/**
 * Hook for checking multiple features (user must have at least one)
 */
export function useRequireAnyFeature(featureKeys: string[], redirectOnFail: boolean = true) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user && redirectOnFail) {
      router.replace('/');
    }
  }, [auth.loading, auth.user, redirectOnFail, router]);

  if (!auth.initialized || auth.loading) {
    return {
      allowed: false,
      loading: true,
      forbidden: false,
    };
  }

  if (!auth.user) {
    return {
      allowed: false,
      loading: false,
      forbidden: true,
    };
  }

  const hasAnyFeature = auth.hasAnyFeature(featureKeys);

  return {
    allowed: hasAnyFeature,
    loading: false,
    forbidden: !hasAnyFeature,
  };
}

/**
 * Hook for checking if user is admin (has admin_dashboard feature)
 */
export function useRequireAdmin(redirectOnFail: boolean = true) {
  return useRequireFeature('admin_dashboard', redirectOnFail);
}

/**
 * Component wrapper for feature-based access control
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  loading: customLoading 
}: {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}) {
  const { allowed, loading, forbidden } = useRequireFeature(feature, false);

  if (loading) {
    return customLoading || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (forbidden || !allowed) {
    return fallback || (
      <div className="text-center p-8">
        <p className="text-gray-500">You don't have permission to access this feature.</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Component wrapper for admin-only content
 */
export function AdminGate({ 
  children, 
  fallback,
  loading: customLoading 
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}) {
  return (
    <FeatureGate 
      feature="admin_dashboard" 
      fallback={fallback}
      loading={customLoading}
    >
      {children}
    </FeatureGate>
  );
}
