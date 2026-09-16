import { useState, memo } from 'react';
import { Play, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Badge } from './Badge';
import type { Anime } from '@/types/anime';

interface AnimeCardProps {
  anime: Anime;
  onAddToWatchlist?: (malId: number) => void;
  className?: string;
}

function AnimeCardInner({ anime, onAddToWatchlist, className }: AnimeCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = anime.images.webp?.image_url || anime.images.jpg?.image_url;
  const scoreColor = anime.score && anime.score >= 8 ? 'amber' : anime.score && anime.score >= 6 ? 'default' : 'rose';

  return (
    <div className={cn('group relative flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-0.5', className)}>
      <Link to={`/anime/${anime.mal_id}`} className="block relative aspect-[3/4] rounded-card overflow-hidden bg-elevated ring-0 transition-all duration-200 group-hover:ring-1 group-hover:ring-accent-primary/30 group-hover:shadow-glow-sm">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={anime.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-elevated dot-pattern">
            <Play className="w-8 h-8 text-text-muted stroke-[1.5]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-accent-primary/90 flex items-center justify-center shadow-glow scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 text-white fill-white stroke-[1.5]" />
          </div>
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {anime.type && <Badge>{anime.type}</Badge>}
          {anime.status === 'Currently Airing' && <Badge>Airing</Badge>}
        </div>

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.preventDefault(); onAddToWatchlist?.(anime.mal_id); }}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-accent-primary/30 transition-colors"
            aria-label="Add to watchlist"
          >
            <Plus className="w-4 h-4 text-text-primary stroke-[1.5]" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-xs text-text-secondary">
          {(anime.episodes || anime.airing_episode) && (
            <span>{anime.episodes || anime.airing_episode} eps</span>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <h3 className="font-display font-semibold text-sm text-text-primary line-clamp-2 leading-tight group-hover:text-accent-glow transition-colors duration-200">
          <Link to={`/anime/${anime.mal_id}`}>
            {anime.title_english || anime.title}
          </Link>
        </h3>
        <div className="flex items-center gap-2">
          {anime.score && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-accent-amber fill-accent-amber stroke-[1.5]" />
              <span className={cn('text-xs font-mono font-medium', {
                'text-accent-amber': scoreColor === 'amber',
                'text-text-secondary': scoreColor === 'default',
                'text-accent-rose': scoreColor === 'rose',
              })}>
                {anime.score.toFixed(1)}
              </span>
            </div>
          )}
          {anime.season && anime.year && (
            <span className="text-xs text-text-muted">{anime.season} {anime.year}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export const AnimeCard = memo(AnimeCardInner);
