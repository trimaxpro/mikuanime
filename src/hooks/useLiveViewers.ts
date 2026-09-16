import { useState, useEffect } from 'react';

const STORAGE_KEY = 'miku_live_viewers';
const CHANNEL_NAME = 'miku_live_viewers_channel';

// Realistic baseline active viewers during peak and off-peak hours
function getInitialViewerCount(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { count, timestamp } = JSON.parse(saved);
      // Keep count if under 5 minutes old
      if (Date.now() - timestamp < 300000 && typeof count === 'number' && count > 50) {
        return count;
      }
    }
  } catch {
    // Ignore storage parse errors
  }

  // Generate a realistic seed based on the current hour of the day (e.g. 180 to 420)
  const hour = new Date().getHours();
  const isPeak = hour >= 14 && hour <= 23;
  const base = isPeak ? 280 : 160;
  return base + Math.floor(Math.random() * 45);
}

export function useLiveViewers() {
  const [viewers, setViewers] = useState<number>(getInitialViewerCount);
  const [direction, setDirection] = useState<'up' | 'down' | 'steady'>('steady');

  useEffect(() => {
    // BroadcastChannel for cross-tab synchronization
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (typeof event.data?.count === 'number') {
            setViewers(event.data.count);
          }
        };
      }
    } catch {
      // BroadcastChannel fallback
    }

    // Natural real-time fluctuation interval (between 3.5s and 6.5s)
    let timer: ReturnType<typeof setTimeout>;

    const scheduleNextTick = () => {
      const delay = 3500 + Math.random() * 3000;
      timer = setTimeout(() => {
        setViewers((prev) => {
          // Weighted random walk (-3 to +4)
          const delta = Math.random() > 0.45 ? Math.floor(Math.random() * 3) + 1 : -Math.floor(Math.random() * 2) - 1;
          const next = Math.max(85, prev + delta);

          setDirection(delta > 0 ? 'up' : delta < 0 ? 'down' : 'steady');

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: next, timestamp: Date.now() }));
            channel?.postMessage({ count: next });
          } catch {
            // Ignore storage quota errors
          }

          return next;
        });

        scheduleNextTick();
      }, delay);
    };

    scheduleNextTick();

    return () => {
      clearTimeout(timer);
      channel?.close();
    };
  }, []);

  return {
    count: viewers,
    formatted: viewers.toLocaleString(),
    direction,
  };
}
