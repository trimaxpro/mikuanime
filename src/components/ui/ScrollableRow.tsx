import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ScrollableRowProps {
  children: React.ReactNode;
  className?: string;
  onEndReached?: () => void;
}

const END_THRESHOLD = 400;
const LOADING_LOCK_MS = 1500;

function getEstimatedCoverCenter(): number {
  if (typeof window === 'undefined') return 150;
  const w = window.innerWidth;
  const cardWidth = w >= 1024 ? 235 : w >= 768 ? 225 : w >= 640 ? 205 : 185;
  return (cardWidth * 4) / 3 / 2;
}

export function ScrollableRow({ children, className, onEndReached }: ScrollableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [coverCenter, setCoverCenter] = useState<number>(getEstimatedCoverCenter);
  const loadingLockRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

    if (onEndReached && !loadingLockRef.current) {
      const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;
      if (remaining < END_THRESHOLD) {
        loadingLockRef.current = true;
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => { loadingLockRef.current = false; }, LOADING_LOCK_MS);
        onEndReached();
      }
    }
  }, [onEndReached]);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const updateCoverCenter = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cover =
      el.querySelector<HTMLElement>('[class*="aspect-"]') ||
      el.querySelector<HTMLElement>('img')?.parentElement ||
      el.querySelector<HTMLElement>('a');
    if (cover && cover.offsetHeight > 0) {
      const coverRect = cover.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      const center = coverRect.top - containerRect.top + coverRect.height / 2;
      if (center > 0) {
        setCoverCenter(center);
      }
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    updateCoverCenter();
    const el = containerRef.current;
    if (!el) return;

    const rafId = requestAnimationFrame(updateCoverCenter);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateCoverCenter();
      });
      observer.observe(el);
      if (el.firstElementChild) {
        observer.observe(el.firstElementChild);
      }
    }

    window.addEventListener('resize', updateCoverCenter);

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateCoverCenter);
    };
  }, [children, updateCoverCenter]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth || 200;
    const scrollAmount = cardWidth * 3;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div
      className={cn('relative flex items-start gap-2', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        style={{ marginTop: `${coverCenter}px` }}
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-border-subtle bg-elevated/90 text-text-secondary hover:text-text-primary hover:border-border-glow hover:bg-elevated transition-all shadow-lg backdrop-blur-sm z-10 -translate-y-1/2',
          canScrollLeft && hovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-label="Previous"
      >
        <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
      </button>
      <div
        ref={containerRef}
        className="flex-1 min-w-0 flex gap-3 overflow-x-auto scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        style={{ marginTop: `${coverCenter}px` }}
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-border-subtle bg-elevated/90 text-text-secondary hover:text-text-primary hover:border-border-glow hover:bg-elevated transition-all shadow-lg backdrop-blur-sm z-10 -translate-y-1/2',
          canScrollRight && hovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-label="Next"
      >
        <ChevronRight className="w-4 h-4 stroke-[1.5]" />
      </button>
    </div>
  );
}
