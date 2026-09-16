import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Play, ChevronDown, ChevronLeft, ChevronRight, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DotPattern } from '@/components/ui/DotPattern';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HeroSkeleton } from '@/components/ui/Skeleton';
import { LiveViewerCounter } from '@/components/ui/LiveViewerCounter';
import type { Anime } from '@/types/anime';

interface HeroSectionProps {
  anime: Anime[];
  isLoading: boolean;
}

const contentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 28 },
      opacity: { duration: 0.35, ease: 'easeOut' },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 28 },
      opacity: { duration: 0.25, ease: 'easeIn' },
    },
  }),
};

const bgVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 1.06,
  },
  center: {
    opacity: 1,
    scale: 1.02,
    transition: {
      opacity: { duration: 0.65, ease: 'easeOut' },
      scale: { duration: 7, ease: 'linear' },
    },
  },
  exit: {
    opacity: 0,
    transition: {
      opacity: { duration: 0.5, ease: 'easeIn' },
    },
  },
};

function HeroSectionInner({ anime, isLoading }: HeroSectionProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  // Take top 6 featured anime for hero carousel
  const featuredList = useMemo(() => anime.slice(0, 6), [anime]);

  const paginate = useCallback((newDirection: number) => {
    if (featuredList.length <= 1) return;
    setPage(([prevPage]) => {
      const nextIndex = (prevPage + newDirection + featuredList.length) % featuredList.length;
      return [nextIndex, newDirection];
    });
  }, [featuredList.length]);

  const goToSlide = (index: number) => {
    if (index === page) return;
    const dir = index > page ? 1 : -1;
    setPage([index, dir]);
  };

  // Smooth automatic slide every 6 seconds, paused while hovering
  useEffect(() => {
    if (featuredList.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredList.length, isHovered, paginate]);

  if (isLoading) return <HeroSkeleton />;
  if (!featuredList.length) return null;

  const currentAnime = featuredList[page] || featuredList[0];
  const bgImage = currentAnime.banner_image || currentAnime.images?.jpg?.large_image_url || currentAnime.images?.jpg?.image_url;

  return (
    <div
      className="group relative h-[48vh] sm:h-[52vh] min-h-[400px] max-h-[520px] overflow-hidden bg-void select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Animated Ken-Burns Banner */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentAnime.mal_id}
          variants={bgVariants}
          initial={direction === 0 ? false : 'enter'}
          animate="center"
          exit="exit"
          className="absolute inset-0 z-0 will-change-transform"
        >
          {bgImage && (
            <img
              src={bgImage}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          )}
          {/* Cinematic Dark Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-void/40" />
        </motion.div>
      </AnimatePresence>

      <DotPattern opacity={0.3} />

      {/* Featured Anime Content with Directional Sliding */}
      <div className="relative z-10 h-full flex items-center pt-8">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentAnime.mal_id}
              custom={direction}
              variants={contentVariants}
              initial={direction === 0 ? false : 'enter'}
              animate="center"
              exit="exit"
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <LiveViewerCounter variant="badge" className="bg-void/70 border-emerald-500/40" />
                {currentAnime.genres?.slice(0, 3).map((g) => (
                  <Badge key={g.name} variant="violet">{g.name}</Badge>
                ))}
                {currentAnime.score && (
                  <Badge variant="amber">
                    <Star className="w-3 h-3 fill-accent-amber stroke-accent-amber mr-1" />
                    {currentAnime.score.toFixed(1)}
                  </Badge>
                )}
                {(currentAnime.episodes || currentAnime.airing_episode) && (
                  <Badge>{currentAnime.episodes || currentAnime.airing_episode} Episodes</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-primary leading-[1.15] mb-2 line-clamp-2 drop-shadow-md">
                {currentAnime.title_english || currentAnime.title}
              </h1>

              {currentAnime.title_japanese && (
                <p className="text-text-muted text-sm sm:text-base mb-2 font-body line-clamp-1">
                  {currentAnime.title_japanese}
                </p>
              )}

              {currentAnime.synopsis && (
                <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 md:line-clamp-3 mb-4 max-w-xl leading-relaxed">
                  {currentAnime.synopsis}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link to={(currentAnime.episodes || currentAnime.airing_episode) ? `/watch/${currentAnime.mal_id}/1` : `/anime/${currentAnime.mal_id}`}>
                  <Button variant="primary" size="md" className="shadow-glow-sm hover:shadow-glow">
                    <Play className="w-4 h-4 fill-white" />
                    Watch Now
                  </Button>
                </Link>
                <Link to={`/anime/${currentAnime.mal_id}`}>
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

      {/* Interactive Navigation Arrows (Hover visible) */}
      {featuredList.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border border-border-subtle bg-void/80 hover:bg-elevated text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-all backdrop-blur-md z-20 shadow-xl opacity-0 group-hover:opacity-100 scale-95 hover:scale-105 active:scale-95"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border border-border-subtle bg-void/80 hover:bg-elevated text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-all backdrop-blur-md z-20 shadow-xl opacity-0 group-hover:opacity-100 scale-95 hover:scale-105 active:scale-95"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </>
      )}

      {/* Slide Navigation Indicator Pills */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {featuredList.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === page
                ? 'bg-accent-primary w-8 shadow-glow-sm'
                : 'bg-text-muted/40 hover:bg-text-secondary w-2.5'
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

export const HeroSection = memo(HeroSectionInner);
