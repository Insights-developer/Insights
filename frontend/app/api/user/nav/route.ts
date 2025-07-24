import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
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
