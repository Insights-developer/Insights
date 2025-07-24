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

  // Function to fetch nav links
  async function fetchNavLinks() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setUser({ email: data.user.email ?? '' });
      const resp = await fetch('/api/user/nav', { credentials: 'include' });
      const navRes = await resp.json();
      setNavLinks(Array.isArray(navRes.nav) ? navRes.nav : []);
    }
  }

  useEffect(() => {
    fetchNavLinks();

    // -- Auto-refresh Navbar on admin changes --
    function handleNavUpdate() {
      fetchNavLinks();
    }
    window.addEventListener('nav-update', handleNavUpdate);
    return () => {
      window.removeEventListener('nav-update', handleNavUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Re-fetches on route change *and* after admin CRUD

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
          <Link
            href={link.url.startsWith('/') ? link.url : `/${link.url}`} // Ensures absolute URL
            key={link.key}
            style={{ marginRight: 16, display: 'inline-flex', alignItems: 'center' }}
          >
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
