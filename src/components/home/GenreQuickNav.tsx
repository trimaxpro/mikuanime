import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';
import { GENRES } from '@/utils/constants';
import { getGenreIcon } from '@/utils/genreIcons';

function GenreQuickNavInner() {
  return (
    <section className="pt-3 pb-8 px-4 max-w-7xl mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}>
      <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-3.5 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent-glow stroke-[1.5]" /> Browse by Genre
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {GENRES.map((genre) => {
          const Icon = getGenreIcon(genre.slug);
          return (
            <Link
              key={genre.slug}
              to={`/genre/${genre.slug}`}
              className="group relative overflow-hidden flex items-center gap-2.5 px-3.5 py-2 rounded-card bg-elevated/80 border border-border-subtle text-sm text-text-secondary font-body font-medium transition-all duration-200 hover:border-accent-primary/40 hover:text-accent-glow hover:bg-white/[0.04] shadow-sm hover:shadow-glow-sm"
            >
              <DotPattern opacity={0} className="group-hover:opacity-30 transition-opacity duration-300" />
              <Icon className="w-4 h-4 stroke-[1.75] text-accent-glow/75 group-hover:text-accent-glow group-hover:scale-110 transition-all duration-200 flex-shrink-0" />
              <span className="relative z-10">{genre.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export const GenreQuickNav = memo(GenreQuickNavInner);
