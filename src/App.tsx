import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/hooks/useAuth';
import { Analytics } from '@vercel/analytics/react';

function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const hasRefreshed = sessionStorage.getItem('lazy_retry_refreshed') === 'true';
    try {
      const component = await componentImport();
      sessionStorage.removeItem('lazy_retry_refreshed');
      return component;
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string };
      const isChunkError =
        err?.message?.includes('Failed to fetch dynamically imported module') ||
        err?.message?.includes('Importing a module script failed') ||
        err?.name === 'ChunkLoadError';

      if (isChunkError && !hasRefreshed) {
        sessionStorage.setItem('lazy_retry_refreshed', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

import HomePage from '@/pages/HomePage';
const BrowsePage = lazyWithRetry(() => import('@/pages/BrowsePage'));
const AnimePage = lazyWithRetry(() => import('@/pages/AnimePage'));
const WatchPage = lazyWithRetry(() => import('@/pages/WatchPage'));
const SearchPage = lazyWithRetry(() => import('@/pages/SearchPage'));
const SchedulePage = lazyWithRetry(() => import('@/pages/SchedulePage'));
const GenrePage = lazyWithRetry(() => import('@/pages/GenrePage'));
const ProfilePage = lazyWithRetry(() => import('@/pages/ProfilePage'));
const SignInPage = lazyWithRetry(() => import('@/pages/SignInPage'));
const RegisterPage = lazyWithRetry(() => import('@/pages/RegisterPage'));
const TermsPage = lazyWithRetry(() => import('@/pages/TermsPage'));
const PrivacyPage = lazyWithRetry(() => import('@/pages/PrivacyPage'));
const FaqPage = lazyWithRetry(() => import('@/pages/FaqPage'));
const NotFoundPage = lazyWithRetry(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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
                        <Route path="/verify-email" element={<Navigate to="/" replace />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/faq" element={<FaqPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </div>
                <Footer />
                <Analytics />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
