import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SEO } from '@/components/common/SEO';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <PageWrapper className="min-h-screen flex items-center justify-center py-20 px-4">
      <SEO
        title="Page Not Found (404)"
        description="The page you were looking for doesn't exist. Head back to MikuAnime to stream anime online in HD."
        noindex
      />
      <div className="relative w-full max-w-md mx-auto flex flex-col items-center text-center">
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="relative mt-8">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent-primary/10 rounded-full blur-2xl" />
          <img
            src="/crying-miku.gif"
            alt="MikuAnime page not found"
            className="w-40 h-40 object-contain"
          />
        </div>

        <h1 className="font-display font-bold text-8xl leading-none mt-2 bg-gradient-to-b from-accent-glow to-accent-primary bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-text-secondary text-sm mt-3 max-w-xs">
          Looks like this page went on a hiatus. Even Miku's crying...
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-glow hover:shadow-glow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          Back Home
        </Link>
      </div>
    </PageWrapper>
  );
}
