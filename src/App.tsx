import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Skeleton } from './components/ui/Skeleton';
import { AlertProvider } from './context/AlertContext';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Customers = lazy(() => import('./pages/Customers').then((module) => ({ default: module.Customers })));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail').then((module) => ({ default: module.CustomerDetail })));
const Assets = lazy(() => import('./pages/Assets').then((module) => ({ default: module.Assets })));
const Appraisal = lazy(() => import('./pages/Appraisal').then((module) => ({ default: module.Appraisal })));
const PawnTransactions = lazy(() => import('./pages/PawnTransactions').then((module) => ({ default: module.PawnTransactions })));
const PawnDetail = lazy(() => import('./pages/PawnDetail').then((module) => ({ default: module.PawnDetail })));
const Payments = lazy(() => import('./pages/Payments').then((module) => ({ default: module.Payments })));
const Inventory = lazy(() => import('./pages/Inventory').then((module) => ({ default: module.Inventory })));
const Overdue = lazy(() => import('./pages/Overdue').then((module) => ({ default: module.Overdue })));
const MarketIntelligence = lazy(() => import('./pages/MarketIntelligence').then((module) => ({ default: module.MarketIntelligence })));
const Reports = lazy(() => import('./pages/Reports').then((module) => ({ default: module.Reports })));
const Users = lazy(() => import('./pages/Users').then((module) => ({ default: module.Users })));
const Branches = lazy(() => import('./pages/Branches').then((module) => ({ default: module.Branches })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then((module) => ({ default: module.AuditLogs })));

const RouteFallback = () => (
  <div className="space-y-6" aria-label="Memuat halaman">
    <Skeleton className="h-8 w-56 rounded-md" />
    <Skeleton className="h-24 w-full rounded-lg" />
    <Skeleton className="h-72 w-full rounded-lg" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appraisal"
            element={
              <ProtectedRoute>
                <Appraisal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pawn-transactions"
            element={
              <ProtectedRoute>
                <PawnTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pawn-transactions/:id"
            element={
              <ProtectedRoute>
                <PawnDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overdue"
            element={
              <ProtectedRoute>
                <Overdue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-intelligence"
            element={<Navigate to="/appraisal" replace />}
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/branches"
            element={
              <ProtectedRoute>
                <Branches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
      </BrowserRouter>
    </AlertProvider>
  </QueryClientProvider>
  );
};
