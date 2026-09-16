import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Home, Globe, Calendar, LogIn, BookmarkPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/hooks/useAuth';
import type { Anime } from '@/types/anime';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Browse', icon: Globe },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const { data: searchResults } = useSearch(debouncedQuery, 1);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = () => {
      const isScrolled = window.scrollY > 60;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileSearch('');
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-void/80 backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-card overflow-hidden border border-border-subtle shadow-glow-sm flex-shrink-0 bg-void group-hover:border-accent-primary/40 transition-all duration-300">
              <img src="/logo.gif" alt="MikuAnime Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-[21px] sm:text-[23px] leading-tight tracking-tight">
              <span className="text-accent-glow">Miku</span><span className="text-text-primary">Anime</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-surface/60 backdrop-blur-md border border-border-subtle/80 shadow-sm">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'group relative flex items-center gap-2 px-4 py-1.5 rounded-full text-[14.5px] font-body transition-all duration-200',
                    isActive
                      ? 'text-accent-glow bg-accent-primary/15 border border-accent-primary/30 shadow-glow-sm font-semibold'
                      : 'text-text-secondary hover:text-accent-glow hover:bg-white/[0.06] border border-transparent font-medium',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-[17px] h-[17px] stroke-[1.65] transition-all duration-200 group-hover:scale-105',
                      isActive && 'drop-shadow-[0_0_8px_rgba(108,217,224,0.5)]',
                    )}
                  />
                  <span className="tracking-[0.015em]">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div ref={searchContainerRef} className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ opacity: 0, scale: 0.96, x: 8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: 8 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onSubmit={handleSearch}
                    className="absolute right-0 sm:right-[calc(100%+8px)] top-full sm:top-1/2 mt-2 sm:mt-0 sm:-translate-y-1/2 z-40 w-[calc(100vw-32px)] sm:w-80 md:w-96 origin-top-right sm:origin-right"
                  >
                    <div className="relative flex items-center">
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anime title, ID, genre..."
                        className="w-full bg-surface/98 backdrop-blur-md border border-border-subtle rounded-xl pl-3.5 pr-8 py-2.5 sm:py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/40 shadow-2xl"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {searchOpen && searchQuery.trim().length > 0 && searchResults?.data && searchResults.data.length > 0 && (
                <div className="absolute right-0 sm:right-[calc(100%+8px)] top-[calc(100%+52px)] sm:top-full mt-2 w-[calc(100vw-32px)] sm:w-80 md:w-96 bg-surface/98 backdrop-blur-md rounded-2xl p-2.5 z-50 max-h-[440px] overflow-y-auto shadow-2xl border border-border-subtle animate-in fade-in-50 zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted flex items-center justify-between">
                    <span>Quick Matches</span>
                    <span className="text-accent-glow font-mono text-[10px]">Unrestricted</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.data.slice(0, 8).map((anime: Anime) => (
                      <Link
                        key={anime.mal_id}
                        to={`/anime/${anime.mal_id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.07] transition-all group"
                      >
                        <img
                          src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
                          alt=""
                          className="w-10 h-14 rounded-lg object-cover flex-shrink-0 border border-border-subtle group-hover:border-accent-primary/40 transition-colors"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary group-hover:text-accent-glow line-clamp-1 transition-colors">
                            {anime.title_english || anime.title}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {anime.type || 'Anime'} {anime.year && `• ${anime.year}`}
                          </p>
                        </div>
                        {anime.score ? (
                          <span className="text-xs font-mono font-semibold text-accent-amber px-1.5 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/20">
                            {anime.score.toFixed(1)}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="block text-center text-xs font-medium text-accent-glow hover:bg-accent-primary/10 py-2.5 mt-2 rounded-xl border-t border-border-subtle transition-colors"
                  >
                    View all results for "{searchQuery}" →
                  </Link>
                </div>
              )}

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={cn('w-9 h-9 rounded-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-all', searchOpen && 'bg-elevated text-accent-glow shadow-glow-sm')}
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5 stroke-[1.5]" />
              </button>
            </div>

            <AuthNav />

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-all relative z-20"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-64 bg-surface border-l border-border-subtle z-50 p-6"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-elevated transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>

              <form onSubmit={handleMobileSearch} className="relative mt-8 mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-glow stroke-[1.8]" />
                <input
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Search anime..."
                  className="w-full bg-elevated/80 border border-border-subtle rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
                />
              </form>

              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-card text-[14.5px] font-body transition-all',
                        location.pathname === link.to
                          ? 'text-accent-glow bg-accent-primary/15 border border-accent-primary/30 shadow-glow-sm font-semibold'
                          : 'text-text-secondary hover:text-accent-glow hover:bg-elevated font-medium',
                      )}
                    >
                      <Icon className="w-[18px] h-[18px] stroke-[1.65]" />
                      <span className="tracking-[0.015em]">{link.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/watchlist"
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-card text-[14.5px] font-body transition-all',
                    location.pathname === '/watchlist'
                      ? 'text-accent-glow bg-accent-primary/15 border border-accent-primary/30 shadow-glow-sm font-semibold'
                      : 'text-text-secondary hover:text-accent-glow hover:bg-elevated font-medium',
                  )}
                >
                  <BookmarkPlus className="w-[18px] h-[18px] stroke-[1.65]" />
                  <span className="tracking-[0.015em]">Watchlist</span>
                </Link>

                <div className="pt-3 mt-3 border-t border-border-subtle/80">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <div className="px-3.5 py-1 text-xs text-text-muted truncate">
                        Signed in as <span className="text-text-primary font-medium">{user.displayName || user.email}</span>
                      </div>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-card text-xs font-medium text-accent-rose hover:bg-accent-rose/10 transition-colors"
                      >
                        <LogIn className="w-4 h-4 rotate-180" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-display font-semibold uppercase tracking-wider text-white bg-accent-primary hover:bg-[#2bf7dd] shadow-glow-sm transition-all"
                    >
                      <LogIn className="w-4 h-4 stroke-[2]" />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function AuthNav() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="w-9 h-9" />;

  if (!user) {
    return (
      <Link
        to="/signin"
        className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-display font-semibold uppercase tracking-wider text-white bg-accent-primary hover:bg-[#2bf7dd] shadow-glow-sm hover:shadow-glow transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <LogIn className="w-3.5 h-3.5 stroke-[2]" />
        Sign In
      </Link>
    );
  }

  return (
    <div className="hidden md:relative md:flex">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-elevated border border-border-subtle flex items-center justify-center overflow-hidden text-text-secondary hover:text-text-primary hover:border-border-glow transition-all"
        aria-label="Profile"
      >
        {(() => {
          const name = user.displayName || user.email || 'U';
          const initial = name.charAt(0).toUpperCase();
          const colors = [
            'bg-blue-600 text-white',
            'bg-violet-600 text-white',
            'bg-indigo-600 text-white',
            'bg-fuchsia-600 text-white',
            'bg-rose-600 text-white',
            'bg-emerald-600 text-white',
            'bg-amber-600 text-black',
            'bg-cyan-600 text-white',
          ];
          let hash = 0;
          const key = user.uid || '';
          for (let i = 0; i < key.length; i++) {
            hash = key.charCodeAt(i) + ((hash << 5) - hash);
          }
          const colorClass = colors[Math.abs(hash) % colors.length];
          return (
            <div className={`w-full h-full flex items-center justify-center font-display font-bold text-sm select-none ${colorClass}`}>
              {initial}
            </div>
          );
        })()}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface rounded-card p-2 z-50 shadow-xl border border-border-subtle">
            <div className="px-3 py-2 text-sm text-text-primary font-medium truncate border-b border-border-subtle mb-1">
              {user.displayName || user.email}
            </div>
            <Link to="/watchlist" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-input text-sm text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors">
              <BookmarkPlus className="w-4 h-4 stroke-[1.5]" /> My Lists
            </Link>
            <button onClick={() => { logout(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-input text-sm text-accent-rose hover:bg-accent-rose/10 transition-colors mt-1">
              <LogIn className="w-4 h-4 stroke-[1.5] rotate-180" /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
