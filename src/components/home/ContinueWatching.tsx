import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Film, Trash2 } from 'lucide-react';
import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { useWatchHistory } from '@/hooks/useWatchHistory';

export function ContinueWatching() {
  const { watchHistory, clearWatchHistory } = useWatchHistory();
  const [confirming, setConfirming] = useState(false);

  const uniqueAnime = watchHistory.reduce(
    (acc, h) => {
      if (!acc[h.malId] || new Date(h.lastWatched) > new Date(acc[h.malId].lastWatched)) {
        acc[h.malId] = h;
      }
      return acc;
    },
    {} as Record<number, (typeof watchHistory)[0]>,
  );

  const entries = Object.values(uniqueAnime).slice(0, 12);

  if (entries.length === 0) return null;

  return (
    <section className="pt-4 pb-2.5 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-glow stroke-[1.5]" />
          Continue Watching
        </h2>
        <div className="flex items-center">
          <AnimatePresence mode="wait">
            {confirming ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface/90 border border-accent-rose/30 shadow-lg backdrop-blur-md"
              >
                <span className="text-xs text-text-secondary font-medium">Clear all?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { clearWatchHistory(); setConfirming(false); }}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-rose text-white hover:bg-accent-rose/90 shadow-sm hover:shadow-glow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-text-muted hover:text-text-primary hover:bg-elevated transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setConfirming(true)}
                className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-text-secondary hover:text-accent-rose bg-surface/50 hover:bg-accent-rose/10 border border-border-subtle/80 hover:border-accent-rose/40 transition-all duration-200 backdrop-blur-sm shadow-sm hover:shadow-glow-sm"
                title="Clear watch history"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.7] text-text-muted group-hover:text-accent-rose transition-colors" />
                <span>Clear History</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ScrollableRow>
        {entries.map((entry, i) => (
          <motion.div
            key={`${entry.malId}-${entry.episode}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex-shrink-0 w-[185px] sm:w-[205px] md:w-[225px] lg:w-[235px] group relative flex flex-col gap-2"
          >
            <Link
              to={`/watch/${entry.malId}/${entry.episode}`}
              className="block relative aspect-[3/4] rounded-card overflow-hidden bg-elevated"
            >
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-accent-primary/90 flex items-center justify-center shadow-glow">
                  <Play className="w-5 h-5 text-white fill-white stroke-[1.5]" />
                </div>
              </div>
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-void/70 backdrop-blur-sm text-xs text-text-primary">
                <Film className="w-3 h-3 stroke-[1.5]" />
                EP {entry.episode}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-elevated/80">
                <div
                  className="h-full bg-accent-primary rounded-full transition-all"
                  style={{ width: `${Math.min(entry.progress * 100, 100)}%` }}
                />
              </div>
              {entry.progress > 0 && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-void/70 backdrop-blur-sm text-[10px] font-mono text-text-muted">
                  {Math.round(entry.progress * 100)}%
                </div>
              )}
            </Link>
            <div className="flex flex-col gap-1">
              <h3 className="font-display font-semibold text-sm text-text-primary line-clamp-2 leading-tight">
                <Link to={`/watch/${entry.malId}/${entry.episode}`} className="hover:text-accent-glow transition-colors">
                  {entry.title}
                </Link>
              </h3>
              <p className="text-xs text-text-muted">Episode {entry.episode}</p>
            </div>
          </motion.div>
        ))}
      </ScrollableRow>
    </section>
  );
}
