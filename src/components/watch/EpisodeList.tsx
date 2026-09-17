import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { getAiredEpisodes } from '@/utils/episodes';
import type { Episode } from '@/types/anime';

interface EpisodeListProps {
  animeId: number;
  episodes: Episode[];
  currentEpisode: number;
  isAiring?: boolean;
}

export function EpisodeList({ animeId, episodes, currentEpisode, isAiring }: EpisodeListProps) {
  const visibleEpisodes = useMemo(() => getAiredEpisodes(episodes, isAiring), [episodes, isAiring]);

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1">
        {visibleEpisodes.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">
            No episodes have aired yet
          </div>
        )}
        {visibleEpisodes.map((ep) => {
          const isCurrent = ep.episode === currentEpisode;

          return (
            <Link
              key={ep.mal_id}
              to={`/watch/${animeId}/${ep.episode}`}
              className={cn(
                'group flex items-center gap-3 p-2.5 rounded-card transition-all duration-200',
                isCurrent
                  ? 'bg-accent-primary/15 border border-accent-primary/30'
                  : 'hover:bg-elevated border border-transparent',
              )}
            >
              <span className={cn(
                'w-8 flex items-center justify-center flex-shrink-0 font-display text-sm font-semibold transition-colors duration-200',
                isCurrent ? 'text-accent-glow text-base' : 'text-accent-primary/80 group-hover:text-accent-glow'
              )}>
                {ep.episode}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className={cn('text-sm line-clamp-1', isCurrent ? 'text-text-primary font-medium' : 'text-text-secondary')}>
                  {ep.title || `Episode ${ep.episode}`}
                </span>
                {ep.filler && <Badge variant="amber">Filler</Badge>}
              </div>
              <Play className={cn('w-3.5 h-3.5 flex-shrink-0 stroke-[1.5]', isCurrent ? 'text-accent-glow' : 'text-text-muted')} />
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}
