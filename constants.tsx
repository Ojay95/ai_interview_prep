
import React from 'react';

export const APP_NAME = "MockInterview.ai";

export const Logo: React.FC<{ className?: string }> = ({ className = "size-9" }) => (
  <div className={`flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 ${className}`}>
    <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
  </div>
);

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ELITE: 'elite'
} as const;
