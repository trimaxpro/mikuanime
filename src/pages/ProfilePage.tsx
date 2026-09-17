import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { AnimeCard } from '@/components/ui/AnimeCard';
import { useUserStore } from '@/stores/userStore';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { SEO } from '@/components/common/SEO';
import { BookmarkPlus, Edit3, Star, List, Play, CheckCircle, Eye, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { WatchlistStatus } from '@/types/user';

const STATUS_TABS: { value: WatchlistStatus; label: string; icon: typeof Play }[] = [
  { value: 'watching', label: 'Watching', icon: Eye },
  { value: 'plan_to_watch', label: 'Plan to Watch', icon: Star },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'dropped', label: 'Dropped', icon: List },
  { value: 'on_hold', label: 'On Hold', icon: Clock },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<WatchlistStatus>('watching');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const preferences = useUserStore((s) => s.preferences);
  const setDisplayName = useUserStore((s) => s.setDisplayName);
  const { getWatchlistByStatus } = useWatchlist();

  const filteredWatchlist = getWatchlistByStatus(statusFilter);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <PageWrapper className="pt-24 pb-12 px-4">
      <SEO noindex title="My Watchlist — MikuAnime" description="Your saved anime watchlist, statuses and watch history on MikuAnime." />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {(() => {
            const name = preferences.displayName || user?.email || 'U';
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
            const key = user?.uid || '';
            for (let i = 0; i < key.length; i++) {
              hash = key.charCodeAt(i) + ((hash << 5) - hash);
            }
            const colorClass = colors[Math.abs(hash) % colors.length];
            return (
              <div
                className={`w-16 h-16 rounded-card flex items-center justify-center text-2xl font-display font-bold shadow-glow-sm flex-shrink-0 select-none ${colorClass}`}
              >
                {initial}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-elevated border border-border-subtle rounded-input px-3 py-1.5 text-lg text-text-primary focus:outline-none focus:border-accent-primary"
                />
                <Button variant="ghost" size="sm" onClick={handleNameSave}>Save</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-text-primary">{preferences.displayName}</h1>
                <button
                  onClick={() => { setNameInput(preferences.displayName); setEditingName(true); }}
                  className="text-text-muted hover:text-accent-glow transition-colors"
                >
                  <Edit3 className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            )}
            <p className="text-xs text-text-muted mt-1">Your Anime Collection</p>
          </div>
        </div>

        <div className="border-b border-border-subtle mb-6 pb-2">
          <h2 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-accent-glow" />
            Watchlist
          </h2>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {STATUS_TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-card text-xs font-body font-medium transition-all flex-shrink-0 inline-flex items-center gap-1.5',
                    statusFilter === tab.value
                      ? 'bg-accent-primary/20 text-accent-glow border border-accent-primary/30'
                      : 'bg-elevated text-text-secondary border border-border-subtle hover:border-border-glow hover:text-text-primary',
                  )}
                >
                  <TabIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          {filteredWatchlist.length === 0 ? (
            <EmptyState
              icon={BookmarkPlus}
              title="No anime here"
              message={statusFilter === 'watching' ? 'Your watchlist is empty. Start browsing!' : `No anime in ${STATUS_TABS.find((t) => t.value === statusFilter)?.label}`}
              actionLabel="Add Anime"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredWatchlist.map((entry) => (
                <AnimeCard
                  key={entry.malId}
                  anime={{
                    mal_id: entry.malId,
                    title: entry.title,
                    title_english: entry.title,
                    title_japanese: null,
                    images: { jpg: { image_url: entry.image, large_image_url: entry.image }, webp: { image_url: entry.image, large_image_url: entry.image } },
                    type: null, episodes: null, status: null, score: null, scored_by: null, rank: null, popularity: null,
                    members: null, favorites: null, synopsis: null, season: null, year: null,
                    aired: { from: null, to: null, string: '' }, broadcast: null,
                    studios: [], genres: [], themes: [], source: null, rating: null, duration: null,
                    trailer: null, relations: [],
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
