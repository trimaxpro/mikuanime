import { motion } from 'framer-motion';
import { formatNumber } from '@/utils/format';
import { Film, Clock, Star, BarChart3, Heart, Users, Award, Calendar, Tv, Hash, Globe, Sparkles, Link2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ScoreCircle } from './ScoreCircle';
import type { Anime } from '@/types/anime';

interface InfoPanelProps {
  anime: Anime;
}

const stagger = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Star; label: string; value: string | number | null | undefined; accent?: string }) {
  if (!value) return null;
  return (
    <motion.div variants={stagger} custom={0} className="glass-card rounded-card p-3 flex items-center gap-3 hover:border-border-glow/30 transition-colors">
      <div className={`w-9 h-9 rounded-card flex items-center justify-center ${accent || 'bg-accent-primary/10'}`}>
        <Icon className={`w-4 h-4 stroke-[1.5] ${accent ? 'text-white' : 'text-accent-glow'}`} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">{label}</span>
        <span className="font-display font-semibold text-text-primary text-sm leading-tight">{value}</span>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Film; label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-1.5 px-3 rounded-input hover:bg-elevated/50 transition-colors">
      <Icon className="w-3.5 h-3.5 text-text-muted flex-shrink-0 stroke-[1.5]" />
      <span className="text-text-muted text-xs w-16 flex-shrink-0 font-medium">{label}</span>
      <span className="text-text-secondary text-sm">{value}</span>
    </div>
  );
}

const SECTION_HEADER_CLASS = "font-display font-semibold text-base text-text-primary mb-3 flex items-center gap-1.5";

export function InfoPanel({ anime }: InfoPanelProps) {
  const infoRows = [
    { icon: Tv, label: 'Type', value: anime.type },
    { icon: Hash, label: 'Episodes', value: anime.episodes?.toString() },
    { icon: Clock, label: 'Duration', value: anime.duration },
    { icon: Heart, label: 'Status', value: anime.status },
    { icon: Calendar, label: 'Aired', value: anime.aired?.string },
    { icon: Calendar, label: 'Premiered', value: anime.season && anime.year ? `${anime.season} ${anime.year}` : null },
    { icon: Globe, label: 'Source', value: anime.source },
    { icon: Film, label: 'Rating', value: anime.rating },
  ].filter((r) => r.value);

  return (
    <div className="space-y-6">
      {/* Key Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {anime.score && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
            className="glass-card rounded-card p-3 flex flex-col items-center justify-center col-span-2 sm:col-span-1"
          >
            <ScoreCircle score={anime.score} size={90} strokeWidth={5} />
          </motion.div>
        )}
        <StatCard icon={Star} label="Score" value={anime.score?.toFixed(1)} accent="bg-green-500/20" />
        <StatCard icon={Award} label="Ranked" value={anime.rank ? `#${anime.rank}` : null} accent="bg-accent-amber/20" />
        <StatCard icon={BarChart3} label="Popularity" value={anime.popularity ? `#${anime.popularity}` : null} accent="bg-accent-rose/20" />
        <StatCard icon={Users} label="Members" value={anime.members ? formatNumber(anime.members) : null} />
        <StatCard icon={Heart} label="Favorites" value={anime.favorites ? formatNumber(anime.favorites) : null} />
      </div>

      {/* Information */}
      <motion.div initial="initial" animate="animate" className="glass-card rounded-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
          {infoRows.map((row, i) => (
            <motion.div key={row.label} variants={stagger} custom={i}>
              <InfoRow icon={row.icon} label={row.label} value={row.value} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Studios + Genres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {anime.studios && anime.studios.length > 0 && (
          <motion.div initial="initial" animate="animate" className="glass-card rounded-card p-4">
            <h3 className={SECTION_HEADER_CLASS}>
              <Film className="w-4 h-4 text-accent-glow stroke-[1.5]" />
              Studio
            </h3>
            <div className="flex flex-wrap gap-2">
              {anime.studios.map((s) => (
                <Badge key={s.name || s.mal_id} variant="violet">{s.name}</Badge>
              ))}
            </div>
          </motion.div>
        )}

        {(anime.genres.length > 0 || anime.themes.length > 0) && (
          <motion.div initial="initial" animate="animate" className="glass-card rounded-card p-4">
            <h3 className={SECTION_HEADER_CLASS}>
              <Sparkles className="w-4 h-4 text-accent-glow stroke-[1.5]" />
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Badge key={g.name || g.mal_id}>{g.name}</Badge>
              ))}
              {anime.themes.map((t) => (
                <Badge key={t.name || t.mal_id} variant="amber">{t.name}</Badge>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Relations */}
      {anime.relations && anime.relations.length > 0 && (
        <motion.div initial="initial" animate="animate" className="glass-card rounded-card p-4">
          <h3 className={SECTION_HEADER_CLASS}>
            <Link2 className="w-4 h-4 text-accent-glow stroke-[1.5]" />
            Related
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {anime.relations.slice(0, 9).map((rel, i) => (
              <div key={i} className="flex items-center gap-2 py-2 px-3 rounded-input bg-elevated/50 hover:bg-elevated transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{rel.relation}</p>
                  <p className="text-sm text-text-primary line-clamp-1 group-hover:text-accent-glow transition-colors">
                    {rel.entry.map((e) => e.name).join(', ')}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted flex-shrink-0 stroke-[1.5]" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
