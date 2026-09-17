import { initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBD0qX5IzU3WZL6VCk0w0jpwseiiA3l02A',
  authDomain: 'mikuanime-2adef.firebaseapp.com',
  projectId: 'mikuanime-2adef',
  storageBucket: 'mikuanime-2adef.firebasestorage.app',
  messagingSenderId: '355860873468',
  appId: '1:355860873468:web:9fd1b54903e5addc49d779',
};

export const app = initializeApp(firebaseConfig);

export type AuthModule = typeof import('firebase/auth');
export type FirestoreModule = typeof import('firebase/firestore');

export interface AuthState {
  module: AuthModule;
  auth: Auth;
}

export interface DbState {
  module: FirestoreModule | null;
  db: Firestore | null;
}

let authStatePromise: Promise<AuthState> | null = null;
let dbStatePromise: Promise<DbState> | null = null;

/** Lazily loads firebase/auth so it stays out of the initial bundle. */
export function loadAuth(): Promise<AuthState> {
  authStatePromise ??= import('firebase/auth').then((module) => ({ module, auth: module.getAuth(app) }));
  return authStatePromise;
}

/** Lazily loads firebase/firestore so it stays out of the initial bundle. */
export function loadDb(): Promise<DbState> {
  dbStatePromise ??= import('firebase/firestore')
    .then((module) => {
      try {
        return { module, db: module.getFirestore(app) };
      } catch (e) {
        console.warn('Firestore initialization failed. Watchlist sync will be unavailable.', e);
        return { module, db: null };
      }
    })
    .catch((e) => {
      console.warn('Firestore initialization failed. Watchlist sync will be unavailable.', e);
      return { module: null, db: null };
    });
  return dbStatePromise;
}