import { NextRequest } from 'next/server';
import { withApiHandler, ApiValidator } from '@/utils/api-handler';
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

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const validationError = ApiValidator.required(body?.name, 'name');
    if (validationError) return api.error(validationError, 400);

    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('access_groups')
        .insert({
          name: body.name,
          description: body.description || null
        })
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Access group created successfully', 201);
  }, 'admin_dashboard');
}

export async function PATCH(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const validationError = ApiValidator.required(body?.id, 'id');
    if (validationError) return api.error(validationError, 400);

    const supabase = createClient();
    
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;

    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('access_groups')
        .update(updates)
        .eq('id', body.id)
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Access group updated successfully');
  }, 'admin_dashboard');
}

export async function DELETE(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const validationError = ApiValidator.required(body?.id, 'id');
    if (validationError) return api.error(validationError, 400);

    const supabase = createClient();
    
    const { error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('access_groups')
        .delete()
        .eq('id', body.id);
    });

    if (error) return error;
    return api.success({ deleted: true }, 'Access group deleted successfully');
  }, 'admin_dashboard');
}
