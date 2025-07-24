import { NextRequest } from 'next/server';
import { withApiHandler, ApiValidator } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('features')
        .select('*')
        .order('name');
    });

    if (error) return error;
    return api.success({ features: data || [] });
  }, 'admin_dashboard');
}

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const nameError = ApiValidator.required(body?.name, 'name');
    if (nameError) return api.error(nameError, 400);

    const keyError = ApiValidator.required(body?.key, 'key');
    if (keyError) return api.error(keyError, 400);

    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('features')
        .insert({
          name: body.name,
          key: body.key,
          description: body.description || null,
          active: body.active !== undefined ? body.active : true
        })
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Feature created successfully', 201);
  }, 'admin_dashboard');
}

export async function PATCH(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const idError = ApiValidator.required(body?.id, 'id');
    if (idError) return api.error(idError, 400);

    const supabase = createClient();
    
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.key !== undefined) updates.key = body.key;
    if (body.description !== undefined) updates.description = body.description;
    if (body.active !== undefined) updates.active = body.active;

    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('features')
        .update(updates)
        .eq('id', body.id)
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Feature updated successfully');
  }, 'admin_dashboard');
}

export async function DELETE(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const idError = ApiValidator.required(body?.id, 'id');
    if (idError) return api.error(idError, 400);

    const supabase = createClient();
    
    const { error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('features')
        .delete()
        .eq('id', body.id);
    });

    if (error) return error;
    return api.success({ deleted: true }, 'Feature deleted successfully');
  }, 'admin_dashboard');
}
