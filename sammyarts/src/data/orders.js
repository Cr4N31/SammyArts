import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export async function listOrders() {
  if (!db) throw new Error("Firebase is not set up.");
  if (!auth?.currentUser) throw new Error("Sign in to the admin first.");

  let snap;
  try {
    snap = await getDocs(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
    );
  } catch {
    snap = await getDocs(collection(db, "orders"));
  }

  return snap.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        checkoutId: String(data.checkoutId || item.id),
        name: String(data.name || ""),
        email: String(data.email || ""),
        courseId: String(data.courseId || ""),
        courseSlug: String(data.courseSlug || ""),
        courseTitle: String(data.courseTitle || ""),
        courseType: data.courseType === "mentorship" ? "mentorship" : "course",
        billing: String(data.billing || ""),
        amount: String(data.amount || ""),
        currency: String(data.currency || "NGN"),
        status: String(data.status || "paid"),
        createdAt: data.createdAt?.toDate?.() || null,
      };
    })
    .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
}

export async function deleteOrder(id) {
  if (!db) throw new Error("Firebase is not set up.");
  if (!auth?.currentUser) throw new Error("Sign in to the admin first.");
  await deleteDoc(doc(db, "orders", id));
}
