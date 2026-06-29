/**
 * marketingRoutes.ts
 *
 * Public marketing routes — no auth guard required.
 * Import and spread these into your root router alongside
 * the existing protected /app routes.
 *
 * Usage in your router index:
 *   import { marketingRoutes } from './routes/marketingRoutes'
 *   ...
 *   createBrowserRouter([
 *     ...marketingRoutes,
 *     ...existingAppRoutes,   // ← untouched
 *   ])
 */

import type { RouteObject } from 'react-router-dom'
import Home         from '@/pages/marketing/Home'
import FeaturesPage from '@/pages/marketing/FeaturesPage'
import PricingPage  from '@/pages/marketing/PricingPage'
import ContactPage  from '@/pages/marketing/ContactPage'

export const marketingRoutes: RouteObject[] = [
  { path: '/',          element: <Home /> },
  { path: '/features',  element: <FeaturesPage /> },
  { path: '/pricing',   element: <PricingPage /> },
  { path: '/contact',   element: <ContactPage /> },
]