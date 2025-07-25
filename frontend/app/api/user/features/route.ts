import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { getUserFeatures } from '@/utils/rbac';

export async function GET(request: NextRequest) {
  // Check for bypass login cookie first
  const userEmail = request.cookies.get('user_email')?.value;
  if (userEmail) {
    console.log('Using bypass user features for:', decodeURIComponent(userEmail));
    
    // Mock features for development user
    const mockFeatures = [
      'dashboard_access',
      'admin_access',
      'users_manage',
      'groups_manage',
      'reports_access',
      'insights_access',
      'results_access',
      'draws_access',
      'games_access',
      'admin_dashboard',
      'insights_page'
    ];
    
    return Response.json({ features: mockFeatures });
  }
  
  // Normal authentication flow
  return withApiHandler(request, async (api) => {
    const features = await getUserFeatures(api.getUser().id);
    return api.success({ features });
  });
}
