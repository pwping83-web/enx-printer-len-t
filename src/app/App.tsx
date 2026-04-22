import { RouterProvider } from 'react-router';
import { router } from './routes';

/**
 * Main App Component
 * - Entry point of the application
 * - Uses React Router for navigation
 * - Provides routing to Home, Custom, Admin, Success, and NotFound pages
 */
export default function App() {
  return <RouterProvider router={router} />;
}