import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loadAuth, loadDb } from '@/lib/firebase';
import type { Firestore } from 'firebase/firestore';
import type { FirestoreModule } from '@/lib/firebase';
import type { WatchlistEntry, WatchHistoryEntry, UserPreferences, WatchlistStatus } from '@/types/user';

interface UserState {
  preferences: UserPreferences;
  watchlist: WatchlistEntry[];
  watchHistory: WatchHistoryEntry[];
  setDisplayName: (name: string) => void;
  setAvatarColor: (color: string) => void;
  setWatchlist: (list: WatchlistEntry[]) => void;
  addToWatchlist: (entry: Omit<WatchlistEntry, 'addedAt'>) => void;
  removeFromWatchlist: (malId: number) => void;
  updateWatchlistStatus: (malId: number, status: WatchlistStatus) => void;
  addToHistory: (entry: Omit<WatchHistoryEntry, 'lastWatched'>) => void;
  updateProgress: (malId: number, episode: number, progress: number) => void;
  clearWatchHistory: () => void;
  isInWatchlist: (malId: number) => boolean;
  getWatchlistByStatus: (status: WatchlistStatus) => WatchlistEntry[];
}

/** Runs a Firestore write against the signed-in user's watchlist, loading firebase lazily. */
async function syncWatchlist(fn: (db: Firestore, userId: string, fs: FirestoreModule) => Promise<unknown>) {
  try {
    const [{ auth }, dbState] = await Promise.all([loadAuth(), loadDb()]);
    const user = auth.currentUser;
    if (!user || !dbState.db || !dbState.module) return;
    await fn(dbState.db, user.uid, dbState.module);
  } catch (err) {
    console.error('Failed to sync watchlist with Firestore:', err);
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      preferences: { displayName: 'Anime Fan', avatarColor: '#3B82F6' },
      watchlist: [],
      watchHistory: [],

      setDisplayName: (name) => set((s) => ({ preferences: { ...s.preferences, displayName: name } })),
      setAvatarColor: (color) => set((s) => ({ preferences: { ...s.preferences, avatarColor: color } })),

      setWatchlist: (list) => set({ watchlist: list }),

      addToWatchlist: (entry) => {
        const newEntry = { ...entry, addedAt: new Date().toISOString() };
        set((s) => ({
          watchlist: [...s.watchlist.filter((w) => w.malId !== entry.malId), newEntry],
        }));

        void syncWatchlist((db, userId, fs) =>
          fs.setDoc(fs.doc(db, 'users', userId, 'watchlist', String(entry.malId)), newEntry),
        );
      },

      removeFromWatchlist: (malId) => {
        set((s) => ({ watchlist: s.watchlist.filter((w) => w.malId !== malId) }));

        void syncWatchlist((db, userId, fs) =>
          fs.deleteDoc(fs.doc(db, 'users', userId, 'watchlist', String(malId))),
        );
      },

      updateWatchlistStatus: (malId, status) => {
        set((s) => ({
          watchlist: s.watchlist.map((w) => (w.malId === malId ? { ...w, status } : w)),
        }));

        const entry = get().watchlist.find((w) => w.malId === malId);
        if (!entry) return;
        void syncWatchlist((db, userId, fs) =>
          fs.setDoc(fs.doc(db, 'users', userId, 'watchlist', String(malId)), entry),
        );
      },

      addToHistory: (entry) =>
        set((s) => ({
          watchHistory: [
            { ...entry, lastWatched: new Date().toISOString() },
            ...s.watchHistory.filter((h) => !(h.malId === entry.malId && h.episode === entry.episode)),
          ].slice(0, 100),
        })),

      updateProgress: (malId, episode, progress) =>
        set((s) => ({
          watchHistory: s.watchHistory.map((h) =>
            h.malId === malId && h.episode === episode ? { ...h, progress, lastWatched: new Date().toISOString() } : h,
          ),
        })),

      clearWatchHistory: () => set({ watchHistory: [] }),

      isInWatchlist: (malId) => get().watchlist.some((w) => w.malId === malId),

      getWatchlistByStatus: (status) => get().watchlist.filter((w) => w.status === status),
    }),
    {
      name: 'aniverse-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        watchlist: state.watchlist,
        watchHistory: state.watchHistory,
      }),
    },
  ),
);