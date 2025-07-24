import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    const now = new Date().toISOString();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      // First get current login time to set as previous
      const { data: currentUser } = await supabase
        .from('users')
        .select('current_login_at, login_count')
        .eq('id', user.id)
        .single();

      // Update login timestamps and count
      return await supabase
        .from('users')
        .update({
          previous_login_at: currentUser?.current_login_at || now,
          current_login_at: now,
          login_count: (currentUser?.login_count || 0) + 1
        })
        .eq('id', user.id)
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Login timestamp updated');
  });
}
