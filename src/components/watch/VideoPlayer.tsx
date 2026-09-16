import { useRef, useState, useEffect, useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, MonitorPlay } from 'lucide-react';
import { formatTime } from '@/utils/format';
import { cn } from '@/utils/cn';

interface VideoPlayerProps {
  src: string;
  embedUrl?: string;
  onEnded?: () => void;
  skipTimes?: { type: string; startTime: number; endTime: number }[];
}

export function VideoPlayer({ src, embedUrl, onEnded, skipTimes }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const store = usePlayerStore();

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); store.setPlaying(true); }
    else { v.pause(); store.setPlaying(false); }
  }, [store]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    store.setVolume(v.muted ? 0 : 1);
  }, [store]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      store.setFullscreen(false);
    } else {
      containerRef.current.requestFullscreen();
      store.setFullscreen(true);
    }
  }, [store]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    v.currentTime = pos * v.duration;
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
    store.setPlaybackRate(speed);
    setShowSpeedMenu(false);
  }, [store]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      store.setCurrentTime(v.currentTime);
      if (v.duration) store.setDuration(v.duration);
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onPlay = () => store.setPlaying(true);
    const onPause = () => store.setPlaying(false);
    const onEnded = () => { store.setPlaying(false); onEnded?.(); };

    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);

    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, [store, onEnded]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
      if (e.key === 'f') { e.preventDefault(); toggleFullscreen(); }
      if (e.key === 'm') { e.preventDefault(); toggleMute(); }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime += 10;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime -= 10;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, toggleFullscreen, toggleMute]);

  useEffect(() => {
    if (!embedUrl) return;

    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      const { type, currentTime } = e.data as { type?: string; currentTime?: number };
      if (type === 'aniembed:play') {
        store.setPlaying(true);
        if (typeof currentTime === 'number' && Number.isFinite(currentTime)) {
          store.setCurrentTime(currentTime);
        }
      }
      if (type === 'aniembed:ended') {
        store.setPlaying(false);
        onEnded?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [embedUrl, onEnded, store]);

  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-hero overflow-hidden border border-border-subtle">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Video player"
        />
      </div>
    );
  }

  const activeSkip = skipTimes?.find(
    (s) => store.currentTime >= s.startTime && store.currentTime < s.endTime
  );

  const progress = store.duration > 0 ? (store.currentTime / store.duration) * 100 : 0;
  const bufferedProgress = store.duration > 0 ? (buffered / store.duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-hero overflow-hidden group ${store.isTheaterMode ? 'max-w-full' : 'w-full'}`}
      onMouseMove={showControls}
      onMouseLeave={() => setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        preload="metadata"
        onClick={togglePlay}
      />

      {activeSkip && (
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.currentTime = activeSkip.endTime;
          }}
          className="absolute bottom-20 left-4 z-20 px-4 py-2 rounded-card bg-accent-primary/90 text-white text-sm font-body font-medium animate-fade-in hover:bg-accent-primary"
        >
          Skip {activeSkip.type === 'op' ? 'Intro' : 'Ending'}
          <SkipForward className="w-4 h-4 inline ml-1" />
        </button>
      )}

      {!store.isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white stroke-[1.5]" />
          </div>
        </div>
      )}

      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 z-20',
        controlsVisible || !store.isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}>
        <div className="mb-3 cursor-pointer group/progress" onClick={seek}>
          <div className="relative h-1 bg-white/20 rounded-full group-hover/progress:h-1.5 transition-all">
            <div className="absolute top-0 left-0 h-full bg-white/20 rounded-full" style={{ width: `${bufferedProgress}%` }} />
            <div className="absolute top-0 left-0 h-full bg-accent-primary rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-accent-glow transition-colors" aria-label="Play/Pause">
              {store.isPlaying ? <Pause className="w-5 h-5 stroke-[1.5]" /> : <Play className="w-5 h-5 fill-white stroke-[1.5]" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-accent-glow transition-colors" aria-label="Mute">
              {videoRef.current?.muted ? <VolumeX className="w-5 h-5 stroke-[1.5]" /> : <Volume2 className="w-5 h-5 stroke-[1.5]" />}
            </button>
            <span className="text-white text-xs font-mono">
              {formatTime(store.currentTime)} / {formatTime(store.duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white text-xs font-mono hover:text-accent-glow transition-colors"
              >
                {store.playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 glass-card rounded-card p-2 flex flex-col gap-1 min-w-[60px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={cn('text-xs px-2 py-1 rounded-input text-left', speed === store.playbackRate ? 'text-accent-glow bg-accent-primary/20' : 'text-text-secondary hover:bg-elevated')}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => store.setTheaterMode(!store.isTheaterMode)}
              className="text-white hover:text-accent-glow transition-colors"
              aria-label="Theater mode"
            >
              <MonitorPlay className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-accent-glow transition-colors" aria-label="Fullscreen">
              {store.isFullscreen ? <Minimize className="w-5 h-5 stroke-[1.5]" /> : <Maximize className="w-5 h-5 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
