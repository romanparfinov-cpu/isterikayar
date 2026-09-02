import React from 'react';

export const VapeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width="1em" height="1em">
    <rect x="7" y="9" width="10" height="13" rx="2" />
    <path d="M10 9V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" />
    <path d="M12 2v2" />
  </svg>
);

export const CartridgeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width="1em" height="1em">
    <path d="M8 8v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8" />
    <path d="M7 8h10V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2z" />
    <path d="M12 4V2" />
  </svg>
);

export const JuiceBottleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} width="1em" height="1em">
    <path d="M10 2v3" />
    <path d="M14 2v3" />
    <path d="M10 2h4" />
    <rect x="6" y="9" width="12" height="13" rx="3" />
    <path d="M8 9l2-4h4l2 4" />
    <path d="M9 14h6" />
  </svg>
);
