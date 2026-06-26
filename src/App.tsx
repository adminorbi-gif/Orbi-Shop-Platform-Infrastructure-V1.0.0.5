import { useState, useEffect } from 'react';
import ClientApp from './pages/ClientApp';
import AdminApp from './pages/AdminApp';
import { getNavigationState } from './utils/navigation';
import { FloatingShortcutNav } from './components/FloatingShortcutNav';
import { supabase } from './lib/supabase';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const handleNavigationAndSession = async () => {
      const search = window.location.search;
      const path = window.location.pathname;

      const isRequestedPortal = 
        path.startsWith('/i') || 
        search.includes('seller-productportal=true');

      if (isRequestedPortal) {
        // Asynchronously check active session on server/client
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!active) return;
          // No active session! Perform redirects using constant Primary URL Path
          const PRIMARY_URL_PATH = window.location.origin;
          
          // 1. First return/redirect to seller-productportal=false on current origin
          window.history.replaceState({}, '', PRIMARY_URL_PATH + '/?seller-productportal=false');
          window.dispatchEvent(new Event('popstate'));
          
          // 2. Then redirect to seller-login=true on current origin
          setTimeout(() => {
            if (!active) return;
            window.history.replaceState({}, '', PRIMARY_URL_PATH + '/?seller-login=true');
            window.dispatchEvent(new Event('popstate'));
          }, 150);
          return;
        }
      }

      const state = getNavigationState();
      setIsAdmin(state.isSellerLogin || state.isSellerSignup);
      setLoading(false);
    };

    handleNavigationAndSession();
    window.addEventListener('popstate', handleNavigationAndSession);
    const interval = setInterval(handleNavigationAndSession, 400); // Robust fallback polling for state changes

    return () => {
      active = false;
      window.removeEventListener('popstate', handleNavigationAndSession);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md font-sans">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/favicon.png" 
            alt="Orbi Logo" 
            className="w-12 h-12 object-contain animate-pulse grayscale rounded-full" 
            referrerPolicy="no-referrer"
          />
          <p className="text-sm uppercase tracking-widest font-medium text-slate-500">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {isAdmin ? <AdminApp /> : <ClientApp />}
      {/* Dynamic floating shortcut navigation bar to instantly toggle views */}
      <FloatingShortcutNav />
    </div>
  );
}
