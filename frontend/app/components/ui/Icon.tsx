'use client';
import React from 'react';

type IconProps = {
  name: string;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Icon({ name, animate, className, style }: IconProps) {
  // Replace with your SVG sprite, Lottie, or icon library as desired
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: 24,
        height: 24,
        ...(animate ? { transition: 'transform 0.2s', transform: 'scale(1.1)' } : {}),
        ...style,
      }}
      // Placeholder: replace with actual icon rendering logic
      aria-label={name}
    >{name[0].toUpperCase()}</span>
  );
}
