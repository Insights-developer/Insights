// Authentication API handler utilities
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from './auth';

type ApiHandler = (
  req: NextRequest,
  context: {
    userId: string;
    params: { [key: string]: string };
  }
) => Promise<NextResponse>;

/**
 * Higher-order function to wrap API handlers with authentication
 * @param handler The API handler function to wrap
 * @returns A handler that checks authentication before executing the original handler
 */
export function withAuth(handler: ApiHandler) {
  return async (
    req: NextRequest,
    { params }: { params: { [key: string]: string } }
  ) => {
    try {
      // Verify user is authenticated
      const userId = await getSessionUser(req);
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        );
      }
      
      // Call the original handler with the authenticated user ID
      return handler(req, { userId, params });
      
    } catch (error) {
      console.error('API auth wrapper error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Parse JSON from request with error handling
 * @param request Next.js request object
 * @returns Parsed JSON body or null if parsing failed
 */
export async function parseJsonBody(request: NextRequest): Promise<any | null> {
  try {
    return await request.json();
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return null;
  }
}

/**
 * Validate a request body against required fields
 * @param body Request body to validate
 * @param requiredFields Array of required field names
 * @returns Error response or null if validation passes
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[]
): NextResponse | null {
  if (!body) {
    return NextResponse.json(
      { error: 'Request body is required' },
      { status: 400 }
    );
  }
  
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(', ')}` },
      { status: 400 }
    );
  }
  
  return null;
}
