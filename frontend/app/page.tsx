'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import AuthForm from './components/AuthForm'; // we'll move your current auth form to a component

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      // If authenticated, proceed to target (e.g., admin for admins, dashboard for users)
      if (data?.user) {
        // You may fetch the current user's role here if you want to direct admins immediately
        router.replace('/admin');
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) return <div>Loading...</div>;

  // Show only the auth UI – no other navigation!
  return (
    <main style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <h1>Welcome to Insights App</h1>
      <AuthForm />
    </main>
  );
}
