import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "courseRatings";

function clean(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function toRating(id, data) {
  return {
    id,
    courseSlug: String(data.courseSlug || ""),
    rating: Number(data.rating),
    name: String(data.name || ""),
    review: String(data.review || ""),
    createdAt: data.createdAt?.toDate?.() || null,
  };
}

export async function listCourseRatings(courseSlugs) {
  if (!db) return [];

  const slugs = [...new Set(courseSlugs.map((slug) => clean(slug, 120)))].filter(
    Boolean,
  );
  const batches = [];

  for (let index = 0; index < slugs.length; index += 30) {
    batches.push(slugs.slice(index, index + 30));
  }

  const snapshots = await Promise.all(
    batches.map((batch) =>
      getDocs(
        query(
          collection(db, COLLECTION),
          where("courseSlug", "in", batch),
        ),
      ),
    ),
  );

  return snapshots
    .flatMap((snapshot) =>
      snapshot.docs.map((item) => toRating(item.id, item.data())),
    )
    .filter(
      (item) =>
        Number.isInteger(item.rating) &&
        item.rating >= 1 &&
        item.rating <= 5 &&
        item.courseSlug &&
        item.name,
    )
    .sort(
      (a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    );
}

export async function submitCourseRating({
  courseSlug,
  rating,
  name,
  review,
}) {
  if (!db) throw new Error("Ratings are unavailable because Firebase is not set up.");

  const payload = {
    courseSlug: clean(courseSlug, 120),
    rating: Number(rating),
    name: clean(name, 80),
    review: clean(review, 1000),
  };

  if (!payload.courseSlug) throw new Error("This course cannot be rated yet.");
  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    throw new Error("Choose a rating from 1 to 5 stars.");
  }
  if (!payload.name) throw new Error("Enter your name to submit a rating.");

  const item = await addDoc(collection(db, COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return {
    id: item.id,
    ...payload,
    createdAt: new Date(),
  };
}
