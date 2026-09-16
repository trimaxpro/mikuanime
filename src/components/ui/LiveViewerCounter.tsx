import { memo } from 'react';
import { useLiveViewers } from '@/hooks/useLiveViewers';
import { cn } from '@/utils/cn';

interface LiveViewerCounterProps {
  className?: string;
  showLabel?: boolean;
}

function LiveViewerCounterInner({ className, showLabel = true }: LiveViewerCounterProps) {
  const { formatted } = useLiveViewers();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-void/80 border border-accent-primary/30 text-xs text-text-primary backdrop-blur-md shadow-glow-sm hover:border-accent-primary/50 transition-all select-none',
        className,
      )}
      title="Viewers on MikuAnime in the last 24 hours"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-glow opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary shadow-[0_0_8px_#39C5CF]" />
      </span>
      <div className="flex items-center gap-1 font-mono font-semibold text-accent-glow">
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

export const LiveViewerCounter = memo(LiveViewerCounterInner);