import { Calendar, Sparkles } from 'lucide-react';
import { AnimeCard } from '@/components/ui/AnimeCard';
import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { AnimeCardSkeleton } from '@/components/ui/Skeleton';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { Anime } from '@/types/anime';

interface SeasonalGridProps {
  title: string;
  anime: Anime[];
  isLoading: boolean;
}

const gridIcons: Record<string, typeof Calendar> = {
  'Popular': Sparkles, 'Seasonal': Calendar, 'Airing': Calendar,
};

export function SeasonalGrid({ title, anime, isLoading }: SeasonalGridProps) {
  const { toggleWatchlist } = useWatchlist();
  const GridIcon = Object.entries(gridIcons).find(([k]) => title.includes(k))?.[1] || Calendar;

  return (
    <section className="pt-2 pb-2.5 px-4 max-w-7xl mx-auto">
      <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-2.5 flex items-center gap-2"><GridIcon className="w-5 h-5 stroke-[1.5]" /> {title}</h2>
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[185px] sm:w-[205px] md:w-[225px] lg:w-[235px]">
              <AnimeCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <ScrollableRow>
          {anime.map((item) => (
            <div key={item.mal_id} className="flex-shrink-0 w-[185px] sm:w-[205px] md:w-[225px] lg:w-[235px]">
              <AnimeCard
                anime={item}
                onAddToWatchlist={(malId) => {
                  toggleWatchlist({
                    malId,
                    title: item.title_english || item.title,
                    image: item.images.jpg?.image_url || '',
                  });
                }}
              />
            </div>
          ))}
        </ScrollableRow>
      )}
    </section>
  );
}
