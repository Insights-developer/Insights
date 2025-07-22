'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import { appCache } from '../../../utils/cache';
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
  const [isNavigating, setIsNavigating] = useState(false);

  // Function to fetch nav links with caching
  async function fetchNavLinks() {
    const CACHE_KEY = 'user-nav-links';
    const CACHE_DURATION = 60000; // 1 minute cache
    
    // Check cache first
    const cachedData = appCache.get<NavItem[]>(CACHE_KEY);
    if (cachedData) {
      setNavLinks(cachedData);
      return;
    }

    try {
      const resp = await fetch('/api/user/nav');
      const navRes = await resp.json();
      const navData = Array.isArray(navRes.nav) ? navRes.nav : [];
      
      // Cache the result
      appCache.set(CACHE_KEY, navData, CACHE_DURATION);
      setNavLinks(navData);
    } catch (error) {
      console.error('Failed to fetch navigation:', error);
      // If fetch fails but we have stale cache data, use it
      const staleData = appCache.get<NavItem[]>(CACHE_KEY);
      if (staleData) {
        setNavLinks(staleData);
      }
    }
  }

  useEffect(() => {
    fetchNavLinks();

    // Auto-refresh sidebar on admin changes
    function handleNavUpdate() {
      // Clear cache when nav updates are triggered
      appCache.delete('user-nav-links');
      appCache.delete('admin-cards');
      fetchNavLinks();
    }
    window.addEventListener('nav-update', handleNavUpdate);
    
    // Reset navigation state when route changes
    setIsNavigating(false);
    
    return () => {
      window.removeEventListener('nav-update', handleNavUpdate);
    };
  }, [pathname]);

  // Map feature keys to icons
  const getIconForNavItem = (key: string): string => {
    const iconMap: { [key: string]: string } = {
      dashboard_page: 'home',
      profile_page: 'settings', // Changed from 'user' to 'settings' (gear icon)
      contact_page: 'mail', // Changed from 'message-circle' to 'mail' (envelope icon)
      games_page: 'gamepad',
      draws_page: 'shuffle',
      results_page: 'trophy',
      insights_page: 'eye',
      admin_page: 'user', // Changed from 'settings' to 'user' (person icon)
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
        backgroundColor: '#e9ecef', // Darker grey background
        color: '#333', // Dark text instead of white
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        borderRight: '1px solid #dee2e6',
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #dee2e6', // Darker border to match
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
          const linkUrl = link.url.startsWith('/') ? link.url : `/${link.url}`;
          const isActive = pathname === linkUrl;
          
          const handleNavigation = (e: React.MouseEvent) => {
            e.preventDefault();
            if (pathname !== linkUrl) {
              setIsNavigating(true);
              router.push(linkUrl);
            }
          };
          
          return (
            <div
              key={link.key}
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
              onClick={handleNavigation}
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
          );
        })}
      </nav>

      {/* Bottom section with Profile and Collapse button */}
      <div style={{ padding: '1rem 0', borderTop: '1px solid #e9ecef' }}>
        {/* Profile link */}
        {profileItem && (
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
            onClick={(e) => {
              e.preventDefault();
              const profileUrl = profileItem.url.startsWith('/') ? profileItem.url : `/${profileItem.url}`;
              if (pathname !== profileUrl) {
                setIsNavigating(true);
                router.push(profileUrl);
              }
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
