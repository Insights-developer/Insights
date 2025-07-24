import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
    });

    if (error) return error;
    return api.success({ notifications: data || [] });
  });
}

export async function PATCH(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const supabase = createClient();
    const user = api.getUser();
    
    // Mark notification as read
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', body.id)
        .eq('user_id', user.id)
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Notification marked as read');
  });
}
