import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-orange-500/30 backdrop-blur-md animate-fade-in">
      <div className="relative flex items-center justify-center scale-110 bg-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20">
        <img 
          src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png" 
          alt="Orbi Logo" 
          className="w-16 h-16 object-contain animate-pulse" 
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

