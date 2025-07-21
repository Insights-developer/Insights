'use client';

import React from 'react';
import clsx from 'clsx';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded focus:outline-none transition',
        {
          // Size
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
          // Variants
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary' && !disabled,
          'bg-gray-100 text-gray-800 hover:bg-gray-200': variant === 'secondary' && !disabled,
          'bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-100': variant === 'outline' && !disabled,
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger' && !disabled,
          // Disabled
          'opacity-60 cursor-not-allowed': disabled,
          // Full width
          'w-full': fullWidth,
        },
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
}
