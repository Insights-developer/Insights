'use client';

import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import { supabase } from '@/utils/supabase/browser';

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
        {/* ONLY show navigation if the user is authenticated */}
        {isAuthenticated && <Navbar />}
        {children}
      </body>
    </html>
  );
}
