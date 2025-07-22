'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ui/ThemeProvider';
import Sidebar from './components/ui/Sidebar';
import UserInfoBox from './components/ui/UserInfoBox';
import '../styles/globals.css';
import { supabase } from '../utils/supabase/browser';
import { initializePrefetch } from '../utils/prefetch';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data }) => {
      const isAuth = !!data?.user;
      setIsAuthenticated(isAuth);
      
      // Initialize prefetch if authenticated
      if (isAuth) {
        const cleanup = initializePrefetch();
        return cleanup;
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuth = !!session?.user;
      setIsAuthenticated(isAuth);
      
      // Initialize prefetch on login
      if (isAuth && event === 'SIGNED_IN') {
        initializePrefetch();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {isAuthenticated ? (
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              {/* Sidebar */}
              <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
              
              {/* Main content area */}
              <div 
                style={{ 
                  flex: 1,
                  marginLeft: isSidebarCollapsed ? '60px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Top bar with user info */}
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '16px 24px',
                    backgroundColor: '#f8f9fa', // Light grey to match the overall design
                    borderBottom: '1px solid #e9ecef',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                  }}
                >
                  <UserInfoBox />
                </div>
                
                {/* Page content */}
                <div style={{ flex: 1, padding: '24px' }}>
                  {children}
                </div>
              </div>
            </div>
          ) : (
            // Non-authenticated layout (login page)
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
