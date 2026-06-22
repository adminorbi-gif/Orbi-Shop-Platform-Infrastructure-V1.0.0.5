import { useState, useEffect } from 'react';
import ClientApp from './pages/ClientApp';
import AdminApp from './pages/AdminApp';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check both pathname and query string for static host compatibility
    if (window.location.pathname.startsWith('/admin') || window.location.search.includes('admin=true') || window.location.hash.includes('#admin')) {
      setIsAdmin(true);
    }
  }, []);

  if (isAdmin) {
    return <AdminApp />;
  }

  return <ClientApp />;
}
