import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ScrollableRowProps {
  children: React.ReactNode;
  className?: string;
  onEndReached?: () => void;
}

const END_THRESHOLD = 400;
const LOADING_LOCK_MS = 1500;

function ScrollableRowInner({ children, className, onEndReached }: ScrollableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hovered, setHovered] = useState(false);
  const loadingLockRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const newLeft = el.scrollLeft > 4;
    const newRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
    setCanScrollLeft((prev) => (prev !== newLeft ? newLeft : prev));
    setCanScrollRight((prev) => (prev !== newRight ? newRight : prev));

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth || 200;
    const scrollAmount = cardWidth * 3;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div
      className={cn('group/row relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className={cn(
          'absolute left-1 top-[42%] -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border border-border-subtle bg-void/90 text-text-secondary hover:text-text-primary hover:border-accent-primary/50 hover:bg-elevated transition-all shadow-xl backdrop-blur-md z-20',
          canScrollLeft && hovered ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95',
        )}
        aria-label="Previous"
      >
        <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
      </button>

      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 px-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={cn(
          'absolute right-1 top-[42%] -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center border border-border-subtle bg-void/90 text-text-secondary hover:text-text-primary hover:border-accent-primary/50 hover:bg-elevated transition-all shadow-xl backdrop-blur-md z-20',
          canScrollRight && hovered ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95',
        )}
        aria-label="Next"
      >
        <ChevronRight className="w-4 h-4 stroke-[1.5]" />
      </button>
    </div>
  );
}

export const ScrollableRow = memo(ScrollableRowInner);
