import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Custom from './pages/Custom';
import Success from './pages/Success';
import Root from './pages/Root';
import NotFound from './pages/NotFound';

/**
 * Router Configuration
 * - Defines all application routes
 * - Uses React Router's Data Mode pattern
 * 
 * Routes:
 * - / : Home page (landing page with service introduction)
 * - /custom : Quotation form page (customer input form)
 * - /admin : Admin dashboard (manage pricing, terms, email settings)
 * - /success : Success page (after quotation submission)
 * - * : 404 Not Found page
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'custom',
        element: <Custom />,
      },
      {
        path: 'admin',
        element: <Admin />,
      },
      {
        path: 'success',
        element: <Success />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);