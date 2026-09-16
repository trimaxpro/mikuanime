import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronDown, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DotPattern } from '@/components/ui/DotPattern';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HeroSkeleton } from '@/components/ui/Skeleton';

import type { Anime } from '@/types/anime';

interface HeroSectionProps {
  anime: Anime[];
  isLoading: boolean;
}

function HeroBackground({ anime: featured }: { anime: Anime }) {
  const [ready, setReady] = useState(false);
  const bgImage = featured?.banner_image || featured?.images?.jpg?.large_image_url || featured?.images?.jpg?.image_url;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          loading="eager"
          decoding="async"
          ref={(img) => { if (img?.complete) setReady(true); }}
          className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setReady(true)}
        />
      ) : (
        <div className="w-full h-full bg-surface/80" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-void/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/40" />
    </div>
  );
}

export function HeroSection({ anime, isLoading }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % Math.max(anime.length, 1));
  }, [anime.length]);

  useEffect(() => {
    if (anime.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [anime.length, nextSlide]);

  if (isLoading) return <HeroSkeleton />;

  const featured = anime[current];
  if (!featured) return null;

  return (
    <div className="relative h-[48vh] sm:h-[50vh] min-h-[380px] max-h-[500px] overflow-hidden grain-overlay bg-void">
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.mal_id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <HeroBackground anime={featured} />
        </motion.div>
      </AnimatePresence>

      <DotPattern opacity={0.4} />

      <div className="relative z-10 h-full flex items-center pt-8">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.mal_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="max-w-2xl"
            >
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {featured.genres.slice(0, 3).map((g) => (
                  <Badge key={g.name} variant="violet">{g.name}</Badge>
                ))}
                {featured.score && (
                  <Badge variant="amber">
                    <Star className="w-3 h-3 fill-accent-amber stroke-accent-amber mr-1" />
                    {featured.score.toFixed(1)}
                  </Badge>
                )}
                {(featured.episodes || featured.airing_episode) && (
                  <Badge>{featured.episodes || featured.airing_episode} Episodes</Badge>
                )}
              </div>

              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-primary leading-[1.15] mb-2 line-clamp-2">
                {featured.title_english || featured.title}
              </h1>

              {featured.title_japanese && (
                <p className="text-text-muted text-sm sm:text-base mb-2 font-body line-clamp-1">{featured.title_japanese}</p>
              )}

              {featured.synopsis && (
                <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 md:line-clamp-3 mb-4 max-w-xl">
                  {featured.synopsis}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Link to={(featured.episodes || featured.airing_episode) ? `/watch/${featured.mal_id}/1` : `/anime/${featured.mal_id}`}>
                  <Button variant="primary" size="md">
                    <Play className="w-4 h-4 fill-white" />
                    Watch Now
                  </Button>
                </Link>
                <Link to={`/anime/${featured.mal_id}`}>
                  <Button variant="secondary" size="md">
                    <Info className="w-4 h-4 stroke-[1.5]" />
                    Details
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {anime.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-accent-primary w-6' : 'bg-text-muted/40 hover:bg-text-muted'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-4 right-8 z-10 hidden sm:block"
      >
        <ChevronDown className="w-5 h-5 text-text-muted stroke-[1.5]" />
      </motion.div>
    </div>
  );
}
