import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    
    // First, ensure user exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingUser) {
      // Create user record if it doesn't exist
      const { error: createError } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
      });

      if (createError) {
        console.error('Failed to create user record:', createError);
        return createError;
      }
    }
    
    // Check if user is verified and not already in a group
    const { data: userGroups } = await supabase
      .from('user_access_groups')
      .select('group_id')
      .eq('user_id', user.id);

    // If user has no groups, add to default group
    if (!userGroups || userGroups.length === 0) {
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
              group_id: defaultGroup.id
            })
            .select()
            .single();
        });

        if (error) return error;
        return api.success(data, 'User created and promoted to verified group');
      } else {
        return api.error('Default verified group not found', 404);
      }
    }

    return api.success({ message: 'No promotion needed' });
  });
}
