import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { BookmarkPlus, CalendarDays, Clock, Tv, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { apiClient } from '@/api/client';
import type { Anime } from '@/types/anime';
import { DAYS } from '@/utils/constants';

function getToday(): string {
  return DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(getToday());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['schedule', activeDay],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Anime[] }>(`/schedule/${activeDay}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <img src="/loader.gif" alt="Loading..." className="w-24 h-24 object-contain" />
          <p className="font-display text-base text-text-muted animate-pulse">Loading...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pt-24 pb-12">
      <div className="relative mb-8 px-4">
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary ml-5 flex items-center gap-3"><CalendarDays className="w-8 h-8 text-accent-glow stroke-[1.5]" /> Airing Schedule</h1>
          <p className="text-text-secondary text-sm mt-1 ml-5 flex items-center gap-1.5"><Radio className="w-4 h-4 text-accent-glow stroke-[1.5]" /> Stay up to date with your favorite shows</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                'px-4 py-2 rounded-card text-sm font-body font-medium transition-all flex-shrink-0',
                activeDay === day
                  ? 'bg-accent-primary text-white shadow-glow-sm'
                  : 'bg-elevated text-text-secondary border border-border-subtle hover:border-border-glow',
              )}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isError
            ? <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-text-muted text-sm mb-3">Failed to load schedule. The API may be rate-limited.</p><button onClick={() => refetch()} className="px-4 py-2 rounded-card bg-accent-primary text-white text-sm hover:bg-accent-glow transition-colors">Retry</button></div>
            : !data || data.length === 0
              ? <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-text-muted text-sm">No shows scheduled for this day.</p></div>
              : data.map((anime) => (
                  <div key={anime.mal_id} className="glass-card rounded-card p-4 flex items-center gap-4">
                    <Link to={`/anime/${anime.mal_id}`} className="flex-shrink-0">
                      <img
                        src={anime.images.jpg?.image_url}
                        alt={anime.title}
                        className="w-12 h-16 rounded-card object-cover hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/anime/${anime.mal_id}`} className="text-sm font-medium text-text-primary hover:text-accent-glow transition-colors line-clamp-1">
                        {anime.title_english || anime.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {anime.airing_episode && <span className="text-xs text-accent-glow font-medium flex items-center gap-1"><Radio className="w-3 h-3 stroke-[1.5]" /> Ep {anime.airing_episode}{anime.episodes ? `/${anime.episodes}` : ''}</span>}
                        {anime.next_airing && <span className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3 stroke-[1.5]" /> {new Date(anime.next_airing).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {anime.broadcast?.time || ''}</span>}
                        {anime.next_airing && <CountdownTimer targetDate={anime.next_airing} />}
                        {anime.type && <span className="text-xs text-text-muted flex items-center gap-1"><Tv className="w-3 h-3 stroke-[1.5]" /> {anime.type}</span>}
                        {anime.genres[0] && <Badge variant="violet" className="text-[10px]">{anime.genres[0].name}</Badge>}
                      </div>
                    </div>
                    <Link to={`/anime/${anime.mal_id}`}>
                      <Button variant="ghost" size="sm">
                        <BookmarkPlus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
        </div>
      </div>
    </PageWrapper>
  );
}
