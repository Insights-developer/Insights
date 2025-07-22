'use client';

import React from 'react';
import Card from './Cards';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  minHeight?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  sm: 'p-2 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8'
};

export default function PageLayout({ 
  children, 
  title, 
  icon,
  maxWidth = 'lg',
  padding = 'md',
  minHeight = '200px'
}: PageLayoutProps) {
  return (
    <main className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
      <Card title={title} icon={icon}>
        <div 
          className="w-full"
          style={{ minHeight }}
        >
          {children}
        </div>
      </Card>
    </main>
  );
}

// Hook for consistent loading states
export function usePageLoading(mounted: boolean, loading: boolean) {
  const showLoading = !mounted || loading;
  
  const LoadingContent = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      {children}
    </div>
  );

  return { showLoading, LoadingContent };
}
