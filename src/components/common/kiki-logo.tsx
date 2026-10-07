import React from 'react';

interface KikiLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export function KikiLogo({ className = 'w-9 h-9', size, ...props }: KikiLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* Top Wave */}
      <path
        d="M33.5 48C36 44 43 40.2 53.5 38.2C60 37 64.5 35 66.8 33.2C66.9 33.9 66.4 35.8 64.2 38.2C59.8 42.2 52.8 43.8 43 45.8C38 46.8 34.5 47.7 33.5 48Z"
        fill="currentColor"
      />
      {/* Middle Wave */}
      <path
        d="M33.5 57.5C36 53.5 43 49.7 53.5 47.7C60 46.5 64.5 44.5 66.8 42.7C66.9 43.4 66.4 45.3 64.2 47.7C59.8 51.7 52.8 53.3 43 55.3C38 56.3 34.5 57.2 33.5 57.5Z"
        fill="currentColor"
      />
      {/* Bottom Wave */}
      <path
        d="M33.5 67C36 63 43 59.2 53.5 57.2C60 56 64.5 54 66.8 52.2C66.9 52.9 66.4 54.8 64.2 57.2C59.8 61.2 52.8 62.8 43 64.8C38 65.8 34.5 66.7 33.5 67Z"
        fill="currentColor"
      />
    </svg>
  );
}
