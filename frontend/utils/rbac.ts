import { createClient } from '@/utils/supabase/server';

export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId as any) // <-- FIX: as any for UUID strictness
    .single();

  // Robust runtime type-check
  if (!data || typeof data !== 'object' || !('role' in data)) return null;
  return (data as { role: string | null }).role ?? null;
}

// Example for checking membership
export async function isUserInGroup(userId: string, groupId: number): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_access_groups')
    .select('user_id')
    .eq('user_id', userId as any)    // <-- FIX: as any
    .eq('group_id', groupId as any)
    .single();

  // If a row is found, the user is in the group
  return !!data;
}
