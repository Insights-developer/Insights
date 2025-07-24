'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from './components/ui/ThemeProvider';
import Sidebar from './components/ui/Sidebar';
import UserInfoBox from './components/ui/UserInfoBox';
import '../styles/globals.css';

// ✅ CENTRALIZED SESSION MANAGEMENT - Root layout provides AuthProvider for entire app
// Layout content component that uses AuthContext
function LayoutContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isSidebarCollapsed]);

  // Show loading while AuthContext initializes
  if (!auth.initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {auth.user ? (
        <div className="flex min-h-screen relative">
          {/* Mobile backdrop overlay */}
          {isMobile && !isSidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setIsSidebarCollapsed(true)}
            />
          )}
          
          {/* Sidebar */}
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobile={isMobile}
          />
          
          {/* Main content area */}
          <div 
            className={`
              flex-1 flex flex-col transition-all duration-300 ease-in-out
              ${isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-15' : 'ml-64')}
            `}
            style={{
              marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '60px' : '250px'),
            }}
          >
            {/* Top bar with user info */}
            <div 
              className="flex justify-end items-center p-4 sm:p-6 bg-gray-50 border-b border-gray-200 sticky top-0 z-20"
            >
              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="mr-auto p-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className="block w-5 h-0.5 bg-gray-600 mb-1"></span>
                    <span className="block w-5 h-0.5 bg-gray-600 mb-1"></span>
                    <span className="block w-5 h-0.5 bg-gray-600"></span>
                  </div>
                </button>
              )}
              <UserInfoBox />
            </div>
            
            {/* Page content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </div>
      ) : (
        // Non-authenticated layout (login page)
        children
      )}
    </ThemeProvider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
