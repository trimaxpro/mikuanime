import { apiClient } from './client';
import type { Anime } from '@/types/anime';
import type { PaginatedResponse } from '@/types/api';

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  genres?: string[];
  sort?: string;
}

export async function searchAnime(
  queryOrParams: string | SearchParams,
  page = 1
): Promise<PaginatedResponse<Anime>> {
  const params: Record<string, unknown> =
    typeof queryOrParams === 'string'
      ? { q: queryOrParams, page }
      : {
          q: queryOrParams.q || '',
          page: queryOrParams.page || page,
          limit: queryOrParams.limit,
          type: queryOrParams.type,
          status: queryOrParams.status,
          genres: queryOrParams.genres?.join(','),
          sort: queryOrParams.sort,
        };

  const { data } = await apiClient.get<PaginatedResponse<Anime>>('/search', {
    params,
  });
  return data;
}
