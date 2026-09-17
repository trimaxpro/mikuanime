import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SearchBar } from '@/components/search/SearchBar';
import { AnimeGrid } from '@/components/browse/AnimeGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { SEO } from '@/components/common/SEO';
import { SearchX, Search, Filter, Loader2 } from 'lucide-react';
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

  const filterOptions = [
    { label: 'Format', options: FORMAT_OPTIONS, selected: selectedFormat, set: setSelectedFormat },
    { label: 'Status', options: STATUS_OPTIONS, selected: selectedStatus, set: setSelectedStatus },
    { label: 'Sort By', options: SORT_OPTIONS, selected: selectedSort, set: setSelectedSort },
  ];

  return (
    <PageWrapper className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <SEO
        title={query ? `Search "${query}"` : 'Search Anime by Title, Romaji or ID'}
        description={query
          ? `Search results for "${query}" across the MikuAnime catalog. Stream subbed and dubbed anime online in HD, filter by format, status and score.`
          : 'Search the MikuAnime catalog by English title, Japanese romaji, keyword or MyAnimeList ID, then stream any match instantly in HD.'}
        canonical={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
        noindex={!query}
      />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search */}
        <div className="mx-auto max-w-2xl space-y-3">
          <h1 className="text-center font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
            {query ? (
              <>
                Results for <span className="text-accent-glow">"{query}"</span>
              </>
            ) : (
              'Search Anime'
            )}
          </h1>
          <SearchBar
            initialQuery={query}
            onSearchSubmit={handleSearchSubmit}
            placeholder="Search by title, romaji, character or ID..."
          />
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {POPULAR_SUGGESTIONS.slice(0, 6).map((item) => (
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

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/70 pb-3">
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            <Search className="w-4 h-4 text-accent-glow stroke-[1.8]" />
            {allAnime.length > 0 ? (
              <>
                <span className="font-semibold text-text-primary">{allAnime.length}</span>
                {hasNextPage ? '+' : ''} {query ? 'matching' : ''} titles
              </>
            ) : isLoading ? (
              'Searching...'
            ) : (
              'No results'
            )}
          </p>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
              showFilters || hasActiveFilters
                ? 'bg-accent-primary/15 text-accent-glow border-accent-primary/40 shadow-glow-sm'
                : 'bg-surface/80 text-text-secondary hover:text-text-primary border-border-subtle hover:bg-elevated',
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent-glow" />}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-surface/60 backdrop-blur-md border border-border-subtle/80 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {filterOptions.map((group) => (
              <div key={group.label}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  {group.label}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {group.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => group.set(opt.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        group.selected === opt.value
                          ? 'bg-accent-primary text-black font-semibold shadow-glow-sm'
                          : 'bg-elevated/70 text-text-secondary hover:text-text-primary hover:bg-elevated border border-border-subtle/50',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

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

        {/* Results */}
        {!isLoading && allAnime.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={SearchX}
              title="No anime found"
              message={
                query
                  ? `No titles found matching "${query}". Try a different spelling or pick one of the suggestions above.`
                  : 'No anime matches your filters. Try resetting them.'
              }
            />
          </div>
        ) : (
          <>
            <AnimeGrid anime={allAnime} isLoading={isLoading && allAnime.length === 0} />

            <div ref={sentinelRef} className="py-8 flex justify-center items-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface/80 border border-border-subtle/80 shadow-glow-sm">
                  <Loader2 className="w-5 h-5 text-accent-glow animate-spin" />
                  <span className="text-sm font-medium text-text-secondary">Loading more...</span>
                </div>
              ) : hasNextPage ? (
                <span className="text-xs text-text-muted">Scroll for more</span>
              ) : null}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
