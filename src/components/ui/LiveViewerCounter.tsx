import { memo } from 'react';
import { Radio } from 'lucide-react';
import { useLiveViewers } from '@/hooks/useLiveViewers';
import { cn } from '@/utils/cn';

interface LiveViewerCounterProps {
  variant?: 'box' | 'badge' | 'footer';
  className?: string;
  showLabel?: boolean;
}

function LiveViewerCounterInner({
  variant = 'box',
  className,
  showLabel = true,
}: LiveViewerCounterProps) {
  const { formatted, direction } = useLiveViewers();

  // Variant: Compact Pill for Navbar
  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-void/80 border border-emerald-500/30 text-xs text-text-primary backdrop-blur-md shadow-glow-sm hover:border-emerald-500/50 transition-all select-none',
          className,
        )}
        title="Viewers on MikuAnime in the last 24 hours"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </span>
        <div className="flex items-center gap-1 font-mono font-semibold text-emerald-400">
          <span>{formatted}</span>
        </div>
        {showLabel && (
          <span className="hidden sm:inline text-[11px] text-text-muted font-sans font-medium uppercase tracking-wider">
            Viewers
          </span>
        )}
      </div>
    );
  }

  // Variant: Footer Community Status Box
  if (variant === 'footer') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-surface/70 border border-emerald-500/25 text-xs text-text-secondary backdrop-blur-sm shadow-sm select-none',
          className,
        )}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </span>
        <div className="flex items-center gap-1.5 font-body">
          <span className="font-mono font-bold text-emerald-400 text-sm">{formatted}</span>
          <span>fans on MikuAnime in the last 24 hours</span>
        </div>
      </div>
    );
  }

  // Variant: Main Dedicated Live Viewer Box
  return (
    <div
      className={cn(
        'relative group overflow-hidden rounded-xl bg-surface/90 border border-emerald-500/30 px-3.5 py-2 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] select-none',
        className,
      )}
    >
      {/* Subtle emerald ambient back-glow */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-2.5">
        {/* Radar live pulsing dot */}
        <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
        </div>

        {/* Counter Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-base sm:text-lg text-text-primary tracking-tight font-mono">
              {formatted}
            </span>
            <span
              className={cn(
                'text-[10px] font-mono transition-transform duration-300',
                direction === 'up' && 'text-emerald-400 translate-y-[-1px]',
                direction === 'down' && 'text-rose-400 translate-y-[1px]',
                direction === 'steady' && 'text-text-muted opacity-0',
              )}
            >
              {direction === 'up' ? '▲' : direction === 'down' ? '▼' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-text-muted font-body font-medium uppercase tracking-wider">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse stroke-[2]" />
            <span>Viewers · 24h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const LiveViewerCounter = memo(LiveViewerCounterInner);
