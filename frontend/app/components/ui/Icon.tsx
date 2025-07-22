'use client';
import * as React from 'react';

type IconProps = {
  name: string;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Icon({ name, animate, className, style }: IconProps) {
  // Simple SVG icon mapping
  const icons: Record<string, React.ReactElement> = {
    lock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <rect x="5" y="11" width="14" height="8" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="15" r="1.5" />
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3,7 12,13 21,7" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    'eye-off': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-6.06" />
        <path d="M1 1l22 22" />
        <path d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
      </svg>
    ),
  };

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: 24,
        height: 24,
        verticalAlign: 'middle',
        ...(animate ? { transition: 'transform 0.2s', transform: 'scale(1.1)' } : {}),
        ...style,
      }}
      aria-label={name}
    >
      {icons[name] || <span>{name[0].toUpperCase()}</span>}
    </span>
  );
}
