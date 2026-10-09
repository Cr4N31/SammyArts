import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function firebaseConfigured() {
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.messagingSenderId &&
    config.appId,
  );
}

const app = firebaseConfigured()
  ? getApps().length
    ? getApps()[0]
    : initializeApp(config)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export const adminEmail = String(
  import.meta.env.VITE_ADMIN_EMAIL || "sammyarts@gmail.com",
)
  .trim()
  .toLowerCase();
