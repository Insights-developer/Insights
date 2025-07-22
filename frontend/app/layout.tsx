'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ui/ThemeProvider';
import '../styles/globals.css';
import { supabase } from '../utils/supabase/browser';

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
