import React from 'react';

interface KikiLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number | string;
}

export function KikiLogo({ className = 'w-12 h-12', size, alt = 'KIKI Logo', style, ...props }: KikiLogoProps) {
  return (
    <img
      src="/kiki-logo.jpg"
      alt={alt}
      className={`object-cover rounded-full shadow-xs ${className}`}
      style={size ? { width: size, height: size, ...style } : style}
      {...props}
    />
  );
}
