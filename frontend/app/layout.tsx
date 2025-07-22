'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ui/ThemeProvider';
import Spinner from './components/ui/Spinner';
import { usePageLoading } from './hooks/usePageLoading';
import { supabase } from '../utils/supabase/browser';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loading = usePageLoading();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data?.user);
    });
  }, []);

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* ONLY show navigation if the user is authenticated and logged in*/}
          {isAuthenticated && <Navbar />}
          {/* Loading spinner overlay */}
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
              <Spinner size={64} />
            </div>
          )}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
