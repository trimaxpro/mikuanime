import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Compass, SlidersHorizontal, Loader2 } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnimeGrid } from '@/components/browse/AnimeGrid';
import { FilterBar, type FilterState } from '@/components/browse/FilterBar';
import { useBrowse } from '@/hooks/useAnime';

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({
    type: 'TV', status: null, season: null, year: null, genres: [], sort: 'score',
  });

  const browseParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.season) params.season = filters.season;
    if (filters.year) params.year = filters.year;
    if (filters.genres.length > 0) params.genres = filters.genres;
    params.sort = filters.sort;
    return params;
  }, [filters]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useBrowse(browseParams as Parameters<typeof useBrowse>[0]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allAnime = useMemo(() => data?.pages.flatMap((p) => p.data) || [], [data]);
  const totalResults = useMemo(() => {
    return data?.pages[0]?.pagination?.per_page
      ? data.pages.length * data.pages[0].pagination.per_page
      : undefined;
  }, [data]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  if (isLoading && !allAnime.length) {
    return (
      <PageWrapper>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <img src="/loader.gif" alt="Loading..." className="w-24 h-24 object-contain" />
          <p className="font-display text-base text-text-muted animate-pulse">Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-card bg-surface/60 flex items-center justify-center border border-border-subtle text-text-primary">
            <Compass className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
              Browse <span className="text-accent-glow">Anime</span>
            </h1>
            <p className="text-text-secondary text-sm font-body mt-0.5">
              Discover your next favorite series
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-card bg-surface/60 border border-border-subtle backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-text-secondary">
            <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
            <span className="text-xs font-body font-medium uppercase tracking-wider">Filters</span>
          </div>
          <FilterBar filters={filters} onChange={handleFilterChange} totalResults={totalResults} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-2">
        {isError && (
          <div className="p-6 rounded-card bg-accent-rose/5 border border-accent-rose/20 text-center">
            <p className="text-accent-rose text-sm font-body">{(error as Error)?.message || 'Failed to load anime'}</p>
          </div>
        )}

        <AnimeGrid anime={allAnime} isLoading={false} />

        <div ref={sentinelRef} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-accent-glow animate-spin stroke-[1.5]" />
            <span className="ml-2 text-sm text-text-secondary font-body">Loading more...</span>
          </div>
        )}

        {!hasNextPage && !isLoading && allAnime.length > 0 && (
          <p className="text-center text-text-muted text-xs font-body py-6">You've reached the end</p>
        )}
      </div>
    </PageWrapper>
  );
}
