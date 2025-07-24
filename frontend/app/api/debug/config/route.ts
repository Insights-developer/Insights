import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    const config = {
      environment: process.env.NODE_ENV || 'development',
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      features: api.getFeatures()
    };

    return api.success(config);
  });
}
