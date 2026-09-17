import type { Episode } from '@/types/anime';

/**
 * Returns the episodes that have actually aired.
 *
 * AniList only exposes a small window of scheduled episodes (for a long-running
 * show such as One Piece that is just the latest ~25), while the API pads the
 * list up to the total episode count with `aired: null`. In a linear series
 * every episode up to the highest aired number has aired, so those padded
 * entries must stay visible instead of being filtered out.
 */
export function getAiredEpisodes(episodes: Episode[] | undefined | null, isAiring?: boolean): Episode[] {
  if (!episodes) return [];
  if (!isAiring) return episodes;

  const highestAired = episodes.reduce((max, ep) => (ep.aired ? Math.max(max, ep.episode) : max), 0);

  if (highestAired === 0) {
    return episodes.filter((ep) => ep.aired !== null && ep.aired !== '');
  }

  return episodes.filter((ep) => (ep.aired !== null && ep.aired !== '') || ep.episode <= highestAired);
}
