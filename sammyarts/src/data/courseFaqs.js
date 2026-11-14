import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const defaultCourseFaqs = [
  {
    question: "How long will I have access to a course?",
    answer:
      "Course duration and access information are shown in each course's overview. You can review those details before enrolling.",
  },
  {
    question: "Do I get a certificate after completion?",
    answer:
      "Yes. A certificate of completion is available after you successfully complete your course.",
  },
  {
    question: "Can I learn offline?",
    answer:
      "Offline access depends on the course materials provided after enrollment. Check the course overview or contact us if you need help confirming access options.",
  },
  {
    question: "What support do I get during the course?",
    answer:
      "Support varies by course. For help with enrollment or access, contact SammyArts.",
  },
];

function normalizeFaqs(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      question: String(item?.question ?? "").trim().slice(0, 300),
      answer: String(item?.answer ?? "").trim().slice(0, 3000),
    }))
    .filter((item) => item.question)
    .slice(0, 50);
}

function faqDoc() {
  return doc(db, "content", "courseFaqs");
}

export async function getCourseFaqs() {
  if (!db) return defaultCourseFaqs;
  const snapshot = await getDoc(faqDoc());
  return snapshot.exists()
    ? normalizeFaqs(snapshot.data().items)
    : defaultCourseFaqs;
}

export async function saveCourseFaqs(list) {
  if (!db) throw new Error("Firebase is not set up.");
  const items = normalizeFaqs(list);
  await setDoc(faqDoc(), { items });
  return items;
}
