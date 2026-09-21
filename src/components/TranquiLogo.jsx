import React from 'react';

// Logo circular de Tranqui Finanzas: un círculo verde salvia con 2 ondas
// (crema y terracota) que transmiten calma — mismos colores de marca que
// ya usa el aro de presupuesto (SLICE_COLORS en utils/constants.js).
export const TranquiLogo = ({ size = 56, className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={className}
    role="img"
    aria-label="Logo de Tranqui Finanzas"
  >
    <defs>
      <clipPath id="tranqui-logo-clip">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
    </defs>
    <g clipPath="url(#tranqui-logo-clip)">
      <circle cx="50" cy="50" r="50" fill="#5B8A72" />
      <path d="M-10,42 Q20,26 50,42 T110,42" stroke="#F2EFE0" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M-10,58 Q20,44 50,58 T110,58" stroke="#D97B5B" strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  </svg>
);