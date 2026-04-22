import { Outlet, Link, useLocation } from 'react-router';
import { Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

/**
 * Root Layout Component - Premium v2
 * - Enhanced sticky navigation with glassmorphism
 * - Animated mobile menu with slide-in panel
 * - Floating pill navigation bar with glow effects
 * - Dynamic favicon generation
 * - Scroll-aware header shadow
 */
export default function Root() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';

  // Favicon auto-generation
  useEffect(() => {
    const faviconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#grad1)"/>
        <rect x="16" y="28" width="32" height="20" rx="3" fill="white" opacity="0.95"/>
        <rect x="18" y="24" width="28" height="5" rx="2" fill="white" opacity="0.9"/>
        <rect x="22" y="18" width="20" height="8" rx="2" fill="#fbbf24" opacity="0.9"/>
        <circle cx="24" cy="36" r="2.5" fill="#ec4899"/>
        <circle cx="32" cy="36" r="2.5" fill="#a855f7"/>
        <circle cx="40" cy="36" r="2.5" fill="#06b6d4"/>
      </svg>
    `;

    const faviconBlob = new Blob([faviconSVG], { type: 'image/svg+xml' });
    const faviconURL = URL.createObjectURL(faviconBlob);
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) existingFavicon.remove();
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = faviconURL;
    document.head.appendChild(link);
    document.title = 'MacaPrint - 마카롱 프린터 렌탈';

    return () => URL.revokeObjectURL(faviconURL);
  }, []);

  // Scroll detection for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-x-hidden">
      {/* Mobile Container Wrapper */}
      <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl shadow-gray-300/50 overflow-x-hidden relative">
        {/* Mobile Navigation Bar - Sticky Top (hidden on home) */}
        {!isHome && (
          <nav
            className={`sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b z-40 transition-[border-color,box-shadow] duration-300 ${
              scrolled ? 'border-gray-200/80 shadow-lg shadow-gray-200/30' : 'border-gray-100/50 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-gray-900 text-lg tracking-tight">MacaPrint</span>
              </Link>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main>
          <Outlet />
        </main>

        {/* Toaster */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '16px',
              padding: '14px 20px',
              fontSize: '14px',
              fontWeight: '600',
            },
          }}
        />
      </div>
    </div>
  );
}