import { Flame, TrendingUp, Star } from 'lucide-react';
import { AnimeCard } from '@/components/ui/AnimeCard';
import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { Anime } from '@/types/anime';

interface TrendingRowProps {
  title: string;
  anime: Anime[];
  isLoading: boolean;
  showRank?: boolean;
  fetchNext?: () => void;
}

const titleIcons: Record<string, typeof Flame> = {
  'Trending': Flame, 'Popular': TrendingUp, 'Upcoming': Star,
};

export function TrendingRow({ title, anime, isLoading, showRank = false, fetchNext }: TrendingRowProps) {
  const { toggleWatchlist } = useWatchlist();
  const TitleIcon = Object.entries(titleIcons).find(([k]) => title.includes(k))?.[1] || TrendingUp;

  return (
    <section className="pt-2 pb-2.5 px-4 max-w-7xl mx-auto">
      <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-2.5 flex items-center gap-2"><TitleIcon className="w-5 h-5 text-accent-glow stroke-[1.5]" /> {title}</h2>
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[185px] sm:w-[205px] md:w-[225px] lg:w-[235px]">
              <AnimeCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <ScrollableRow onEndReached={fetchNext}>
          {anime.map((item, i) => (
            <div
              key={item.mal_id}
              className="flex-shrink-0 w-[185px] sm:w-[205px] md:w-[225px] lg:w-[235px] relative"
            >
              {showRank && (
                <span className="absolute top-2 left-2 z-10 font-mono font-bold text-2xl text-text-primary/30">
                  {i + 1}
                </span>
              )}
              <AnimeCard
                anime={item}
                onAddToWatchlist={(malId) => {
                  const a = anime.find((x) => x.mal_id === malId);
                  if (a) toggleWatchlist({ malId: a.mal_id, title: a.title_english || a.title, image: a.images.jpg?.image_url || '' });
                }}
              />
            </div>
          ))}
        </ScrollableRow>
      )}
    </section>
  );
}
