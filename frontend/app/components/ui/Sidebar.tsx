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
      contact_page: 'message-circle', // More relevant than mail for contact page
      games_page: 'gamepad',
      draws_page: 'shuffle',
      results_page: 'trophy',
      insights_page: 'eye',
      admin_page: 'settings', // More relevant than circle
    };
    return iconMap[key] || 'circle';
  };

  // Sort and categorize nav items
  const sortedNavItems = [...navLinks].sort((a, b) => a.label.localeCompare(b.label));
  
  // Separate profile and main nav items
  const mainNavItems = sortedNavItems.filter(item => item.key !== 'profile_page');
  const profileItem = sortedNavItems.find(item => item.key === 'profile_page');

  return (
    <div
      style={{
        width: isCollapsed ? '60px' : '250px',
        height: '100vh',
        backgroundColor: '#f8f9fa', // Light grey instead of black
        color: '#333', // Dark text instead of white
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        borderRight: '1px solid #e9ecef',
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e9ecef', // Light border
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        {!isCollapsed && (
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#22223B' }}>
            Insights
          </h2>
        )}
      </div>

      {/* Main navigation items */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {mainNavItems.map((link) => {
          const isActive = pathname === (link.url.startsWith('/') ? link.url : `/${link.url}`);
          
          return (
            <Link
              key={link.key}
              href={link.url.startsWith('/') ? link.url : `/${link.url}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="inline-flex items-center font-semibold rounded transition"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isCollapsed ? '12px' : '12px 16px',
                  margin: '4px 12px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#3B82F6' : 'transparent', // Blue background when active
                  color: isActive ? 'white' : '#374151', // White text when active, dark grey otherwise
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  border: isActive ? 'none' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#1D4ED8'; // Darker blue on hover
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                <Icon 
                  name={getIconForNavItem(link.key)} 
                  style={{ 
                    color: 'inherit',
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

      {/* Bottom section with Profile and Collapse button */}
      <div style={{ padding: '1rem 0', borderTop: '1px solid #e9ecef' }}>
        {/* Profile link */}
        {profileItem && (
          <Link
            href={profileItem.url.startsWith('/') ? profileItem.url : `/${profileItem.url}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="inline-flex items-center font-semibold rounded transition"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isCollapsed ? '12px' : '12px 16px',
                margin: '4px 12px 16px 12px',
                borderRadius: '8px',
                backgroundColor: pathname === (profileItem.url.startsWith('/') ? profileItem.url : `/${profileItem.url}`) ? '#3B82F6' : 'transparent',
                color: pathname === (profileItem.url.startsWith('/') ? profileItem.url : `/${profileItem.url}`) ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (pathname !== (profileItem.url.startsWith('/') ? profileItem.url : `/${profileItem.url}`)) {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== (profileItem.url.startsWith('/') ? profileItem.url : `/${profileItem.url}`)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              <Icon 
                name={getIconForNavItem(profileItem.key)} 
                style={{ 
                  color: 'inherit',
                  marginRight: isCollapsed ? 0 : '12px'
                }} 
              />
              {!isCollapsed && (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {profileItem.label}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Collapse toggle button */}
        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', padding: '0 12px' }}>
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: '1px solid #d1d5db',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-left'} />
          </button>
        </div>
      </div>
    </div>
  );
}
