import React from "react";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 bg-gradient-to-br from-blue-950/80 via-blue-900/50 to-indigo-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative flex items-center justify-center scale-110">
        <div className="absolute w-28 h-28 border-4 border-blue-400/10 rounded-full animate-[spin_3s_linear_infinite]" />
        <div className="absolute w-24 h-24 border-4 border-transparent border-t-blue-400 border-r-blue-400/40 rounded-full animate-spin" />
        <img 
          src="https://media-stock.orbifinancial.com/OrbiShop_Logo_Blue.png" 
          alt="Orbi Logo" 
          className="w-12 h-12 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse brightness-0 invert" 
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

