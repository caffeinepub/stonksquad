import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CoinsPage from './pages/CoinsPage';
import CoinDetailPage from './pages/CoinDetailPage';
import ActivityPage from './pages/ActivityPage';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import AppShell from './components/layout/AppShell';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { useGetCallerUserProfile } from './hooks/queries/useUserProfile';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

// Layout component for authenticated routes
function AuthenticatedLayout() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  const showProfileSetup = !!identity && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AppShell />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Landing page route (public)
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

// Authenticated layout route
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

// Authenticated child routes
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const coinsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/coins',
  component: CoinsPage,
});

const coinDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/coins/$symbol',
  component: CoinDetailPage,
});

const activityRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/activity',
  component: ActivityPage,
});

const depositRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/deposit',
  component: DepositPage,
});

const withdrawRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/withdraw',
  component: WithdrawPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  landingRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    coinsRoute,
    coinDetailRoute,
    activityRoute,
    depositRoute,
    withdrawRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
