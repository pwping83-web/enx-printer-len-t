import { createBrowserRouter } from "react-router";
import { Home } from "@/app/components/Home";
import { CustomerRequest } from "@/app/components/CustomerRequest";
import { AdminDashboard } from "@/app/components/AdminDashboard";
import { SuccessPage } from "@/app/components/SuccessPage";
import { NotFound } from "@/app/components/NotFound";

const normalizedBase = (() => {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") return "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
})();

/**
 * Application Routes Configuration
 * 
 * Routes:
 * - /                    : Home page (Landing page with service introduction)
 * - /customer/request    : Customer repair request form
 * - /admin               : Admin dashboard (view all requests)
 * - /success             : Success confirmation page after submission
 * - *                    : 404 Not Found page
 */
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/customer/request",
    Component: CustomerRequest,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/success",
    Component: SuccessPage,
  },
  {
    path: "*",
    Component: NotFound,
  },
], {
  basename: normalizedBase,
});