'use client';

import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { supabase } from '@/utils/supabase/browser';
import '../styles/globals.css'; // Reference your Tailwind/global CSS

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
