import { useState } from 'react';
import { ChevronLeft, ChevronRight, BookmarkPlus, Calendar, Film, ChevronDown, ChevronUp, Star, Eye, CheckCircle, List, Clock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { Episode } from '@/types/anime';
import type { WatchlistStatus } from '@/types/user';
import { cn } from '@/utils/cn';

const STATUS_OPTIONS: { value: WatchlistStatus; label: string; icon: typeof Eye }[] = [
  { value: 'watching', label: 'Watching', icon: Eye },
  { value: 'plan_to_watch', label: 'Plan to Watch', icon: Star },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'dropped', label: 'Dropped', icon: List },
  { value: 'on_hold', label: 'On Hold', icon: Clock },
];

interface WatchInfoProps {
  animeId: number;
  animeTitle: string;
  animeImage: string;
  episode: Episode;
  totalEpisodes: number;
  currentEpisode: number;
  maxEpisode?: number;
  description: string | null;
}

export function WatchInfo({ animeId, animeTitle, animeImage, episode, totalEpisodes, currentEpisode, maxEpisode, description }: WatchInfoProps) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [descExpanded, setDescExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const hasPrev = currentEpisode > 1;
  const navMax = maxEpisode ?? totalEpisodes;
  const hasNext = currentEpisode < navMax;
  const currentEntry = watchlist.find((w) => w.malId === animeId);
  const currentStatus = currentEntry?.status;
  const descTruncated = description && description.length > 280;

  return (
    <div className="mt-4 space-y-6">
      {/* Episode title + metadata */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary leading-tight mb-3">
          {episode.title || `Episode ${episode.episode}`}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-muted mb-6">
          <span className="flex items-center gap-1.5">
            <Film className="w-4 h-4 stroke-[1.5]" />
            EP {currentEpisode}/{totalEpisodes}
          </span>
          {episode.aired && (
            <>
              <span className="text-border-subtle">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 stroke-[1.5]" />
                {new Date(episode.aired).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </>
          )}
          <span className="text-border-subtle">•</span>
          <div className="inline-block relative w-36">
            <Button
              variant={currentStatus ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 w-full whitespace-nowrap"
            >
              {(() => {
                if (!currentStatus) {
                  return (
                    <>
                      <BookmarkPlus className="w-5 h-5 stroke-[1.5]" />
                      <span>Add to List</span>
                    </>
                  );
                }
                const option = STATUS_OPTIONS.find((o) => o.value === currentStatus);
                if (option) {
                  const Icon = option.icon;
                  return (
                    <>
                      <Icon className="w-5 h-5 text-accent-glow stroke-[1.5]" />
                      <span>{option.label}</span>
                    </>
                  );
                }
                return (
                  <>
                    <BookmarkPlus className="w-5 h-5 stroke-[1.5]" />
                    <span>In List</span>
                  </>
                );
              })()}
              <ChevronDown className="w-5 h-5 ml-auto text-white transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </Button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <div className="absolute left-0 mt-2 w-full bg-surface rounded-card p-1.5 z-40 shadow-xl border border-border-subtle animate-fade-in">
                  {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          addToWatchlist({
                            malId: animeId,
                            title: animeTitle,
                            image: animeImage,
                            status: option.value,
                          });
                          setDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-input text-xs text-left transition-colors",
                          currentStatus === option.value
                            ? "bg-accent-primary/20 text-accent-glow font-medium"
                            : "text-text-secondary hover:text-text-primary hover:bg-elevated"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                  {currentStatus && (
                    <button
                      onClick={() => {
                        removeFromWatchlist(animeId);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-input text-xs text-left text-accent-rose hover:bg-accent-rose/10 transition-colors mt-1 border-t border-border-subtle pt-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Remove from List</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex items-center gap-3">
        {hasPrev ? (
          <Link to={`/watch/${animeId}/${currentEpisode - 1}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-elevated border border-border-subtle text-sm text-text-secondary hover:border-border-glow hover:text-text-primary transition-all"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-elevated/50 text-sm text-text-muted cursor-not-allowed">
            <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            Previous
          </span>
        )}
        <div className="flex-1 h-px bg-border-subtle" />
        {hasNext ? (
          <Link to={`/watch/${animeId}/${currentEpisode + 1}`}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-card bg-accent-primary text-sm text-white hover:bg-accent-glow transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4 stroke-[1.5]" />
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-card bg-elevated/50 text-sm text-text-muted cursor-not-allowed">
            Next
            <ChevronRight className="w-4 h-4 stroke-[1.5]" />
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="border-t border-border-subtle pt-4">
          <h2 className="font-display font-semibold text-base text-text-primary mb-2">Description</h2>
          <div className="relative">
            <p className={`text-sm text-text-secondary leading-relaxed ${!descExpanded && descTruncated ? 'line-clamp-4' : ''}`}>
              {description}
            </p>
            {descTruncated && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="flex items-center gap-1 text-sm text-accent-glow hover:underline mt-1"
              >
                {descExpanded ? <ChevronUp className="w-3.5 h-3.5 stroke-[1.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />}
                {descExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
