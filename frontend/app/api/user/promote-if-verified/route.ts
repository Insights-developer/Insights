import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// SET YOUR GROUP IDS from the access_groups table:
const GUEST_GROUP_ID = 5;   // Replace with actual ID for 'Guest'
const MEMBER_GROUP_ID = 2;  // Replace with actual ID for 'Member' (or your default member group)

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // 1. Authenticate
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. See if user is in Guest group
  const { data: userGroups, error: groupErr } = await supabase
    .from('user_access_groups')
    .select('group_id')
    .eq('user_id', user.id);

  if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 500 });
  const groupIds = (userGroups || []).map(g => g.group_id);
  const isGuest = groupIds.includes(GUEST_GROUP_ID);

  if (!isGuest) {
    return NextResponse.json({ promoted: false, alreadyPromoted: true });
  }

  // 3. Get freshest auth info for email verification
  const { data: freshAuth } = await supabase.auth.getUser();
  const verified = !!freshAuth?.user?.email_confirmed_at;

  if (!verified) {
    return NextResponse.json({ promoted: false, reason: "Email not confirmed" });
  }

  // 4. Promote: Remove from Guest, add to Member
  await supabase
    .from('user_access_groups')
    .delete()
    .eq('user_id', user.id)
    .eq('group_id', GUEST_GROUP_ID);

  await supabase
    .from('user_access_groups')
    .insert([{ user_id: user.id, group_id: MEMBER_GROUP_ID }]);

  return NextResponse.json({ promoted: true });
}
