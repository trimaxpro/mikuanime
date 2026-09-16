import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Star } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';

interface SearchBarProps {
  initialQuery?: string;
  compact?: boolean;
  onSearchSubmit?: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  initialQuery = '',
  compact = false,
  onSearchSubmit,
  className,
  placeholder = 'Search anime by title, character, or numerical ID...',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearch(debouncedQuery, 1);
  const showDropdown = focused && query.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = query.trim();
    if (cleanQ) {
      if (onSearchSubmit) {
        onSearchSubmit(cleanQ);
      } else {
        navigate(`/search?q=${encodeURIComponent(cleanQ)}`);
      }
      setFocused(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-glow stroke-[1.6] pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={placeholder}
            className={cn(
              'w-full bg-surface/80 backdrop-blur-md border border-border-subtle rounded-2xl pl-12 pr-12 py-3.5',
              'text-text-primary placeholder:text-text-muted text-sm sm:text-base font-body shadow-sm',
              'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/40 focus:shadow-glow-sm',
              'transition-all duration-200',
              compact && 'py-2 pl-10 pr-10 text-xs sm:text-sm rounded-xl',
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary hover:bg-white/10 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-border-subtle rounded-2xl p-2 z-50 max-h-[420px] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-text-muted animate-pulse">
              Searching anime catalog...
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center justify-between">
                <span>Top Results</span>
                <span className="text-accent-glow font-mono text-[10px]">Unrestricted Access</span>
              </div>
              <div className="space-y-1">
                {data.data.slice(0, 8).map((anime) => (
                  <Link
                    key={anime.mal_id}
                    to={`/anime/${anime.mal_id}`}
                    onClick={() => setFocused(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.07] transition-all group"
                  >
                    <img
                      src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-11 h-16 rounded-lg object-cover flex-shrink-0 border border-border-subtle group-hover:border-accent-primary/40 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-accent-glow line-clamp-1 transition-colors">
                        {anime.title_english || anime.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                        <span>{anime.type || 'Anime'}</span>
                        {anime.year && <span>• {anime.year}</span>}
                        {anime.episodes ? <span>• {anime.episodes} eps</span> : null}
                      </div>
                    </div>
                    {anime.score ? (
                      <div className="flex items-center gap-1 text-xs font-mono font-semibold text-accent-amber px-2 py-1 rounded bg-accent-amber/10 border border-accent-amber/20">
                        <Star className="w-3 h-3 fill-accent-amber" />
                        <span>{anime.score.toFixed(1)}</span>
                      </div>
                    ) : null}
                  </Link>
                ))}
              </div>
              <Link
                to={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setFocused(false)}
                className="block text-center text-sm font-medium text-accent-glow hover:bg-accent-primary/10 py-2.5 mt-1.5 rounded-xl border-t border-border-subtle transition-colors"
              >
                See all results for "{query.trim()}" →
              </Link>
            </>
          ) : (
            <div className="py-6 text-center text-xs text-text-muted">
              No direct matches found. Press Enter to browse full catalog for "{query.trim()}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
