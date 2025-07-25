import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  // Check for bypass login cookie first
  const userEmail = request.cookies.get('user_email')?.value;
  if (userEmail) {
    console.log('Using bypass user navigation for:', decodeURIComponent(userEmail));
    
    // Mock navigation items for development
    const mockNavItems = [
      {
        id: 1,
        name: 'Dashboard',
        icon: 'dashboard',
        path: '/dashboard',
        sort_order: 10,
        required_feature: 'dashboard_access',
        active: true,
        parent_id: null
      },
      {
        id: 2,
        name: 'Insights',
        icon: 'insights',
        path: '/insights',
        sort_order: 20,
        required_feature: 'insights_access',
        active: true,
        parent_id: null
      },
      {
        id: 3,
        name: 'Results',
        icon: 'assessment',
        path: '/results',
        sort_order: 30,
        required_feature: 'results_access',
        active: true,
        parent_id: null
      },
      {
        id: 4,
        name: 'Draws',
        icon: 'event',
        path: '/draws',
        sort_order: 40,
        required_feature: 'draws_access',
        active: true,
        parent_id: null
      },
      {
        id: 5,
        name: 'Games',
        icon: 'casino',
        path: '/games',
        sort_order: 50,
        required_feature: 'games_access',
        active: true,
        parent_id: null
      },
      {
        id: 6,
        name: 'Admin',
        icon: 'admin_panel_settings',
        path: '/admin',
        sort_order: 100,
        required_feature: 'admin_access',
        active: true,
        parent_id: null
      },
      {
        id: 7,
        name: 'Users',
        icon: 'people',
        path: '/admin/users',
        sort_order: 110,
        required_feature: 'users_manage',
        active: true,
        parent_id: 6
      },
      {
        id: 8,
        name: 'Groups',
        icon: 'group_work',
        path: '/admin/groups',
        sort_order: 120,
        required_feature: 'groups_manage',
        active: true,
        parent_id: 6
      }
    ];
    
    return Response.json({ nav: mockNavItems });
  }
  
  // Normal authentication flow
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const features = api.getFeatures();
    
    if (!features || features.length === 0) {
      return api.success({ nav: [] });
    }

    // Get nav items that match user's features
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('nav_items')
        .select('*')
        .in('required_feature', features)
        .eq('active', true)
        .order('sort_order');
    });

    if (error) return error;
    return api.success({ nav: data || [] });
  });
}
