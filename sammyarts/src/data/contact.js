import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

function clean(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

export async function sendContactMessage({ name, email, message }) {
  if (!db) throw new Error("Firebase is not set up.");

  const payload = {
    name: clean(name, 120),
    email: clean(email, 160),
    message: clean(message, 2000),
    createdAt: serverTimestamp(),
  };

  if (!payload.name || !payload.email || !payload.message) {
    throw new Error("Fill in every field.");
  }

  await addDoc(collection(db, "messages"), payload);
}

export async function listContactMessages() {
  if (!db) throw new Error("Firebase is not set up.");
  if (!auth?.currentUser) throw new Error("Sign in to the admin first.");

  const snap = await getDocs(
    query(collection(db, "messages"), orderBy("createdAt", "desc")),
  );

  return snap.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      name: String(data.name || ""),
      email: String(data.email || ""),
      message: String(data.message || ""),
      createdAt: data.createdAt?.toDate?.() || null,
    };
  });
}

export async function deleteContactMessage(id) {
  if (!db) throw new Error("Firebase is not set up.");
  if (!auth?.currentUser) throw new Error("Sign in to the admin first.");
  await deleteDoc(doc(db, "messages", id));
}
