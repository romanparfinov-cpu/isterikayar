import React from 'react';

export const CartridgeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} width="1em" height="1em">
    {/* Mouthpiece */}
    <path d="M7 11C7 6 8.5 4 12 4C15.5 4 17 6 17 11" stroke="currentColor" strokeWidth="1.5" />
    {/* Tank */}
    <rect x="6" y="11" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
    {/* Inner Coil */}
    <rect x="10" y="11" width="4" height="6" stroke="currentColor" strokeWidth="1.5" />
    {/* Silicon seal line */}
    <path d="M6 17H18" stroke="currentColor" strokeWidth="1.5" />
    {/* Bottom Contacts */}
    <path d="M9 20V22M15 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const VapeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} width="1em" height="1em">
    {/* Device Body */}
    <rect x="7" y="11" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    {/* Pod Tank */}
    <path d="M8 11V8C8 7.5 8.5 7 9 7H15C15.5 7 16 7.5 16 8V11" stroke="currentColor" strokeWidth="1.5" />
    {/* Mouthpiece */}
    <path d="M9 7C9 4.5 10 3 12 3C14 3 15 4.5 15 7" stroke="currentColor" strokeWidth="1.5" />
    {/* XROS Button/Screen */}
    <rect x="10.5" y="14" width="3" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 16.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const JuiceBottleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} width="1em" height="1em">
    {/* Bottle Body */}
    <rect x="6" y="9" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    {/* Abstract SOAK Wave */}
    <path d="M6 14C9.5 14 11 18 18 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Cap Base */}
    <rect x="7.5" y="7" width="9" height="2" stroke="currentColor" strokeWidth="1.5" />
    {/* Cap Tip */}
    <path d="M9 7V4.5C9 3.5 10 2 12 2C14 2 15 3.5 15 4.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* L Logo Detail */}
    <rect x="8.5" y="18" width="2" height="2" rx="0.5" fill="currentColor" />
  </svg>
);

export const SnusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} width="1em" height="1em">
    {/* Puck Outer Rim */}
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    {/* Puck Inner Ring */}
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
    {/* Low-Poly Bear Head (Iceberg) */}
    <path d="M8 10L9 7L11 9L13 9L15 7L16 10L14 15L10 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 15L12 17L14 15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Bear Eyes */}
    <circle cx="10.5" cy="11.5" r="0.5" fill="currentColor" />
    <circle cx="13.5" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
);
