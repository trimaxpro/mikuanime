import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBD0qX5IzU3WZL6VCk0w0jpwseiiA3l02A',
  authDomain: 'mikuanime-2adef.firebaseapp.com',
  projectId: 'mikuanime-2adef',
  storageBucket: 'mikuanime-2adef.firebasestorage.app',
  messagingSenderId: '355860873468',
  appId: '1:355860873468:web:9fd1b54903e5addc49d779',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

function initDb() {
  try {
    return getFirestore(app);
  } catch (e) {
    console.warn('Firestore initialization failed. Watchlist sync will be unavailable.', e);
    return null;
  }
}

export const db = initDb();
