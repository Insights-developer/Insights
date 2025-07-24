import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';
import { getUserFeatures } from '@/utils/rbac';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const features = await getUserFeatures(api.getUser().id);
    return api.success({ features });
  });
}
