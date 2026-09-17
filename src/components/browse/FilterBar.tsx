import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Radio, CalendarDays, Calendar, Tag, ArrowUpDown, ChevronDown, X, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GENRES, ANIME_TYPES, ANIME_STATUS, SEASONS, SORT_OPTIONS } from '@/utils/constants';
import { getGenreIcon } from '@/utils/genreIcons';

export interface FilterState {
  type: string | null;
  status: string | null;
  season: string | null;
  year: string | null;
  genres: string[];
  sort: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults?: number;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => String(1970 + i)).reverse();

const FILTER_CONFIG = [
  { key: 'type' as const, label: 'Type', icon: List, options: ANIME_TYPES as readonly string[] },
  { key: 'status' as const, label: 'Status', icon: Radio, options: ANIME_STATUS as readonly string[] },
  { key: 'season' as const, label: 'Season', icon: CalendarDays, options: SEASONS as readonly string[] },
  { key: 'year' as const, label: 'Year', icon: Calendar, options: YEARS },
] as const;

function FilterDropdown({ label, icon: Icon, value, options, onSelect, onClear }: {
  label: string;
  icon: typeof List;
  value: string | null;
  options: readonly string[];
  onSelect: (v: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-card text-xs font-body font-medium transition-all duration-200 border',
          value
            ? 'bg-accent-primary/10 text-accent-glow border-accent-primary/30'
            : 'bg-elevated text-text-secondary border-border-subtle hover:border-border-glow hover:text-text-primary',
        )}
      >
        <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
        <span className="hidden sm:inline">{value || label}</span>
        <span className="sm:hidden">{value || label}</span>
        <ChevronDown className={cn('w-3 h-3 stroke-[1.5] transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-surface border border-border-subtle rounded-card shadow-xl overflow-hidden"
          >
            <div className="py-1 max-h-[240px] overflow-y-auto">
              <button
                onClick={() => { onClear(); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs font-body transition-colors text-left',
                  !value ? 'text-accent-glow bg-accent-primary/5' : 'text-text-secondary hover:text-text-primary hover:bg-elevated',
                )}
              >
                All {label}
              </button>
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onSelect(opt); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs font-body transition-colors text-left',
                    value === opt ? 'text-accent-glow bg-accent-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-elevated',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || 'Popularity';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-card text-xs font-body font-medium transition-all duration-200 border bg-accent-primary/10 text-accent-glow border-accent-primary/30"
      >
        <ArrowUpDown className="w-3.5 h-3.5 stroke-[1.5]" />
        <span className="hidden sm:inline">{currentLabel}</span>
        <span className="sm:hidden">Sort</span>
        <ChevronDown className={cn('w-3 h-3 stroke-[1.5] transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-surface border border-border-subtle rounded-card shadow-xl overflow-hidden"
          >
            <div className="py-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs font-body transition-colors text-left',
                    value === opt.value ? 'text-accent-glow bg-accent-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-elevated',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GenrePills({ selected, onToggle }: { selected: string[]; onToggle: (genre: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  const display = showAll ? GENRES : GENRES.slice(0, 8);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag className="w-3.5 h-3.5 text-text-muted stroke-[1.5] flex-shrink-0" />
      {display.map((g) => {
        const Icon = getGenreIcon(g.slug);
        const isSelected = selected.includes(g.name);
        return (
          <button
            key={g.name}
            onClick={() => onToggle(g.name)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-input text-xs font-body font-medium transition-all duration-200 border',
              isSelected
                ? 'bg-accent-primary/15 text-accent-glow border-accent-primary/30 shadow-glow-sm'
                : 'bg-elevated text-text-secondary border-border-subtle hover:border-border-glow hover:text-text-primary',
            )}
          >
            <Icon className={cn('w-3 h-3 stroke-[1.8]', isSelected ? 'text-accent-glow' : 'text-text-muted')} />
            <span>{g.name}</span>
          </button>
        );
      })}
      {GENRES.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-2.5 py-1 rounded-input text-xs font-body font-medium text-text-muted hover:text-accent-glow transition-colors"
        >
          {showAll ? 'Show less' : `+${GENRES.length - 8} more`}
        </button>
      )}
    </div>
  );
}

export function FilterBar({ filters, onChange, totalResults }: FilterBarProps) {
  const activeCount = [filters.type, filters.status, filters.season, filters.year].filter(Boolean).length + filters.genres.length;

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  }, [filters, onChange]);

  const clearFilter = useCallback((key: keyof FilterState) => {
    if (key === 'genres') updateFilter('genres', []);
    else if (key === 'sort') updateFilter('sort', 'score');
    else updateFilter(key, null);
  }, [updateFilter]);

  const clearAll = useCallback(() => {
    onChange({ type: null, status: null, season: null, year: null, genres: [], sort: 'score' });
  }, [onChange]);

  const activeFilters: { key: keyof FilterState; label: string; value: string }[] = [];
  if (filters.type) activeFilters.push({ key: 'type', label: 'Type', value: filters.type });
  if (filters.status) activeFilters.push({ key: 'status', label: 'Status', value: filters.status });
  if (filters.season) activeFilters.push({ key: 'season', label: 'Season', value: filters.season });
  if (filters.year) activeFilters.push({ key: 'year', label: 'Year', value: filters.year });
  filters.genres.forEach((g) => activeFilters.push({ key: 'genres', label: 'Genre', value: g }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_CONFIG.map((cfg) => (
            <FilterDropdown
              key={cfg.key}
              label={cfg.label}
              icon={cfg.icon}
              value={filters[cfg.key]}
              options={cfg.options}
              onSelect={(v) => updateFilter(cfg.key, v)}
              onClear={() => clearFilter(cfg.key)}
            />
          ))}
        </div>
        <SortDropdown value={filters.sort} onChange={(v) => updateFilter('sort', v)} />
      </div>

      <GenrePills selected={filters.genres} onToggle={(g) => {
        const next = filters.genres.includes(g) ? filters.genres.filter((x) => x !== g) : [...filters.genres, g];
        updateFilter('genres', next);
      }} />

      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-1.5 overflow-hidden"
          >
            {activeFilters.map((f) => (
              <span
                key={`${f.key}-${f.value}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-input text-xs font-body font-medium bg-accent-primary/10 text-accent-glow border border-accent-primary/20"
              >
                {f.value}
                <button onClick={() => {
                  if (f.key === 'genres') updateFilter('genres', filters.genres.filter((g) => g !== f.value));
                  else clearFilter(f.key);
                }} className="hover:text-white transition-colors">
                  <X className="w-3 h-3 stroke-[1.5]" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-input text-xs font-body font-medium text-text-muted hover:text-accent-rose transition-colors"
            >
              <RotateCcw className="w-3 h-3 stroke-[1.5]" />
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {totalResults !== undefined && (
        <p className="text-xs text-text-muted font-body">
          {totalResults} result{totalResults !== 1 ? 's' : ''}
          {activeCount > 0 && ` (${activeCount} filter${activeCount !== 1 ? 's' : ''} active)`}
        </p>
      )}
    </div>
  );
}
