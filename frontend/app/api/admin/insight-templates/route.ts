import { NextRequest } from 'next/server';
import { withApiHandler, ApiValidator } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('insight_templates')
        .select('*')
        .eq('active', true)
        .order('name');
    });

    if (error) return error;
    return api.success({ templates: data || [] });
  }, 'admin_dashboard');
}

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const nameError = ApiValidator.required(body?.name, 'name');
    if (nameError) return api.error(nameError, 400);

    const supabase = createClient();
    const user = api.getUser();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('insight_templates')
        .insert({
          name: body.name,
          description: body.description || null,
          template_data: body.template_data || {},
          created_by: user.id,
          active: body.active !== undefined ? body.active : true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Template created successfully', 201);
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
    if (body.description !== undefined) updates.description = body.description;
    if (body.template_data !== undefined) updates.template_data = body.template_data;
    if (body.active !== undefined) updates.active = body.active;

    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('insight_templates')
        .update(updates)
        .eq('id', body.id)
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Template updated successfully');
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
        .from('insight_templates')
        .delete()
        .eq('id', body.id);
    });

    if (error) return error;
    return api.success({ deleted: true }, 'Template deleted successfully');
  }, 'admin_dashboard');
}
