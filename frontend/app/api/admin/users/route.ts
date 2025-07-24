import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    
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
        .order('username');
    });

    if (error) return error;

    // Transform data
    const users = data?.map(user => ({
      ...user,
      groups: user.user_access_groups?.map(ug => ug.access_groups) || []
    })) || [];

    return api.success({ users });
  }, 'admin_dashboard');
}

export async function PATCH(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;
    if (!body) return api.error('Request body required', 400);

    const supabase = createClient();
    
    // Update user details
    if (body.email || body.username !== undefined || body.phone !== undefined) {
      const updates: any = {};
      if (body.email) updates.email = body.email;
      if (body.username !== undefined) updates.username = body.username;
      if (body.phone !== undefined) updates.phone = body.phone;

      const { error } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('users')
          .update(updates)
          .eq('id', body.userId);
      });

      if (error) return error;
    }

    // Update group memberships if provided
    if (body.groupIds && Array.isArray(body.groupIds)) {
      // Remove existing memberships
      const { error: deleteError } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('user_access_groups')
          .delete()
          .eq('user_id', body.userId);
      });

      if (deleteError) return deleteError;

      // Add new memberships
      if (body.groupIds.length > 0) {
        const memberships = body.groupIds.map((groupId: number) => ({
          user_id: body.userId,
          access_group_id: groupId
        }));

        const { error: insertError } = await api.handleDatabaseOperation(async () => {
          return await supabase
            .from('user_access_groups')
            .insert(memberships);
        });

        if (insertError) return insertError;
      }
    }

    return api.success({ userId: body.userId });
  }, 'admin_dashboard');
}

export async function DELETE(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;
    if (!body?.userId) return api.error('Missing userId', 400);

    const supabase = createClient();
    
    // Delete user (cascade will handle related records)
    const { error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('users')
        .delete()
        .eq('id', body.userId);
    });

    if (error) return error;
    return api.success({ deleted: true });
  }, 'admin_dashboard');
}
