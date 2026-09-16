import { Star, Play, BookmarkPlus, Eye, CheckCircle, List, Clock, Trash2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DotPattern } from '@/components/ui/DotPattern';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { cn } from '@/utils/cn';
import type { Anime } from '@/types/anime';
import type { WatchlistStatus } from '@/types/user';
import { useState } from 'react';

const STATUS_OPTIONS: { value: WatchlistStatus; label: string; icon: typeof Eye }[] = [
  { value: 'watching', label: 'Watching', icon: Eye },
  { value: 'plan_to_watch', label: 'Plan to Watch', icon: Star },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'dropped', label: 'Dropped', icon: List },
  { value: 'on_hold', label: 'On Hold', icon: Clock },
];

interface AnimeHeroProps {
  anime: Anime;
}

export function AnimeHero({ anime }: AnimeHeroProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { watchHistory } = useWatchHistory();
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentEntry = watchlist.find((w) => w.malId === anime.mal_id);
  const currentStatus = currentEntry?.status;
  const imageUrl = anime.banner_image || anime.images.webp?.large_image_url || anime.images.jpg?.large_image_url;
  const posterUrl = anime.images.webp?.image_url || anime.images.jpg?.image_url;

  return (
    <div className="relative grain-overlay">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center blur-lg scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/90 to-void/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/50" />
        <DotPattern opacity={0.3} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="w-[200px] md:w-[240px] aspect-[3/4] rounded-card overflow-hidden border-2 border-border-glow shadow-glow">
              <img src={posterUrl} alt={anime.title} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-3xl md:text-5xl text-text-primary leading-tight mb-1">
              {anime.title_english || anime.title}
            </h1>
            {anime.title_japanese && (
              <p className="text-text-muted text-base mb-4">{anime.title_japanese}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {anime.score && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent-amber fill-accent-amber stroke-[1.5]" />
                  <span className="font-mono font-medium text-accent-amber">{anime.score.toFixed(1)}</span>
                </div>
              )}
              {anime.rank && <Badge variant="violet">Rank #{anime.rank}</Badge>}
              {anime.episodes && <Badge>{anime.episodes} Episodes</Badge>}
              {anime.status && <Badge variant={['Currently Airing', 'Airing'].includes(anime.status) ? 'rose' : 'default'}>{anime.status}</Badge>}
              {anime.season && anime.year && <Badge>{anime.season} {anime.year}</Badge>}
              {anime.synopsis && <Badge>Summary</Badge>}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((g) => (
                <Badge key={g.name} variant="violet">{g.name}</Badge>
              ))}
            </div>

            {anime.synopsis && (
              <div className="mb-6 max-w-2xl">
                <p className={`text-text-secondary text-sm leading-relaxed ${!synopsisExpanded ? 'line-clamp-4' : ''}`}>
                  {anime.synopsis}
                </p>
                <button
                  onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                  className="text-accent-glow text-sm mt-1 hover:underline"
                >
                  {synopsisExpanded ? 'Show Less' : 'Read More'}
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {(() => {
                const lastWatched = watchHistory.find((h) => h.malId === anime.mal_id);
                const nextEpisode = lastWatched ? lastWatched.episode : 1;
                return (
                  <Link to={`/watch/${anime.mal_id}/${nextEpisode}`}>
                    <Button variant="primary" size="md">
                      <Play className="w-4 h-4 fill-white" />
                      {lastWatched ? `Resume Ep. ${nextEpisode}` : 'Watch Now'}
                    </Button>
                  </Link>
                );
              })()}
              <div className="relative w-36">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 w-full whitespace-nowrap"
                >
                  {(() => {
                    if (!currentStatus) {
                      return (
                        <>
                          <BookmarkPlus className="w-6 h-6" />
                          <span>Add to List</span>
                        </>
                      );
                    }
                    const option = STATUS_OPTIONS.find((o) => o.value === currentStatus);
                    if (option) {
                      const Icon = option.icon;
                      return (
                        <>
                          <Icon className="w-6 h-6 text-accent-glow" />
                          <span>{option.label}</span>
                        </>
                      );
                    }
                    return (
                      <>
                        <BookmarkPlus className="w-6 h-6" />
                        <span>In List</span>
                      </>
                    );
                  })()}
                  <ChevronDown className="w-5 h-5 ml-auto text-white transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </Button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute left-0 mt-2 w-full bg-surface rounded-card p-2 z-40 shadow-xl border border-border-subtle animate-fade-in">
                      {STATUS_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              addToWatchlist({
                                malId: anime.mal_id,
                                title: anime.title_english || anime.title,
                                image: anime.images.jpg?.image_url || '',
                                status: option.value,
                              });
                              setDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-input text-sm text-left transition-colors",
                              currentStatus === option.value
                                ? "bg-accent-primary/20 text-accent-glow font-medium"
                                : "text-text-secondary hover:text-text-primary hover:bg-elevated"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                      {currentStatus && (
                        <button
                          onClick={() => {
                            removeFromWatchlist(anime.mal_id);
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-input text-sm text-left text-accent-rose hover:bg-accent-rose/10 transition-colors mt-1 border-t border-border-subtle pt-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove from List</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
