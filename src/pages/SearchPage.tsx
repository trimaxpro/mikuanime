import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SearchBar } from '@/components/search/SearchBar';
import { AnimeGrid } from '@/components/browse/AnimeGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX, Search, Sparkles, Filter, Loader2, Compass } from 'lucide-react';
import { useInfiniteSearch } from '@/hooks/useSearch';
import { cn } from '@/utils/cn';

const POPULAR_SUGGESTIONS = [
  'Attack on Titan',
  'One Piece',
  'Solo Leveling',
  'Jujutsu Kaisen',
  'Frieren',
  'Demon Slayer',
  'Bleach',
  'Chainsaw Man',
  'Naruto',
  'Death Note',
  'Hunter x Hunter',
  'Fullmetal Alchemist',
];

const FORMAT_OPTIONS = [
  { label: 'All Formats', value: '' },
  { label: 'TV Series', value: 'tv' },
  { label: 'Movies', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'Special', value: 'special' },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Airing', value: 'airing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Upcoming', value: 'upcoming' },
];

const SORT_OPTIONS = [
  { label: 'Best Match', value: '' },
  { label: 'Highest Score', value: 'score' },
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Trending', value: 'trending' },
  { label: 'Newest', value: 'newest' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const searchConfig = useMemo(
    () => ({
      q: query,
      type: selectedFormat || undefined,
      status: selectedStatus || undefined,
      sort: selectedSort || undefined,
      limit: 30,
    }),
    [query, selectedFormat, selectedStatus, selectedSort],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteSearch(searchConfig);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const allAnime = useMemo(
    () => data?.pages.flatMap((p) => p.data) || [],
    [data],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSuggestionClick = (term: string) => {
    setSearchParams({ q: term });
  };

  const handleSearchSubmit = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };

  const clearFilters = () => {
    setSelectedFormat('');
    setSelectedStatus('');
    setSelectedSort('');
  };

  const hasActiveFilters = Boolean(selectedFormat || selectedStatus || selectedSort);

  return (
    <PageWrapper className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface/90 via-surface/60 to-surface/30 border border-border-subtle/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-glow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-glow text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Wide &amp; Unrestricted Search
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-text-primary tracking-tight">
              {query ? (
                <>
                  Results for <span className="text-accent-glow">"{query}"</span>
                </>
              ) : (
                <>
                  Find Any Anime <span className="text-accent-glow">Without Limits</span>
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
              Search by title, alternative names, Japanese romaji, characters, or numerical ID.
            </p>

            {/* Main Search Input */}
            <div className="pt-2">
              <SearchBar
                initialQuery={query}
                onSearchSubmit={handleSearchSubmit}
                placeholder="Search anime title, ID, or keywords..."
                className="max-w-2xl mx-auto"
              />
            </div>

            {/* Popular quick tags */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-text-muted font-medium mr-1">Trending:</span>
              {POPULAR_SUGGESTIONS.slice(0, 7).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-elevated/70 hover:bg-accent-primary/20 text-text-secondary hover:text-accent-glow border border-border-subtle/60 hover:border-accent-primary/30 transition-all duration-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                {query ? (
                  <Search className="w-4.5 h-4.5 text-accent-glow stroke-[1.8]" />
                ) : (
                  <Compass className="w-4.5 h-4.5 text-accent-glow stroke-[1.8]" />
                )}
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-text-primary">
                  {query ? `Matching Titles` : `Discover Anime`}
                </h2>
                <p className="text-xs text-text-muted">
                  {allAnime.length > 0 ? (
                    <>
                      <span className="font-semibold text-accent-glow">{allAnime.length}</span> titles loaded
                      {hasNextPage ? ' (scroll down to load more)' : ' (all matching titles loaded)'}
                    </>
                  ) : isLoading ? (
                    'Searching catalog...'
                  ) : (
                    'No results yet'
                  )}
                </p>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200',
                showFilters || hasActiveFilters
                  ? 'bg-accent-primary/15 text-accent-glow border-accent-primary/40 shadow-glow-sm'
                  : 'bg-surface/80 text-text-secondary hover:text-text-primary border-border-subtle hover:bg-elevated',
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-accent-glow animate-pulse" />
              )}
            </button>
          </div>

          {/* Collapsible Filter Bar */}
          {showFilters && (
            <div className="bg-surface/60 backdrop-blur-md border border-border-subtle/80 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {/* Format Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Format
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedFormat(opt.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        selectedFormat === opt.value
                          ? 'bg-accent-primary text-black font-semibold shadow-glow-sm'
                          : 'bg-elevated/70 text-text-secondary hover:text-text-primary hover:bg-elevated border border-border-subtle/50',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedStatus(opt.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        selectedStatus === opt.value
                          ? 'bg-accent-primary text-black font-semibold shadow-glow-sm'
                          : 'bg-elevated/70 text-text-secondary hover:text-text-primary hover:bg-elevated border border-border-subtle/50',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Sort By
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSort(opt.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        selectedSort === opt.value
                          ? 'bg-accent-primary text-black font-semibold shadow-glow-sm'
                          : 'bg-elevated/70 text-text-secondary hover:text-text-primary hover:bg-elevated border border-border-subtle/50',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="sm:col-span-3 flex justify-end pt-2 border-t border-border-subtle/50">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-text-muted hover:text-accent-glow underline"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Area */}
        {!isLoading && allAnime.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={SearchX}
              title="No anime found"
              message={
                query
                  ? `No titles found matching "${query}". Try different spellings or explore the popular suggestions below.`
                  : 'No anime matches your filter criteria. Try resetting filters.'
              }
            />
            <div className="mt-8 text-center">
              <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-3">
                Try searching one of these popular titles:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {POPULAR_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-elevated hover:bg-accent-primary/20 text-text-secondary hover:text-accent-glow border border-border-subtle hover:border-accent-primary/30 transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <AnimeGrid anime={allAnime} isLoading={isLoading && allAnime.length === 0} />

            {/* Infinite Scroll Sentinel & Loader */}
            <div ref={sentinelRef} className="py-8 flex justify-center items-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface/80 border border-border-subtle/80 shadow-glow-sm">
                  <Loader2 className="w-5 h-5 text-accent-glow animate-spin" />
                  <span className="text-sm font-medium text-text-secondary">
                    Loading more anime...
                  </span>
                </div>
              ) : hasNextPage ? (
                <span className="text-xs text-text-muted">Scroll down for more results</span>
              ) : allAnime.length > 0 ? (
                <div className="text-center py-4 border-t border-border-subtle/50 w-full">
                  <p className="text-sm text-text-muted">
                    ✨ You've reached the end of all matching results ({allAnime.length} titles).
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
