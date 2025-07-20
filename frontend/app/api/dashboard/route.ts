import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

export async function GET(req: Request) {
  const supabase = createClient();

  // 1. Authenticate user
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. RBAC: (Optional) - Require 'dashboard_page' feature
  // const features = await getUserFeatures(user.id);
  // if (!features.includes("dashboard_page")) {
  //   return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  // }

  // 3. (Example) Return a welcome and their allowed features
  const features = await getUserFeatures(user.id);
  return new Response(
    JSON.stringify({
      message: `Welcome, ${user.email}!`,
      features,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
