'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden';

export default function DrawsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/');
        return;
      }

      const resp = await fetch('/api/user/features');
      const { features } = await resp.json();

      if (features?.includes('draws_page')) {
        setAllowed(true);
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size={48} />
          <div className="mt-4 text-muted">Loading draws…</div>
        </div>
      </Card>
    </main>
  );
  
  if (!allowed) return <Forbidden />;

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', padding: 20 }}>
      <Card title="Draws" icon={<Icon name="shuffle" animate />}>
        <p>View and upload draw results or analyze recent draws.</p>
      </Card>
    </main>
  );
}
