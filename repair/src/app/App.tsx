import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner";

/**
 * Main App Component
 * 
 * Renders the entire application with responsive layout:
 * - Admin pages: Full width on desktop
 * - User pages: Mobile-first layout (max-width 420px) with gray sidebar on desktop
 * 
 * Layout structure mimics Instagram/Twitter feed on desktop (centered column)
 */
export default function App() {
  const [isAdminPage, setIsAdminPage] = useState(false);

  // Detect current route to apply appropriate layout
  useEffect(() => {
    const checkPath = () => {
      setIsAdminPage(window.location.pathname.includes('/admin'));
    };
    
    checkPath();
    
    // Listen for route changes (browser back/forward)
    window.addEventListener('popstate', checkPath);
    
    // Override pushState/replaceState to detect programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      checkPath();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      checkPath();
    };
    
    return () => {
      window.removeEventListener('popstate', checkPath);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      {/* Background: gray with centered content */}
      <div className="min-h-screen bg-gray-200/60 flex justify-center">
        {/* Admin pages: full width | User pages: mobile-first 420px max width */}
        <div className={`w-full ${isAdminPage ? '' : 'max-w-[420px]'} h-screen bg-white shadow-2xl relative overflow-hidden ${isAdminPage ? '' : 'border-x border-gray-200'}`}>
          {/* Internal scroll container */}
          <div className="h-full w-full overflow-y-auto scrollbar-hide">
            <RouterProvider router={router} />
          </div>
        </div>
      </div>
    </>
  );
}