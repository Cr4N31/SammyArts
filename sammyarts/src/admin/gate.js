import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { adminEmail, auth, firebaseConfigured } from "../data/firebase";

export function firebaseReady() {
  return firebaseConfigured() && Boolean(auth);
}

export function isAuthed() {
  return Boolean(auth?.currentUser);
}

export function watchAuth(callback) {
  if (!auth) {
    callback(false);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => callback(Boolean(user)));
}

export async function login(email, password) {
  if (!auth) {
    throw new Error("Firebase is not set up.");
  }

  const trimmed = String(email || "").trim().toLowerCase();
  if (adminEmail && trimmed !== adminEmail) {
    throw new Error("That account cannot open the admin.");
  }

  await signInWithEmailAndPassword(auth, trimmed, password);
  return true;
}

export async function logout() {
  if (!auth) return;
  await signOut(auth);
}
