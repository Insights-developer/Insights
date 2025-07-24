import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('users')
        .select(`
          id, email, username, phone, created_at,
          current_login_at, previous_login_at, login_count,
          user_access_groups (
            access_groups (id, name, description)
          )
        `)
        .eq('id', user.id)
        .single();
    });

    if (error) return error;

    if (!data) {
      return api.error('Profile not found', 404);
    }

    // Transform data
    const profile = {
      ...(data as any),
      groups: (data as any).user_access_groups?.map((ug: any) => ug.access_groups) || []
    };

    return api.success({ profile });
  });
}

export async function PATCH(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const supabase = createClient();
    const user = api.getUser();
    
    const updates: any = {};
    if (body.username !== undefined) updates.username = body.username;
    if (body.phone !== undefined) updates.phone = body.phone;

    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Profile updated successfully');
  });
}
