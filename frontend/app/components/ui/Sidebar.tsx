'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Icon from './Icon';
import { useTheme } from './ThemeProvider';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext for permission-based navigation

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
  isMobile?: boolean;
}

export default function Sidebar({ isCollapsed, onToggle, isMobile = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const auth = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  // Define all possible navigation items with their feature requirements
  const allNavItems = [
    { key: 'dashboard_page', label: 'Dashboard', url: '/dashboard', icon: 'home', order: 1, feature: 'dashboard_page' },
    { key: 'games_page', label: 'Games', url: '/games', icon: 'gamepad', order: 2, feature: 'games_page' },
    { key: 'results_page', label: 'Results', url: '/results', icon: 'trophy', order: 3, feature: 'results_page' },
    { key: 'insights_page', label: 'Insights', url: '/insights', icon: 'eye', order: 4, feature: 'insights_page' },
    { key: 'contact_page', label: 'Contact', url: '/contact', icon: 'mail', order: 5, feature: 'contact' },
    { key: 'admin_page', label: 'Admin', url: '/admin', icon: 'user', order: 10, feature: 'admin' },
  ];

  // Filter navigation items based on user permissions using centralized auth
  const visibleNavItems = allNavItems.filter(item => auth.hasFeature(item.feature));
  
  // Separate profile (always visible when authenticated) and main nav items
  const mainNavItems = visibleNavItems.filter(item => item.key !== 'profile_page');
  const profileItem = auth.user ? { key: 'profile_page', label: 'Profile', url: '/profile', icon: 'settings', order: 99, feature: 'profile_page' } : null;

  useEffect(() => {
    // Reset navigation state when route changes
    setIsNavigating(false);
  }, [pathname]);

  return (
    <div
      className={`
        ${isCollapsed ? 'w-15' : 'w-64'} h-screen bg-gray-200 text-gray-800
        ${isMobile ? 'fixed' : 'fixed'} left-0 top-0 z-40
        transition-all duration-300 ease-in-out
        flex flex-col shadow-lg border-r border-gray-300
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}
      style={{
        width: isCollapsed ? '60px' : '250px',
        transform: isMobile && isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #dee2e6',
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
          const isActive = pathname === link.url;
          
          const handleNavigation = (e: React.MouseEvent) => {
            e.preventDefault();
            if (pathname !== link.url) {
              setIsNavigating(true);
              router.push(link.url);
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
                backgroundColor: isActive ? '#3B82F6' : 'transparent',
                color: isActive ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onClick={handleNavigation}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
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
                name={link.icon} 
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
        {profileItem && auth.hasFeature('profile_page') && (
          <div
            className="inline-flex items-center font-semibold rounded transition"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: isCollapsed ? '12px' : '12px 16px',
              margin: '4px 12px 16px 12px',
              borderRadius: '8px',
              backgroundColor: pathname === profileItem.url ? '#3B82F6' : 'transparent',
              color: pathname === profileItem.url ? 'white' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
            onClick={(e) => {
              e.preventDefault();
              if (pathname !== profileItem.url) {
                setIsNavigating(true);
                router.push(profileItem.url);
              }
            }}
            onMouseEnter={(e) => {
              if (pathname !== profileItem.url) {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== profileItem.url) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }
            }}
          >
            <Icon 
              name={profileItem.icon} 
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
