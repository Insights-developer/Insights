import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  // Check for bypass login cookie first
  const userEmail = request.cookies.get('user_email')?.value;
  if (userEmail) {
    console.log('Using bypass user dashboard for:', decodeURIComponent(userEmail));
    
    // Mock dashboard data
    const mockDashboardData = {
      user: {
        email: decodeURIComponent(userEmail),
        features: [
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
        ]
      },
      admin: {
        users: 15,
        groups: 5,
        features: 25
      },
      insights: {
        count: 12
      },
      stats: {
        draws: 245,
        results: 2340,
        games: 37
      },
      recentActivity: [
        { type: 'login', date: new Date().toISOString() },
        { type: 'result_view', date: new Date(Date.now() - 3600000).toISOString() },
        { type: 'insight_create', date: new Date(Date.now() - 86400000).toISOString() }
      ]
    };
    
    return Response.json(mockDashboardData);
  }
  
  // Normal authentication flow
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    
    // Get dashboard data based on user's features
    const features = api.getFeatures();
    const dashboardData: any = {
      user: {
        email: user.email,
        features: features
      }
    };

    // If user has admin access, get admin stats
    if (api.hasFeature('admin_dashboard')) {
      try {
        const [usersResult, groupsResult, featuresResult] = await Promise.all([
          supabase.from('users').select('id'),
          supabase.from('access_groups').select('id'),
          supabase.from('features').select('id').eq('active', true)
        ]);
        
        dashboardData.admin = {
          users: usersResult.data?.length || 0,
          groups: groupsResult.data?.length || 0,
          features: featuresResult.data?.length || 0
        };
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    }

    // If user has insights access, get insights stats
    if (api.hasFeature('insights_page')) {
      try {
        const { data: insightsData } = await supabase
          .from('draws')
          .select('id')
          .eq('user_id', user.id);
          
        dashboardData.insights = {
          count: insightsData?.length || 0
        };
      } catch (error) {
        console.error('Error fetching insights stats:', error);
      }
    }

    return api.success(dashboardData);
  });
}
