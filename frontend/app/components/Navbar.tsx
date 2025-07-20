'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

type NavItem = {
  key: string;
  label: string;
  url: string;
  icon: string | null;
  order: number;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [navLinks, setNavLinks] = useState<NavItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        if (mounted) setUser({ email: data.user.email ?? '' });
        // Fetch navigation links from API
        const resp = await fetch('/api/user/nav');
        const navRes = await resp.json();
        if (mounted) setNavLinks(Array.isArray(navRes.nav) ? navRes.nav : []);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (!user) return null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#f8f9fa',
        marginBottom: 32,
      }}
    >
      <div>
        {navLinks.map(link => (
          <Link href={link.url} key={link.key} style={{ marginRight: 16, display: 'inline-flex', alignItems: 'center' }}>
            {link.icon && (
              <img
                src={link.icon}
                alt={`${link.label} icon`}
                style={{ width: 20, height: 20, marginRight: 6, objectFit: 'contain', verticalAlign: 'middle' }}
              />
            )}
            {link.label}
          </Link>
        ))}
      </div>
      <div>
        <span style={{ fontSize: 14, color: '#333', marginRight: 16 }}>
          {user.email}
        </span>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  );
}
