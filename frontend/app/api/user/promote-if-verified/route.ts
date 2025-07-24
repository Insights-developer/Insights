import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    
    // Check if user is verified and not already in a group
    const { data: userData, error: userError } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('users')
        .select(`
          id, email_confirmed_at,
          user_access_groups (access_group_id)
        `)
        .eq('id', user.id)
        .single();
    });

    if (userError) return userError;

    const userInfo = userData as any;
    
    // If user is verified and has no groups, add to default group
    if (userInfo?.email_confirmed_at && (!userInfo.user_access_groups || userInfo.user_access_groups.length === 0)) {
      // Find default group (could be "Verified Users" or similar)
      const { data: defaultGroup } = await supabase
        .from('access_groups')
        .select('id')
        .eq('name', 'Verified Users')
        .single();

      if (defaultGroup) {
        const { data, error } = await api.handleDatabaseOperation(async () => {
          return await supabase
            .from('user_access_groups')
            .insert({
              user_id: user.id,
              access_group_id: defaultGroup.id
            })
            .select()
            .single();
        });

        if (error) return error;
        return api.success(data, 'User promoted to verified group');
      }
    }

    return api.success({ message: 'No promotion needed' });
  });
}
