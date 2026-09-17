import { useState, useEffect, createContext, useContext } from 'react';
import { loadAuth, loadDb } from '@/lib/firebase';
import { useUserStore } from '@/stores/userStore';
import type { User } from 'firebase/auth';
import type { WatchlistEntry } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { module, auth } = await loadAuth();
        if (!active) return;

        unsubscribe = module.onAuthStateChanged(auth, async (u) => {
          if (u) {
            setUser(u);
            setLoading(false);

            const dbState = await loadDb();
            if (dbState.db && dbState.module) {
              try {
                const snapshot = await dbState.module.getDocs(dbState.module.collection(dbState.db, 'users', u.uid, 'watchlist'));
                const list: WatchlistEntry[] = [];
                snapshot.forEach((doc) => {
                  list.push(doc.data() as WatchlistEntry);
                });
                useUserStore.getState().setWatchlist(list);
              } catch (e) {
                console.error('Error loading watchlist from Firestore:', e);
              }
            }
          } else {
            setUser(null);
            setLoading(false);
            useUserStore.getState().setWatchlist([]);
          }
        });
      } catch (e) {
        console.error('Auth failed to initialize:', e);
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { module, auth } = await loadAuth();
    await module.signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const { module, auth } = await loadAuth();
    const cred = await module.createUserWithEmailAndPassword(auth, email, password);
    await module.updateProfile(cred.user, { displayName });
  };

  const signInWithGoogle = async () => {
    const { module, auth } = await loadAuth();
    await module.signInWithPopup(auth, new module.GoogleAuthProvider());
  };

  const sendVerificationEmail = async () => {
    // No-op kept for interface compatibility
  };

  const reloadUser = async () => {
    const { auth } = await loadAuth();
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  const logout = async () => {
    const { module, auth } = await loadAuth();
    await module.signOut(auth);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, signInWithGoogle, sendVerificationEmail, reloadUser, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}