import { useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueWatching } from '@/components/home/ContinueWatching';
import { TrendingRow } from '@/components/home/TrendingRow';
import { SeasonalGrid } from '@/components/home/SeasonalGrid';
import { GenreQuickNav } from '@/components/home/GenreQuickNav';
import { useTrending, useSeasonal, useUpcoming, useTop, useBrowse } from '@/hooks/useAnime';
import type { Anime } from '@/types/anime';

// Stable static filter references to avoid re-triggering query hook evaluations on each render
const MOVIES_PARAMS = { type: 'movie' as const, sort: 'trending' as const };
const ISEKAI_PARAMS = { tags: ['Isekai'], sort: 'trending' as const };
const ECCHI_PARAMS = { genres: ['Ecchi'], sort: 'trending' as const };

export default function HomePage() {
  const trending = useTrending();
  const seasonal = useSeasonal();
  const top = useTop();
  const upcoming = useUpcoming();

  const movies = useBrowse(MOVIES_PARAMS);
  const isekai = useBrowse(ISEKAI_PARAMS);
  const ecchi = useBrowse(ECCHI_PARAMS);

  // Memoize all deduplicated rows to prevent expensive flatMap and Set filtering on every render
  const rows = useMemo(() => {
    const seen = new Set<number>();
    const dedup = (arr: Anime[]) =>
      arr.filter((a) => {
        if (!a || seen.has(a.mal_id)) return false;
        seen.add(a.mal_id);
        return true;
      });

    return {
      trendingNow: dedup(trending.data || []),
      seasonal: dedup(seasonal.data || []),
      top: dedup(top.data || []),
      upcoming: dedup(upcoming.data || []),
      movies: dedup(movies.data?.pages.flatMap((p) => p.data) || []),
      isekai: dedup(isekai.data?.pages.flatMap((p) => p.data) || []),
      ecchi: dedup(ecchi.data?.pages.flatMap((p) => p.data) || []),
    };
  }, [
    trending.data,
    seasonal.data,
    top.data,
    upcoming.data,
    movies.data,
    isekai.data,
    ecchi.data,
  ]);

  const fetchNextMovies = useCallback(() => {
    if (movies.hasNextPage) movies.fetchNextPage();
  }, [movies]);

  const fetchNextIsekai = useCallback(() => {
    if (isekai.hasNextPage) isekai.fetchNextPage();
  }, [isekai]);

  const fetchNextEcchi = useCallback(() => {
    if (ecchi.hasNextPage) ecchi.fetchNextPage();
  }, [ecchi]);

  return (
    <PageWrapper>
      <HeroSection anime={trending.data || []} isLoading={trending.isLoading} />
      <ContinueWatching />
      <TrendingRow title="Trending Now" anime={rows.trendingNow} isLoading={trending.isLoading} />
      <SeasonalGrid title="This Season" anime={rows.seasonal} isLoading={seasonal.isLoading} />
      <TrendingRow title="Top Rated" anime={rows.top} isLoading={top.isLoading} showRank />
      <TrendingRow title="Upcoming" anime={rows.upcoming} isLoading={upcoming.isLoading} />
      <TrendingRow
        title="Anime Movies"
        anime={rows.movies}
        isLoading={movies.isLoading}
        fetchNext={movies.hasNextPage ? fetchNextMovies : undefined}
      />
      <TrendingRow
        title="Isekai Anime"
        anime={rows.isekai}
        isLoading={isekai.isLoading}
        fetchNext={isekai.hasNextPage ? fetchNextIsekai : undefined}
      />
      <TrendingRow
        title="Ecchi Anime"
        anime={rows.ecchi}
        isLoading={ecchi.isLoading}
        fetchNext={ecchi.hasNextPage ? fetchNextEcchi : undefined}
      />
      <GenreQuickNav />
    </PageWrapper>
  );
}
