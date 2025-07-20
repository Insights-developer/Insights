import { createClient } from '@/utils/supabase/server';

// Legacy: get the user's standalone "role" (will be deprecated in favor of group-based RBAC)
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId as any)
    .single();

  if (!data || typeof data !== 'object' || !('role' in data)) return null;
  return (data as { role: string | null }).role ?? null;
}

// Group membership checker
export async function isUserInGroup(userId: string, groupId: number): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_access_groups')
    .select('user_id')
    .eq('user_id', userId as any)
    .eq('group_id', groupId as any)
    .single();

  return !!data;
}

// NEW: Fetch all feature keys assigned to the user's groups for group/feature RBAC
export async function getUserFeatures(userId: string): Promise<string[]> {
  const supabase = createClient();

  // 1. Get all groups for the user
  const { data: userGroups, error: groupErr } = await supabase
    .from('user_access_groups')
    .select('group_id')
    .eq('user_id', userId);

  if (groupErr || !userGroups || userGroups.length === 0) return [];

  const groupIds = userGroups.map((g: { group_id: number }) => g.group_id);

  // 2. Get features assigned to these groups
  const { data: featuresData, error: featErr } = await supabase
    .from('access_group_features')
    .select('feature')
    .in('group_id', groupIds);

  if (featErr || !featuresData) return [];

  // 3. Deduplicate feature keys
  return [...new Set(featuresData.map((f: { feature: string }) => f.feature))];
}
