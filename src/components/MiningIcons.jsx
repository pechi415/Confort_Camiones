import React from 'react';

export const IconSuspension = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Neumático */}
    <rect x="2" y="4" width="6" height="16" rx="2" />
    {/* Eje de conexión */}
    <path d="M8 12h6" />
    {/* Resorte / Amortiguador */}
    <path d="M14 7h6" />
    <path d="M14 17h6" />
    <path d="M17 7v2" />
    <path d="M17 15v2" />
    <path d="M14 9l6 1.5-6 1.5 6 1.5-6 1.5" />
  </svg>
);

export const IconTolva = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M3 17h18" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="10" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M15 17V9h4l2 3v5h-6z" />
    <path d="M19 9v3h2" />
    <path d="M4 14l10-4 1 5-11 2z" />
  </svg>
);

export const IconBarra = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M4 14h4l2 2h4l2-2h4" />
    <rect x="2" y="12" width="2" height="4" rx="1" />
    <rect x="20" y="12" width="2" height="4" rx="1" />
    <rect x="7" y="8" width="2" height="6" />
    <rect x="15" y="8" width="2" height="6" />
  </svg>
);

export const IconTransmision = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect x="2" y="2" width="4" height="2" rx="0.5" />
    <rect x="18" y="2" width="4" height="2" rx="0.5" />
    <rect x="2" y="20" width="4" height="2" rx="0.5" />
    <rect x="18" y="20" width="4" height="2" rx="0.5" />
    <path d="M4 4v16" />
    <path d="M20 4v16" />
    <path d="M4 12h16" />
    <rect x="9" y="10" width="6" height="4" rx="1" />
    <path d="M12 10V8m0 8v-2" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

export const IconCabina = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2" />
    <path d="M3 12h7" />
    <path d="M14 12h7" />
    <path d="M12 14v7" />
  </svg>
);

export const IconDireccion = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <circle cx="12" cy="5" r="3" />
    <path d="M9 5h6" />
    <path d="M12 8v6" />
    <rect x="10" y="14" width="4" height="3" rx="0.5" />
    <path d="M6 15.5h4m4 0h4" />
    <rect x="2" y="12" width="4" height="8" rx="1.5" />
    <rect x="18" y="12" width="4" height="8" rx="1.5" />
  </svg>
);

export const IconNoseCone = ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    {/* Estructura Base */}
    <path d="M4 7h16" />
    {/* El Pivote central */}
    <circle cx="12" cy="13" r="5" />
    <circle cx="12" cy="13" r="2" fill={color} />
    {/* Pernos (Sólidos) */}
    <g stroke="none" fill={color}>
      <circle cx="12" cy="9" r="0.8" />
      <circle cx="15" cy="10" r="0.8" />
      <circle cx="16" cy="13" r="0.8" />
      <circle cx="15" cy="16" r="0.8" />
      <circle cx="12" cy="17" r="0.8" />
      <circle cx="9" cy="16" r="0.8" />
      <circle cx="8" cy="13" r="0.8" />
      <circle cx="9" cy="10" r="0.8" />
    </g>
    {/* Acople inferior */}
    <path d="M8 18l-2 3h12l-2-3" />
  </svg>
);
