import { useAuth } from '@/context/AuthContext';

// Enhanced API client with automatic session management
export class AuthenticatedApiClient {
  private baseUrl: string;
  private auth: ReturnType<typeof useAuth> | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Set auth context (called from components)
  setAuth(auth: ReturnType<typeof useAuth>) {
    this.auth = auth;
  }

  // Make authenticated API request with automatic retry
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string; status: number }> {
    if (!this.auth) {
      throw new Error('Auth context not set. Call setAuth() first.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: defaultHeaders,
      credentials: 'include',
    };

    try {
      // First attempt
      let response = await fetch(url, requestOptions);

      // If we get 401, try to refresh session once
      if (response.status === 401 && this.auth.session) {
        console.log('Got 401, attempting session refresh...');
        
        const refreshed = await this.auth.refreshSession();
        if (refreshed) {
          // Retry the request
          response = await fetch(url, requestOptions);
        } else {
          // Refresh failed, redirect to login
          await this.auth.signOut();
          return { error: 'Session expired. Please log in again.', status: 401 };
        }
      }

      // Parse response
      let data: any = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          error: data?.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create a singleton instance
const apiClient = new AuthenticatedApiClient('/api');

// Hook for using the API client in components
export function useApiClient() {
  const auth = useAuth();
  
  // We can't use React hooks in .ts files, so we'll return a configured client
  const configuredClient = new AuthenticatedApiClient('/api');
  configuredClient.setAuth(auth);
  
  return configuredClient;
}

// Types for API responses
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiErrorHandler {
  onApiError?: (error: string, status: number) => void;
}

// Utility for standardized error handling
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string, status: number) => void
) {
  if (response.error) {
    onError?.(response.error, response.status);
    return false;
  }
  
  if (response.data !== undefined) {
    onSuccess?.(response.data);
    return true;
  }
  
  return false;
}
