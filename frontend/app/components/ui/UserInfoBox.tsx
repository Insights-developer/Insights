'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import Icon from './Icon';
import Avatar from './Avatar';

interface UserInfo {
  email: string;
  username?: string;
  groups: string[];
  previousLoginAt?: string;
  createdAt: string;
  loginCount: number;
}

export default function UserInfoBox() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchUserInfo() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        try {
          const resp = await fetch('/api/user/profile');
          const profile = await resp.json();
          
          setUserInfo({
            email: data.user.email ?? '',
            username: profile.username || null,
            groups: profile.groups || [],
            previousLoginAt: profile.previousLoginAt,
            createdAt: profile.createdAt,
            loginCount: profile.loginCount || 0,
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Fallback to basic info
          setUserInfo({
            email: data.user.email ?? '',
            groups: [],
            createdAt: data.user.created_at ?? '',
            loginCount: 0,
          });
        }
      }
    }

    fetchUserInfo();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (!userInfo) return null;

  const displayName = userInfo.username || userInfo.email.split('@')[0];
  const isFirstTime = userInfo.loginCount <= 1;
  const welcomeMessage = isFirstTime ? `Welcome ${displayName}!` : `Welcome back, ${displayName}!`;

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'First login';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          cursor: 'pointer',
          border: '1px solid #e9ecef',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e9ecef';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
        }}
      >
        <Avatar name={displayName} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#22223B' }}>
            {displayName}
          </span>
          <span style={{ fontSize: '12px', color: '#8D99AE' }}>
            {userInfo.groups.length > 0 ? userInfo.groups.join(', ') : 'Member'}
          </span>
        </div>
        <Icon 
          name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} 
          style={{ color: '#8D99AE' }}
        />
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '320px',
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1001,
            marginTop: '4px',
          }}
        >
          {/* Welcome message */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#22223B', marginBottom: '8px' }}>
              {welcomeMessage}
            </div>
            <div style={{ fontSize: '14px', color: '#8D99AE' }}>
              {userInfo.email}
            </div>
          </div>

          {/* User details */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8D99AE', marginBottom: '4px' }}>
                GROUP
              </div>
              <div style={{ fontSize: '14px', color: '#22223B', fontWeight: 500 }}>
                {userInfo.groups.length > 0 ? userInfo.groups.join(', ') : 'Member'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8D99AE', marginBottom: '4px' }}>
                LAST LOGIN
              </div>
              <div style={{ fontSize: '14px', color: '#22223B' }}>
                {formatLastLogin(userInfo.previousLoginAt)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '8px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#8D99AE',
                transition: 'all 0.2s ease',
                marginBottom: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              disabled
            >
              <Icon name="bell" />
              Notifications (Coming Soon)
            </button>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#E63946',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon name="log-out" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
