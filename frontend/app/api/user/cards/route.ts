import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const user = api.getUser();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    });

    if (error) return error;
    return api.success({ cards: data || [] });
  });
}

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const supabase = createClient();
    const user = api.getUser();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('user_cards')
        .insert({
          ...body,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Card created successfully', 201);
  });
}
