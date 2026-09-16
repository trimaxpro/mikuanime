import { useState, useEffect } from 'react';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateDiff(targetTime: number, now: number): TimeRemaining | null {
  const diff = targetTime - now;
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

// Global shared timer clock: 1 interval shared by all countdown components
type Listener = (now: number) => void;
const listeners = new Set<Listener>();
let timerId: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  if (!timerId) {
    timerId = setInterval(() => {
      const now = Date.now();
      listeners.forEach((l) => l(now));
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };
}

export function useCountdown(targetDate: string | null | undefined) {
  const [remaining, setRemaining] = useState<TimeRemaining | null>(() => {
    if (!targetDate) return null;
    const target = new Date(targetDate).getTime();
    return Number.isNaN(target) ? null : calculateDiff(target, Date.now());
  });

  useEffect(() => {
    if (!targetDate) {
      setRemaining(null);
      return;
    }

    const target = new Date(targetDate).getTime();
    if (Number.isNaN(target)) {
      setRemaining(null);
      return;
    }

    // Initial calculation
    setRemaining(calculateDiff(target, Date.now()));

    // Subscribe to the single shared global 1-second clock
    const unsubscribe = subscribe((now) => {
      setRemaining(calculateDiff(target, now));
    });

    return unsubscribe;
  }, [targetDate]);

  return remaining;
}