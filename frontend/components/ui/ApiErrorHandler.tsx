'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

// Error notification component
export function ApiErrorNotification({ 
  error, 
  onDismiss 
}: { 
  error: string; 
  onDismiss: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={onDismiss}
            className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for automatic API error handling
export function withApiErrorHandling<T extends object>(
  Component: React.ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    const auth = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    const handleApiError = React.useCallback((error: string, status: number) => {
      if (status === 401) {
        // Session expired
        auth.signOut();
      } else if (status === 403) {
        // Permission denied
        setError('You don\'t have permission to perform this action.');
      } else {
        setError(error);
      }
    }, [auth]);

    const clearError = React.useCallback(() => {
      setError(null);
    }, []);

    return (
      <>
        {error && <ApiErrorNotification error={error} onDismiss={clearError} />}
        <Component {...props} onApiError={handleApiError} />
      </>
    );
  };
}

// Hook for API error handling
export function useApiErrorHandler() {
  const auth = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleError = React.useCallback((error: string, status: number) => {
    if (status === 401) {
      auth.signOut();
    } else if (status === 403) {
      setError('You don\'t have permission to perform this action.');
    } else {
      setError(error);
    }
  }, [auth]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    ErrorComponent: error ? (
      <ApiErrorNotification error={error} onDismiss={clearError} />
    ) : null,
  };
}
