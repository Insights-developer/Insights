import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('access_groups')
        .select('*')
        .order('name');
    });

    if (error) return error;
    return api.success({ groups: data || [] });
  }, 'admin_dashboard');
}
