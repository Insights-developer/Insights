// /frontend/utils/rbac.ts

import { createClient } from "@/utils/supabase/server";

// Get a user's role
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data?.role ?? null;
}

// Get a user's group names (via access_groups join)
export async function getUserGroups(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_access_groups')
    .select('access_groups(name)')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((row: any) => row.access_groups?.name).filter(Boolean);
}

// Check if user is in a given group (by name)
export async function userHasGroup(userId: string, groupName: string): Promise<boolean> {
  const groups = await getUserGroups(userId);
  return groups.includes(groupName);
}

// Check if user has a role or is in a group
export async function userHasAccess(
  userId: string,
  { role, group }: { role?: string; group?: string }
) {
  if (role) {
    const userRole = await getUserRole(userId);
    if (userRole === role) return true;
  }
  if (group) {
    return await userHasGroup(userId, group);
  }
  return false;
}
