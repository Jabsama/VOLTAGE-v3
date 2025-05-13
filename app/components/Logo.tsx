'use client';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      aria-label="VoltageGPU Logo"
      role="img"
    >
      <title>VoltageGPU Logo</title>
      <path 
        d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" 
        stroke="#FFDD57" 
        strokeWidth="2" 
        fill="none"
      />
      <path 
        d="M16 8L10 18H16L16 24L22 14H16L16 8Z" 
        fill="#FFDD57" 
        stroke="#FFDD57" 
        strokeWidth="0.5" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
