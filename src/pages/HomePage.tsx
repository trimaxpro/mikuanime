import { useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueWatching } from '@/components/home/ContinueWatching';
import { TrendingRow } from '@/components/home/TrendingRow';
import { SeasonalGrid } from '@/components/home/SeasonalGrid';
import { GenreQuickNav } from '@/components/home/GenreQuickNav';
import { SEO, DEFAULT_DESCRIPTION } from '@/components/common/SEO';
import { useTrending, useSeasonal, useUpcoming, useTop, useBrowse } from '@/hooks/useAnime';
import type { Anime } from '@/types/anime';

const HOME_KEYWORDS = ['watch anime online', 'free anime streaming', 'subbed anime', 'dubbed anime', 'anime schedule'];

function buildHomeSchema(trending: Anime[]): Record<string, unknown>[] {
  const graph: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://www.mikuanime.site/#website',
      'name': 'MikuAnime',
      'url': 'https://www.mikuanime.site/',
      'publisher': { '@id': 'https://www.mikuanime.site/#organization' },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': { '@type': 'EntryPoint', 'urlTemplate': 'https://www.mikuanime.site/search?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://www.mikuanime.site/#organization',
      'name': 'MikuAnime',
      'url': 'https://www.mikuanime.site/',
      'logo': 'https://www.mikuanime.site/og-image.png',
      'description': 'MikuAnime is a free anime streaming and discovery platform for watching subbed and dubbed anime online in HD.',
      'sameAs': ['https://twitter.com/MikuAnime'],
    },
  ];

  const items = Array.isArray(trending) ? trending.slice(0, 10) : [];
  if (items.length > 0) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'Trending Anime on MikuAnime',
      'itemListElement': items.map((a, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'url': `https://www.mikuanime.site/anime/${a.mal_id}`,
      })),
    });
  }

  return graph;
}

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
      <SEO
        title="Watch Anime Online in HD for Free — MikuAnime"
        description={DEFAULT_DESCRIPTION}
        keywords={HOME_KEYWORDS}
        schema={buildHomeSchema(trending.data || [])}
      />
      <h1 className="sr-only">Watch Anime Online Free in HD on MikuAnime</h1>
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
