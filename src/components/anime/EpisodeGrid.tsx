import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EpisodeSkeleton } from '@/components/ui/Skeleton';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import type { Episode } from '@/types/anime';

interface EpisodeGridProps {
  animeId: number;
  animeTitle?: string;
  episodes: Episode[];
  isLoading: boolean;
  posterImage?: string;
  isAiring?: boolean;
}

export function EpisodeGrid({ animeId, animeTitle, episodes, isLoading, posterImage, isAiring }: EpisodeGridProps) {
  const { getProgress } = useWatchHistory();

  const visibleEpisodes = useMemo(() => {
    if (!isAiring) return episodes;
    return episodes.filter((ep) => ep.aired !== null && ep.aired !== '');
  }, [episodes, isAiring]);

  if (isLoading) {
    return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <EpisodeSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (visibleEpisodes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {visibleEpisodes.map((ep) => {
        const progress = getProgress(animeId, ep.episode);
        const watched = progress > 0.9;

        return (
          <Link
            key={ep.mal_id}
            to={`/watch/${animeId}/${ep.episode}`}
            className="group flex flex-col rounded-card overflow-hidden bg-elevated border border-border-subtle hover:border-border-glow hover:shadow-glow-sm transition-all duration-200"
          >
            <div className="relative aspect-video overflow-hidden bg-elevated">
              {posterImage && (
                <img
                  src={posterImage}
                  alt={animeTitle ? `${animeTitle} episode ${ep.episode}` : `Anime episode ${ep.episode} thumbnail`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-void/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-accent-primary/90 flex items-center justify-center shadow-glow">
                  <Play className="w-4 h-4 text-white fill-white stroke-[1.5]" />
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-void/70 backdrop-blur-sm text-text-primary">
                  EP {ep.episode}
                </span>
              </div>
              {watched && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-green-400 stroke-[1.5]" />
                </div>
              )}
              {progress > 0 && progress <= 0.9 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-elevated">
                  <div className="h-full bg-accent-primary rounded-full" style={{ width: `${progress * 100}%` }} />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 p-2.5 flex-1 min-w-0">
              <p className="text-xs text-text-primary line-clamp-2 leading-snug font-medium">
                {ep.title || `Episode ${ep.episode}`}
              </p>
              <div className="flex items-center gap-2 mt-auto">
                {ep.aired && (
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 stroke-[1.5]" />
                    {new Date(ep.aired).toLocaleDateString()}
                  </span>
                )}
                {ep.filler && <Badge variant="amber">Filler</Badge>}
                {ep.recap && <Badge variant="default">Recap</Badge>}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
