'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import Icon from './Icon';
import { useTheme } from './ThemeProvider';

type NavItem = {
  key: string;
  label: string;
  url: string;
  icon: string | null;
  order: number;
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const [navLinks, setNavLinks] = useState<NavItem[]>([]);

  // Function to fetch nav links
  async function fetchNavLinks() {
    const resp = await fetch('/api/user/nav');
    const navRes = await resp.json();
    setNavLinks(Array.isArray(navRes.nav) ? navRes.nav : []);
  }

  useEffect(() => {
    fetchNavLinks();

    // Auto-refresh sidebar on admin changes
    function handleNavUpdate() {
      fetchNavLinks();
    }
    window.addEventListener('nav-update', handleNavUpdate);
    return () => {
      window.removeEventListener('nav-update', handleNavUpdate);
    };
  }, [pathname]);

  // Map feature keys to icons
  const getIconForNavItem = (key: string): string => {
    const iconMap: { [key: string]: string } = {
      dashboard_page: 'home',
      profile_page: 'user',
      contact_page: 'mail',
      games_page: 'gamepad',
      draws_page: 'shuffle',
      results_page: 'trophy',
      insights_page: 'eye',
      admin_page: 'settings',
    };
    return iconMap[key] || 'circle';
  };

  // Sort and categorize nav items
  const sortedNavItems = [...navLinks].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div
      style={{
        width: isCollapsed ? '60px' : '250px',
        height: '100vh',
        backgroundColor: '#1a1b23',
        color: 'white',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #2a2b35',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        {!isCollapsed && (
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Insights
          </h2>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2b35';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} />
        </button>
      </div>

      {/* Navigation items */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {sortedNavItems.map((link) => {
          const isActive = pathname === (link.url.startsWith('/') ? link.url : `/${link.url}`);
          
          return (
            <Link
              key={link.key}
              href={link.url.startsWith('/') ? link.url : `/${link.url}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isCollapsed ? '12px' : '12px 24px',
                  margin: '4px 8px',
                  borderRadius: '8px',
                  color: isActive ? '#00DCA6' : 'white',
                  backgroundColor: isActive ? 'rgba(0, 220, 166, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#2a2b35';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon 
                  name={getIconForNavItem(link.key)} 
                  style={{ 
                    color: isActive ? '#00DCA6' : '#8D99AE',
                    marginRight: isCollapsed ? 0 : '12px'
                  }} 
                />
                {!isCollapsed && (
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {link.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
