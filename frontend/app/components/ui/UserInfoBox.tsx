'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Icon from './Icon';
import Avatar from './Avatar';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext with database profile

interface UserProfile {
  email: string;
  username?: string;
  phone?: string;
  created_at: string;
  groups: Array<{ id: string; name: string; description?: string }>;
  previousLoginAt?: string;
  loginCount?: number;
}

export default function UserInfoBox() {
  const router = useRouter();
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Don't render if user is not authenticated
  if (!auth.user) return null;

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }

    if (auth.user) {
      fetchUserProfile();
    }
  }, [auth.user]);

  // Use profile data if available, fallback to auth user data
  const displayName = userProfile?.username || auth.user.email?.split('@')[0] || 'User';
  const email = userProfile?.email || auth.user.email || '';
  const groups = userProfile?.groups || [];
  const isFirstTime = (userProfile?.loginCount || 0) <= 1;
  const welcomeMessage = isFirstTime ? `Welcome, ${displayName}!` : `Welcome back, ${displayName}!`;

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'First login';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  async function handleSignOut() {
    await auth.signOut();
    setIsDropdownOpen(false);
    router.replace('/');
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', minWidth: 'max-content' }}>
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
          whiteSpace: 'nowrap',
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
            {groups.length > 0 ? groups.map(g => g.name).join(', ') : 'Member'}
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
            maxWidth: '90vw',
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
              {profileLoading ? 'Loading...' : welcomeMessage}
            </div>
            <div style={{ fontSize: '14px', color: '#8D99AE' }}>
              {email}
            </div>
          </div>

          {/* User details */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8D99AE', marginBottom: '4px' }}>
                ACCESS GROUPS
              </div>
              <div style={{ fontSize: '14px', color: '#22223B', fontWeight: 500 }}>
                {profileLoading ? 'Loading...' : (groups.length > 0 ? groups.map(g => g.name).join(', ') : 'No groups assigned')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8D99AE', marginBottom: '4px' }}>
                LAST LOGIN
              </div>
              <div style={{ fontSize: '14px', color: '#22223B' }}>
                {profileLoading ? 'Loading...' : formatLastLogin(userProfile?.previousLoginAt)}
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
