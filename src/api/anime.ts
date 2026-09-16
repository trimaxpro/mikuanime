import { apiClient } from './client';
import type { Anime, Character, Episode } from '@/types/anime';

export async function getTrending(): Promise<Anime[]> {
  const { data } = await apiClient.get<{ data: Anime[] }>('/anime/trending');
  return data.data;
}

export async function getSeasonal(): Promise<Anime[]> {
  const { data } = await apiClient.get<{ data: Anime[] }>('/anime/seasonal');
  return data.data;
}

export async function getUpcoming(): Promise<Anime[]> {
  const { data } = await apiClient.get<{ data: Anime[] }>('/anime/upcoming');
  return data.data;
}

export async function getTop(): Promise<Anime[]> {
  const { data } = await apiClient.get<{ data: Anime[] }>('/anime/top');
  return data.data;
}

export async function getAnimeDetail(id: number): Promise<Anime & { characters: Character[] }> {
  const { data } = await apiClient.get<Anime & { characters: Character[] }>(`/anime/${id}`);
  return data;
}

export async function getAnimeEpisodes(id: number): Promise<Episode[]> {
  const { data } = await apiClient.get<{ data: Episode[] }>(`/anime/${id}/episodes`);
  return data.data;
}

export async function getSkipTimes(malId: number, episode: number) {
  try {
    const { data } = await apiClient.get(`/anime/${malId}/episodes/${episode}/skiptimes`);
    return data;
  } catch {
    return [];
  }
}

export async function getTrendingNow(): Promise<Anime[]> {
  const { data } = await apiClient.get<BrowseResult>('/browse?sort=trending&perPage=20');
  return data.data;
}

export async function getRecommendations(id: number): Promise<Anime[]> {
  const { data } = await apiClient.get<{ data: { entry: Anime }[] }>(`/anime/${id}/recommendations`);
  return data.data?.map((r: { entry: Anime }) => r.entry) || [];
}

export interface BrowseParams {
  type?: string;
  status?: string;
  season?: string;
  year?: string;
  score?: string;
  genres?: string[];
  tags?: string[];
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface BrowseResult {
  data: Anime[];
  pagination: {
    has_next_page: boolean;
    current_page: number;
    per_page: number;
  };
}

export async function getBrowse(params: BrowseParams): Promise<BrowseResult> {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.status) query.set('status', params.status);
  if (params.season) query.set('season', params.season);
  if (params.year) query.set('year', params.year);
  if (params.score) query.set('score', params.score);
  if (params.genres?.length) query.set('genres', params.genres.join(','));
  if (params.tags?.length) query.set('tags', params.tags.join(','));
  if (params.sort) {
    const sortMap: Record<string, string> = { popularity: 'popularity', score: 'score', start_date: 'start_date', title: 'title', trending: 'trending', favourites: 'favourites' };
    query.set('sort', sortMap[params.sort] || 'popularity');
  }
  query.set('page', String(params.page || 1));
  query.set('perPage', String(params.perPage || 25));
  const { data } = await apiClient.get<BrowseResult>(`/browse?${query.toString()}`);
  return data;
}

