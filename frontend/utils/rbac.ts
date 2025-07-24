import { createClient } from '@/utils/supabase/server';
import { Session } from '@supabase/supabase-js';

// Deprecated: Do not use this for access; use getUserFeatures instead.
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role ?? null;
}

// Check if user is a member of a given group (for admin group UI, not feature gating)
export async function isUserInGroup(userId: string, groupId: number): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_access_groups')
    .select('user_id')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .single();
  return !!data;
}

// Canonical: Fetch all feature keys assigned to user via group membership
export async function getUserFeatures(userId: string): Promise<string[]> {
  const supabase = createClient();

  // Get all group ids for user
  const { data: userGroups } = await supabase
    .from('user_access_groups')
    .select('group_id')
    .eq('user_id', userId);

  if (!userGroups || userGroups.length === 0) return [];

  const groupIds = userGroups.map((g: { group_id: number }) => g.group_id);

  // Get all features attached to these groups
  const { data: featuresData } = await supabase
    .from('access_group_features')
    .select('feature')
    .in('group_id', groupIds);

  if (!featuresData) return [];

  // Deduplicate
  return [...new Set(featuresData.map((f: { feature: string }) => f.feature))];
}

// Helper function to check if a user has admin permissions
// Note: This is now using the feature-based permissions system instead of roles
export async function checkAdmin(session: Session): Promise<boolean> {
  if (!session || !session.user) return false;
  
  // Get the user's features through the access group system
  const features = await getUserFeatures(session.user.id);
  
  // Check if the user has the admin_dashboard feature which indicates admin access
  return features.includes('admin_dashboard');
}
