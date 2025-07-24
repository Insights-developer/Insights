import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

// Standardized API response types
export interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
  status: 'success';
}

export interface ApiErrorResponse {
  error: string;
  status: 'error';
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Standardized API handler wrapper
export class ApiHandler {
  private request: NextRequest;
  private user: any = null;
  private features: string[] = [];

  constructor(request: NextRequest) {
    this.request = request;
  }

  // Initialize authentication and permissions
  async initialize(requiredFeature?: string): Promise<NextResponse | null> {
    const supabase = createClient();
    
    try {
      // Get user session
      const { data: auth, error: authError } = await supabase.auth.getUser();
      
      if (authError || !auth?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in again', status: 'error' },
          { status: 401 }
        );
      }

      this.user = auth.user;

      // Get user features
      this.features = await getUserFeatures(this.user.id);

      // Check required feature if specified
      if (requiredFeature && !this.features.includes(requiredFeature)) {
        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions', status: 'error' },
          { status: 403 }
        );
      }

      return null; // Success - no error response
    } catch (error) {
      console.error('API initialization error:', error);
      return NextResponse.json(
        { error: 'Internal server error', status: 'error' },
        { status: 500 }
      );
    }
  }

  // Get authenticated user
  getUser() {
    return this.user;
  }

  // Get user features
  getFeatures() {
    return this.features;
  }

  // Check if user has feature
  hasFeature(featureKey: string): boolean {
    return this.features.includes(featureKey);
  }

  // Parse JSON body with error handling
  async parseBody<T = any>(): Promise<{ data: T | null; error: NextResponse | null }> {
    try {
      const body = await this.request.json();
      return { data: body, error: null };
    } catch (error) {
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Invalid JSON body', status: 'error' },
          { status: 400 }
        ),
      };
    }
  }

  // Create success response
  success<T>(data: T, message?: string, status: number = 200): NextResponse {
    return NextResponse.json(
      { data, message, status: 'success' } as ApiSuccessResponse<T>,
      { status }
    );
  }

  // Create error response
  error(message: string, status: number = 400, code?: string): NextResponse {
    return NextResponse.json(
      { error: message, status: 'error', code } as ApiErrorResponse,
      { status }
    );
  }

  // Handle database operation with standard error handling
  async handleDatabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: NextResponse | null }> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        console.error('Database operation error:', error);
        return {
          data: null,
          error: NextResponse.json(
            { error: error.message || 'Database operation failed', status: 'error' },
            { status: 400 }
          ),
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Database operation exception:', error);
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Database operation failed', status: 'error' },
          { status: 500 }
        ),
      };
    }
  }
}

// Wrapper function for consistent API handling
export async function withApiHandler(
  request: NextRequest,
  handler: (api: ApiHandler) => Promise<NextResponse>,
  requiredFeature?: string
): Promise<NextResponse> {
  const api = new ApiHandler(request);
  
  // Initialize authentication and permissions
  const authError = await api.initialize(requiredFeature);
  if (authError) {
    return authError;
  }

  try {
    return await handler(api);
  } catch (error) {
    console.error('API handler error:', error);
    return api.error('Internal server error', 500);
  }
}

// Validation helpers
export class ApiValidator {
  static required(value: any, fieldName: string): string | null {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email format';
    }
    return null;
  }

  static minLength(value: string, min: number, fieldName: string): string | null {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  }

  static validate(validations: Array<() => string | null>): string | null {
    for (const validation of validations) {
      const error = validation();
      if (error) return error;
    }
    return null;
  }
}
