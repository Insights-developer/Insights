import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
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
