import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';
import { GENRES } from '@/utils/constants';

function GenreQuickNavInner() {
  return (
    <section className="pt-3 pb-8 px-4 max-w-7xl mx-auto" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}>
      <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent-glow stroke-[1.5]" /> Browse by Genre
      </h2>
      <div className="flex flex-wrap gap-2 ml-10">
        {GENRES.map((genre) => (
          <Link
            key={genre.slug}
            to={`/genre/${genre.slug}`}
            className="group relative overflow-hidden px-4 py-2 rounded-card bg-elevated border border-border-subtle text-sm text-text-secondary font-body font-medium transition-all duration-300 hover:border-accent-primary/30 hover:text-accent-glow"
          >
            <DotPattern opacity={0} className="group-hover:opacity-30 transition-opacity duration-300" />
            <span className="relative z-10">{genre.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const GenreQuickNav = memo(GenreQuickNavInner);

