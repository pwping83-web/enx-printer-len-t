import { Outlet, Link, useLocation } from 'react-router';
import { Home, FileText, Menu, X, Printer, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';
  const isCustom = location.pathname === '/custom';

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', icon: Home, label: '홈', isActive: isHome },
    { to: '/custom', icon: FileText, label: '견적작성', isActive: isCustom },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-x-hidden">
      {/* Mobile Container Wrapper */}
      <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-2xl shadow-gray-300/50 overflow-x-hidden relative">
        {/* Mobile Navigation Bar - Sticky Top (hidden on home) */}
        {!isHome && (
          <motion.nav
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
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

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-90"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-700" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700" />
                )}
              </button>
            </div>
          </motion.nav>
        )}

        {/* Mobile Menu Overlay - Animated */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50"
              >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Printer className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-black text-slate-800 text-base">메뉴</h2>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                            item.isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                              : 'bg-gray-50 text-slate-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-100 bg-gradient-to-t from-gray-50">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">MacaPrint v2.0</p>
                    </div>
                    <p className="text-xs text-slate-400">마카롱 프린터 렌탈 솔루션</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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