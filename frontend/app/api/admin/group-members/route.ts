import { NextRequest } from 'next/server';
import { withApiHandler, ApiValidator } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId');
    
    if (groupId) {
      // Get members for specific group
      const { data, error } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('user_access_groups')
          .select(`
            user_id,
            users (id, email, username)
          `)
          .eq('access_group_id', groupId);
      });

      if (error) return error;
      
      const members = data?.map(item => item.users) || [];
      return api.success({ members });
    } else {
      // Get all group memberships
      const { data, error } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('user_access_groups')
          .select(`
            id,
            user_id,
            access_group_id,
            users (id, email, username),
            access_groups (id, name)
          `)
          .order('access_group_id');
      });

      if (error) return error;
      return api.success({ memberships: data || [] });
    }
  }, 'admin_dashboard');
}

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const userIdError = ApiValidator.required(body?.userId, 'userId');
    if (userIdError) return api.error(userIdError, 400);

    const groupIdError = ApiValidator.required(body?.groupId, 'groupId');
    if (groupIdError) return api.error(groupIdError, 400);

    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('user_access_groups')
        .insert({
          user_id: body.userId,
          access_group_id: body.groupId
        })
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'User added to group successfully', 201);
  }, 'admin_dashboard');
}

export async function DELETE(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const userIdError = ApiValidator.required(body?.userId, 'userId');
    if (userIdError) return api.error(userIdError, 400);

    const groupIdError = ApiValidator.required(body?.groupId, 'groupId');
    if (groupIdError) return api.error(groupIdError, 400);

    const supabase = createClient();
    
    const { error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('user_access_groups')
        .delete()
        .eq('user_id', body.userId)
        .eq('access_group_id', body.groupId);
    });

    if (error) return error;
    return api.success({ deleted: true }, 'User removed from group successfully');
  }, 'admin_dashboard');
}
