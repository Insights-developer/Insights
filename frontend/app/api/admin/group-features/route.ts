import { NextRequest } from 'next/server';
import { withApiHandler, ApiValidator } from '@/utils/api-handler';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const supabase = createClient();
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId');
    
    if (groupId) {
      // Get features for specific group
      const { data, error } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('access_group_features')
          .select(`
            feature_id,
            features (id, name, key, description)
          `)
          .eq('access_group_id', groupId);
      });

      if (error) return error;
      
      const features = data?.map(item => item.features) || [];
      return api.success({ features });
    } else {
      // Get all group-feature relationships
      const { data, error } = await api.handleDatabaseOperation(async () => {
        return await supabase
          .from('access_group_features')
          .select(`
            id,
            access_group_id,
            feature_id,
            access_groups (id, name),
            features (id, name, key)
          `)
          .order('access_group_id');
      });

      if (error) return error;
      return api.success({ groupFeatures: data || [] });
    }
  }, 'admin_dashboard');
}

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const groupIdError = ApiValidator.required(body?.groupId, 'groupId');
    if (groupIdError) return api.error(groupIdError, 400);

    const featureIdError = ApiValidator.required(body?.featureId, 'featureId');
    if (featureIdError) return api.error(featureIdError, 400);

    const supabase = createClient();
    
    const { data, error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('access_group_features')
        .insert({
          access_group_id: body.groupId,
          feature_id: body.featureId
        })
        .select()
        .single();
    });

    if (error) return error;
    return api.success(data, 'Feature assigned to group successfully', 201);
  }, 'admin_dashboard');
}

export async function DELETE(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const { data: body, error: parseError } = await api.parseBody();
    if (parseError) return parseError;

    const groupIdError = ApiValidator.required(body?.groupId, 'groupId');
    if (groupIdError) return api.error(groupIdError, 400);

    const featureIdError = ApiValidator.required(body?.featureId, 'featureId');
    if (featureIdError) return api.error(featureIdError, 400);

    const supabase = createClient();
    
    const { error } = await api.handleDatabaseOperation(async () => {
      return await supabase
        .from('access_group_features')
        .delete()
        .eq('access_group_id', body.groupId)
        .eq('feature_id', body.featureId);
    });

    if (error) return error;
    return api.success({ deleted: true }, 'Feature removed from group successfully');
  }, 'admin_dashboard');
}
