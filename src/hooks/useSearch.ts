import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { searchAnime, type SearchParams } from '@/api/search';
import type { Anime } from '@/types/anime';
import type { PaginatedResponse } from '@/types/api';

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => searchAnime(query, page),
    staleTime: 2 * 60 * 1000,
    enabled: !!query.trim(),
    retry: 2,
  });
}

export function useInfiniteSearch(params: string | SearchParams) {
  const resolvedParams: SearchParams = typeof params === 'string' ? { q: params } : params;

  return useInfiniteQuery<PaginatedResponse<Anime>>({
    queryKey: ['infinite-search', resolvedParams],
    queryFn: ({ pageParam = 1 }) =>
      searchAnime({
        ...resolvedParams,
        page: pageParam as number,
        limit: resolvedParams.limit || 30,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.has_next_page
        ? (lastPage.pagination.current_page || 1) + 1
        : undefined,
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}
