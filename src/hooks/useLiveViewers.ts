import { useState, useEffect, useRef } from 'react';

const POLL_MS = 5 * 60 * 1000;

export function useLiveViewers() {
  const [viewers, setViewers] = useState<number>(1);
  const [direction, setDirection] = useState<'up' | 'down' | 'steady'>('steady');
  const prevRef = useRef<number>(1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/viewers', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.liveViewers === 'number') {
          const next = Math.max(1, data.liveViewers);
          if (!cancelled) {
            setDirection(next > prevRef.current ? 'up' : next < prevRef.current ? 'down' : 'steady');
            prevRef.current = next;
            setViewers(next);
          }
        }
      } catch {
        // network silent fallback
      }
    };

    load();
    const interval = setInterval(load, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return {
    count: viewers,
    formatted: viewers.toLocaleString(),
    direction,
  };
}