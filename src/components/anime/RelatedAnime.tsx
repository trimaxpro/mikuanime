import { AnimeCard } from '@/components/ui/AnimeCard';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { Anime } from '@/types/anime';

interface RelatedAnimeProps {
  anime: Anime[];
}

export function RelatedAnime({ anime }: RelatedAnimeProps) {
  const { toggleWatchlist } = useWatchlist();

  if (anime.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {anime.map((item) => (
        <AnimeCard
          key={item.mal_id}
          anime={item}
          onAddToWatchlist={(malId) => {
            toggleWatchlist({ malId, title: item.title_english || item.title, image: item.images.jpg?.image_url || '' });
          }}
        />
      ))}
    </div>
  );
}
