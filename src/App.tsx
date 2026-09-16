import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/hooks/useAuth';

import HomePage from '@/pages/HomePage';
const BrowsePage = lazy(() => import('@/pages/BrowsePage'));
const AnimePage = lazy(() => import('@/pages/AnimePage'));
const WatchPage = lazy(() => import('@/pages/WatchPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const GenrePage = lazy(() => import('@/pages/GenrePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
    },
  },
});

function PageSkeleton() {
  return (
    <div className="min-h-screen pt-20 flex flex-col items-center justify-center p-4 gap-4">
      <img src="/loader.gif" alt="Loading..." className="w-24 h-24 object-contain" />
      <p className="font-display text-base text-text-muted animate-pulse">Loading...</p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <div className="min-h-screen flex flex-col bg-void text-text-primary">
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-card">
                  Skip to main content
                </a>
                <Navbar />
                <div id="main-content" className="flex-grow">
                  <ErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/browse" element={<BrowsePage />} />
                        <Route path="/anime/:id" element={<AnimePage />} />
                        <Route path="/watch/:id/:episode" element={<WatchPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/genre/:slug" element={<GenrePage />} />
                        <Route path="/watchlist" element={<ProfilePage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <Footer />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
