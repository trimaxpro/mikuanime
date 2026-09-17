import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimeGrid } from '@/components/browse/AnimeGrid';
import { DotPattern } from '@/components/ui/DotPattern';
import { EmptyState } from '@/components/ui/EmptyState';
import { SEO, buildDescription } from '@/components/common/SEO';
import { GENRES } from '@/utils/constants';
import { getGenreIcon } from '@/utils/genreIcons';
import { getGenreContent } from '@/utils/genreContent';
import { useBrowse } from '@/hooks/useAnime';
import { HelpCircle } from 'lucide-react';
import { AlertCircle, ArrowUpDown, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'score', label: 'Top Rated' },
  { value: 'trending', label: 'Trending' },
  { value: 'start_date', label: 'Release Date' },
  { value: 'title', label: 'Title' },
] as const;

function buildGenreSchema(genreName: string, slug: string) {
  const url = `https://www.mikuanime.site/genre/${slug}`;
  const content = getGenreContent(slug);
  const faq = content.faq.map((f) => ({
    '@type': 'Question',
    'name': f.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
  }));

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': `${genreName} Anime`,
      'url': url,
      'description': content.intro.join(' '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.mikuanime.site/' },
        { '@type': 'ListItem', 'position': 2, 'name': `${genreName} Anime`, 'item': url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faq,
    },
  ];
}

export default function GenrePage() {
  const { slug } = useParams<{ slug: string }>();
  const genre = GENRES.find((g) => g.slug === slug);

  const [sort, setSort] = useState<string>('popularity');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const browseParams = useMemo(() => ({
    genres: genre ? [genre.name] : [],
    sort,
  }), [genre, sort]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useBrowse(browseParams);

  const allAnime = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data]);

  const content = getGenreContent(genre?.slug || '');
  const genreDescription = buildDescription(
    `Watch ${genre?.name || ''} anime online free in HD on MikuAnime. ${content.intro.join(' ')} Browse top-rated and trending ${(genre?.name || '').toLowerCase()} series, from underrated gems to seasonal hits.`,
  );

  // Infinite scroll observer just like BrowsePage
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!genre) {
    return (
      <PageWrapper className="pt-24 pb-12 px-4">
        <SEO title="Genre Not Found" description="Browse all available anime genres on MikuAnime." noindex />
        <EmptyState
          icon={AlertCircle}
          title="Genre not found"
          message={`No genre found for "${slug}". Browse all available genres.`}
          actionLabel="Browse Anime"
          onAction={() => window.location.href = '/browse'}
        />
      </PageWrapper>
    );
  }

  if (isLoading && allAnime.length === 0) {
    return (
      <PageWrapper>
        <SEO title={`${genre.name} Anime`} description={genreDescription} noindex />
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <img src="/loader.gif" alt="Loading..." className="w-24 h-24 object-contain" />
          <p className="font-display text-base text-text-muted animate-pulse">Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <SEO
        title={`Watch ${genre.name} Anime Online — Top ${genre.name} Series`}
        description={genreDescription}
        canonical={`/genre/${genre.slug}`}
        keywords={[`${genre.name} anime`, 'anime streaming', 'HD anime']}
        schema={buildGenreSchema(genre.name, genre.slug)}
      />

      {/* Header matching SchedulePage style */}
      <div className="relative mb-8 px-4">
        <DotPattern opacity={0.3} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary ml-5 flex items-center gap-3">
            {(() => {
              const GenreIcon = getGenreIcon(genre.slug);
              return <GenreIcon className="w-8 h-8 text-accent-glow stroke-[1.5]" />;
            })()}
            {genre.name} Anime
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Controls Bar: Sort Selector */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-semibold text-lg text-text-primary">
              All {genre.name} Anime
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-glow border border-accent-primary/20 font-mono">
              {allAnime.length} loaded
            </span>
          </div>

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-card text-xs font-body font-medium transition-all duration-200 border bg-accent-primary/10 text-accent-glow border-accent-primary/30 hover:border-accent-primary/50"
            >
              <ArrowUpDown className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Sort:</span>
              <span>{SORT_OPTIONS.find((s) => s.value === sort)?.label || 'Popularity'}</span>
              <ChevronDown
                className={cn(
                  'w-3 h-3 stroke-[1.5] transition-transform duration-200 ml-0.5',
                  sortOpen && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-surface border border-border-subtle rounded-card shadow-xl overflow-hidden"
                >
                  <div className="py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSort(opt.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 text-xs font-body transition-colors text-left',
                          sort === opt.value
                            ? 'text-accent-glow bg-accent-primary/10 font-medium'
                            : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                        )}
                      >
                        <span>{opt.label}</span>
                        {sort === opt.value && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-glow" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Error Notification */}
        {isError && (
          <div className="p-6 rounded-card bg-accent-rose/5 border border-accent-rose/20 text-center mb-6">
            <p className="text-accent-rose text-sm font-body">
              {(error as Error)?.message || 'Failed to load anime. Please try again later.'}
            </p>
          </div>
        )}

        {/* Infinite Anime Grid */}
        <AnimeGrid anime={allAnime} isLoading={false} />

        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} className="h-6 mt-4" />

        {/* Loading Spinner for Next Pages */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-10 gap-2.5">
            <Loader2 className="w-5 h-5 text-accent-glow animate-spin stroke-[1.5]" />
            <span className="text-sm text-text-secondary font-body">
              Loading more anime...
            </span>
          </div>
        )}

        {/* End of List Message */}
        {!hasNextPage && !isLoading && allAnime.length > 0 && (
          <div className="text-center py-10 border-t border-border-subtle/60 mt-8">
            <p className="text-text-muted text-xs font-body">
              You've reached the end of all {genre.name} anime titles.
            </p>
          </div>
        )}
      </div>

      {/* FAQ for AI search readiness + structured answers */}
      <div className="max-w-3xl mx-auto px-4 mt-14">
        <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-accent-glow stroke-[1.5]" /> {genre.name} Anime FAQ
        </h2>
        <div className="divide-y divide-border-subtle/70">
          {content.faq.map((item) => (
            <div key={item.q} className="py-4">
              <h3 className="font-body font-semibold text-text-primary mb-1.5 text-base">{item.q}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
