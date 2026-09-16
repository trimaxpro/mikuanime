import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, ChevronDown, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HeroSkeleton } from '@/components/ui/Skeleton';
import type { Anime } from '@/types/anime';

interface HeroSectionProps {
  anime: Anime[];
  isLoading: boolean;
}

export function HeroSection({ anime, isLoading }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Pre-slice top 6 featured anime for hero carousel
  const featuredList = useMemo(() => anime.slice(0, 6), [anime]);

  const nextSlide = useCallback(() => {
    if (featuredList.length <= 1) return;
    setCurrent((prev) => (prev + 1) % featuredList.length);
  }, [featuredList.length]);

  useEffect(() => {
    if (featuredList.length <= 1 || isHovered) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [featuredList.length, isHovered, nextSlide]);

  if (isLoading) return <HeroSkeleton />;
  if (!featuredList.length) return null;

  return (
    <div
      className="relative h-[48vh] sm:h-[52vh] min-h-[400px] max-h-[520px] overflow-hidden bg-void select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pre-rendered Stacked Slide Backgrounds with 60fps Hardware-Accelerated CSS Crossfade */}
      {featuredList.map((item, idx) => {
        const bgImage = item.banner_image || item.images?.jpg?.large_image_url || item.images?.jpg?.image_url;
        const isActive = idx === current;
        return (
          <div
            key={item.mal_id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out will-change-[opacity] ${
              isActive ? 'opacity-100 z-0 pointer-events-auto' : 'opacity-0 z-[-1] pointer-events-none'
            }`}
          >
            {bgImage && (
              <img
                src={bgImage}
                alt=""
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover scale-105"
              />
            )}
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-void/40" />
          </div>
        );
      })}

      {/* Featured Anime Content Overlay with Smooth Transitions */}
      <div className="relative z-10 h-full flex items-center pt-8">
        <div className="max-w-7xl mx-auto px-4 w-full">
          {featuredList.map((item, idx) => {
            const isActive = idx === current;
            return (
              <div
                key={item.mal_id}
                aria-hidden={!isActive}
                className={`max-w-2xl transition-all duration-500 ease-out ${
                  isActive
                    ? 'opacity-100 translate-y-0 relative pointer-events-auto'
                    : 'opacity-0 translate-y-4 absolute inset-x-4 pointer-events-none'
                }`}
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {item.genres?.slice(0, 3).map((g) => (
                    <Badge key={g.name} variant="violet">{g.name}</Badge>
                  ))}
                  {item.score && (
                    <Badge variant="amber">
                      <Star className="w-3 h-3 fill-accent-amber stroke-accent-amber mr-1" />
                      {item.score.toFixed(1)}
                    </Badge>
                  )}
                  {(item.episodes || item.airing_episode) && (
                    <Badge>{item.episodes || item.airing_episode} Episodes</Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-primary leading-[1.15] mb-2 line-clamp-2 drop-shadow-md">
                  {item.title_english || item.title}
                </h1>

                {item.title_japanese && (
                  <p className="text-text-muted text-sm sm:text-base mb-2 font-body line-clamp-1">{item.title_japanese}</p>
                )}

                {item.synopsis && (
                  <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 md:line-clamp-3 mb-4 max-w-xl leading-relaxed">
                    {item.synopsis}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Link to={(item.episodes || item.airing_episode) ? `/watch/${item.mal_id}/1` : `/anime/${item.mal_id}`}>
                    <Button variant="primary" size="md" className="shadow-glow-sm hover:shadow-glow">
                      <Play className="w-4 h-4 fill-white" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link to={`/anime/${item.mal_id}`}>
                    <Button variant="secondary" size="md">
                      <Info className="w-4 h-4 stroke-[1.5]" />
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Navigation Indicator Pills */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {featuredList.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-accent-primary w-7 shadow-glow-sm'
                : 'bg-text-muted/40 hover:bg-text-secondary w-2'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Hardware-Accelerated Scroll Down Indicator */}
      <div className="absolute bottom-4 right-8 z-20 hidden sm:block animate-bounce opacity-75 hover:opacity-100 transition-opacity">
        <ChevronDown className="w-5 h-5 text-text-muted stroke-[1.5]" />
      </div>
    </div>
  );
}
