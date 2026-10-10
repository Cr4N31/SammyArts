import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { portfolioData } from "./portfolio";
import siteData from "./site.json";
import coursesData from "./courses.json";
import { ContentContext } from "./content";
import { auth, db, firebaseConfigured } from "./firebase";
import {
  displayImage,
  isFirestoreImage,
  persistImageField,
  resolveImage,
  uploadLocalPath,
} from "../admin/upload";

const HERO_KEYS = [
  "Image 1",
  "Image 2",
  "Image 3",
  "Image 4",
  "Image 5",
  "Image 6",
  "Image 7",
  "Image 8",
  "Image 9",
];

function normalizeWorks(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => ({
    id: Number(item?.id) || index + 1,
    title: String(item?.title ?? "").slice(0, 140),
    desc: String(item?.desc ?? "").slice(0, 600),
    img: String(item?.img ?? ""),
    medium: item?.medium ? String(item.medium).slice(0, 80) : "",
    year: item?.year ?? "",
  }));
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function normalizeCourses(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => {
    const title = String(item?.title ?? "").slice(0, 140);
    return {
      id: Number(item?.id) || index + 1,
      slug: String(item?.slug || slugify(title) || `course-${index + 1}`).slice(
        0,
        120,
      ),
      type: item?.type === "mentorship" ? "mentorship" : "course",
      title,
      level: String(item?.level ?? "").slice(0, 40),
      duration: String(item?.duration ?? "").slice(0, 40),
      lessons: Number(item?.lessons) || 0,
      price: Number(item?.price) || 0,
      billing: String(item?.billing ?? "one-time").slice(0, 40),
      desc: String(item?.desc ?? "").slice(0, 600),
      img: String(item?.img ?? item?.image ?? ""),
      featured: Boolean(item?.featured),
    };
  });
}

function normalizeSite(data) {
  const hero = {};
  for (const key of HERO_KEYS) {
    hero[key] = String(data?.hero?.[key] ?? "");
  }
  return {
    ceo: String(data?.ceo ?? ""),
    hero,
  };
}

function paintWorks(works) {
  return works.map((work) => ({
    ...work,
    img: displayImage(work.img),
  }));
}

function paintCourses(courses) {
  return courses.map((course) => ({
    ...course,
    img: displayImage(course.img),
  }));
}

function paintSite(site) {
  const hero = {};
  for (const key of HERO_KEYS) {
    hero[key] = displayImage(site.hero[key]);
  }
  return {
    ceo: displayImage(site.ceo),
    hero,
  };
}

async function fillWorks(raw, setWorks, cancelled) {
  await Promise.all(
    raw.map(async (work) => {
      if (!isFirestoreImage(work.img)) return;
      if (displayImage(work.img)) return;
      const url = await resolveImage(work.img);
      if (cancelled() || !url) return;
      setWorks((prev) =>
        prev.map((item) =>
          item.id === work.id ? { ...item, img: url } : item,
        ),
      );
    }),
  );
}

async function fillCourses(raw, setCourses, cancelled) {
  await Promise.all(
    raw.map(async (course) => {
      if (!isFirestoreImage(course.img)) return;
      if (displayImage(course.img)) return;
      const url = await resolveImage(course.img);
      if (cancelled() || !url) return;
      setCourses((prev) =>
        prev.map((item) =>
          item.id === course.id ? { ...item, img: url } : item,
        ),
      );
    }),
  );
}

async function fillSite(raw, setSite, cancelled) {
  const jobs = [];

  if (isFirestoreImage(raw.ceo) && !displayImage(raw.ceo)) {
    jobs.push(
      resolveImage(raw.ceo).then((url) => {
        if (cancelled() || !url) return;
        setSite((prev) => ({ ...prev, ceo: url }));
      }),
    );
  }

  for (const key of HERO_KEYS) {
    const ref = raw.hero[key];
    if (!isFirestoreImage(ref) || displayImage(ref)) continue;
    jobs.push(
      resolveImage(ref).then((url) => {
        if (cancelled() || !url) return;
        setSite((prev) => ({
          ...prev,
          hero: { ...prev.hero, [key]: url },
        }));
      }),
    );
  }

  await Promise.all(jobs);
}

async function hydrateWorks(works) {
  return Promise.all(
    works.map(async (work) => ({
      ...work,
      img: (await resolveImage(work.img)) || displayImage(work.img) || "",
    })),
  );
}

async function hydrateCourses(courses) {
  return Promise.all(
    courses.map(async (course) => ({
      ...course,
      img: (await resolveImage(course.img)) || displayImage(course.img) || "",
    })),
  );
}

async function hydrateSite(site) {
  const hero = {};
  for (const key of HERO_KEYS) {
    hero[key] =
      (await resolveImage(site.hero[key])) || displayImage(site.hero[key]) || "";
  }
  return {
    ceo: (await resolveImage(site.ceo)) || displayImage(site.ceo) || "",
    hero,
  };
}

async function migrateLocalImages(works, site) {
  const nextWorks = [];
  for (const work of works) {
    nextWorks.push({
      ...work,
      img: work.img?.startsWith("/uploads/")
        ? await uploadLocalPath(work.img)
        : work.img,
    });
  }

  const nextHero = { ...site.hero };
  for (const key of HERO_KEYS) {
    if (nextHero[key]?.startsWith("/uploads/")) {
      nextHero[key] = await uploadLocalPath(nextHero[key]);
    }
  }

  const ceo = site.ceo?.startsWith("/uploads/")
    ? await uploadLocalPath(site.ceo)
    : site.ceo;

  return {
    works: nextWorks,
    site: { ceo, hero: nextHero },
  };
}

async function packWorksForCloud(works) {
  const items = [];
  for (const work of works) {
    items.push({
      ...work,
      img: await persistImageField(work.img),
    });
  }
  return items;
}

async function packCoursesForCloud(courses) {
  const items = [];
  for (const course of courses) {
    items.push({
      ...course,
      img: await persistImageField(course.img),
    });
  }
  return items;
}

async function packSiteForCloud(site) {
  const hero = {};
  for (const key of HERO_KEYS) {
    hero[key] = await persistImageField(site.hero?.[key] || "");
  }
  return {
    ceo: await persistImageField(site.ceo || ""),
    hero,
  };
}

async function readCloud() {
  const [worksSnap, siteSnap, coursesSnap] = await Promise.all([
    getDoc(doc(db, "content", "works")),
    getDoc(doc(db, "content", "site")),
    getDoc(doc(db, "content", "courses")),
  ]);
  return { worksSnap, siteSnap, coursesSnap };
}

const emptySite = () => normalizeSite({ ceo: "", hero: {} });

export function ContentProvider({ children }) {
  const cloud = firebaseConfigured();
  const [works, setWorks] = useState(() =>
    cloud ? [] : normalizeWorks(portfolioData),
  );
  const [courses, setCourses] = useState(() =>
    cloud ? [] : normalizeCourses(coursesData),
  );
  const [site, setSite] = useState(() =>
    cloud ? emptySite() : normalizeSite(siteData),
  );
  const [ready, setReady] = useState(!cloud);

  useEffect(() => {
    if (!db) return undefined;

    let cancelled = false;
    const isCancelled = () => cancelled;

    async function load() {
      try {
        const { worksSnap, siteSnap, coursesSnap } = await readCloud();
        if (cancelled) return;

        const rawWorks = worksSnap.exists()
          ? normalizeWorks(worksSnap.data().items)
          : normalizeWorks(portfolioData);
        const rawSite = siteSnap.exists()
          ? normalizeSite(siteSnap.data())
          : normalizeSite(siteData);
        const rawCourses = coursesSnap.exists()
          ? normalizeCourses(coursesSnap.data().items)
          : normalizeCourses(coursesData);

        setWorks(paintWorks(rawWorks));
        setSite(paintSite(rawSite));
        setCourses(paintCourses(rawCourses));
        setReady(true);

        await Promise.all([
          fillWorks(rawWorks, setWorks, isCancelled),
          fillSite(rawSite, setSite, isCancelled),
          fillCourses(rawCourses, setCourses, isCancelled),
        ]);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setWorks(normalizeWorks(portfolioData));
          setSite(normalizeSite(siteData));
          setCourses(normalizeCourses(coursesData));
          setReady(true);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveWorks(next) {
    if (!db) throw new Error("Firebase is not set up.");
    if (!auth?.currentUser) throw new Error("Sign in to the admin before saving.");
    const packed = await packWorksForCloud(normalizeWorks(next));
    await setDoc(doc(db, "content", "works"), { items: packed });
    setWorks(await hydrateWorks(packed));
  }

  async function saveCourses(next) {
    if (!db) throw new Error("Firebase is not set up.");
    if (!auth?.currentUser) throw new Error("Sign in to the admin before saving.");
    const packed = await packCoursesForCloud(normalizeCourses(next));
    await setDoc(doc(db, "content", "courses"), { items: packed });
    setCourses(await hydrateCourses(packed));
  }

  async function saveSite(next) {
    if (!db) throw new Error("Firebase is not set up.");
    if (!auth?.currentUser) throw new Error("Sign in to the admin before saving.");
    const packed = await packSiteForCloud(normalizeSite(next));
    await setDoc(doc(db, "content", "site"), packed);
    setSite(await hydrateSite(packed));
  }

  async function seedIfNeeded() {
    if (!db || !auth?.currentUser) return;

    const { worksSnap, siteSnap, coursesSnap } = await readCloud();

    if (!coursesSnap.exists()) {
      const packedCourses = await packCoursesForCloud(
        normalizeCourses(coursesData),
      );
      await setDoc(doc(db, "content", "courses"), { items: packedCourses });
      setCourses(await hydrateCourses(packedCourses));
    } else {
      const rawCourses = normalizeCourses(coursesSnap.data().items);
      setCourses(paintCourses(rawCourses));
      await fillCourses(rawCourses, setCourses, () => false);
    }

    if (worksSnap.exists() && siteSnap.exists()) {
      const rawWorks = normalizeWorks(worksSnap.data().items);
      const rawSite = normalizeSite(siteSnap.data());
      setWorks(paintWorks(rawWorks));
      setSite(paintSite(rawSite));
      await Promise.all([
        fillWorks(rawWorks, setWorks, () => false),
        fillSite(rawSite, setSite, () => false),
      ]);
      return;
    }

    const baseWorks = worksSnap.exists()
      ? normalizeWorks(worksSnap.data().items)
      : normalizeWorks(portfolioData);
    const baseSite = siteSnap.exists()
      ? normalizeSite(siteSnap.data())
      : normalizeSite(siteData);

    const migrated = await migrateLocalImages(baseWorks, baseSite);
    const packedWorks = await packWorksForCloud(migrated.works);
    const packedSite = await packSiteForCloud(migrated.site);
    await Promise.all([
      setDoc(doc(db, "content", "works"), { items: packedWorks }),
      setDoc(doc(db, "content", "site"), packedSite),
    ]);
    setWorks(await hydrateWorks(packedWorks));
    setSite(await hydrateSite(packedSite));
  }

  useEffect(() => {
    if (!auth || !db) return undefined;
    return onAuthStateChanged(auth, (user) => {
      if (user) seedIfNeeded().catch(console.error);
    });
  }, []);

  return (
    <ContentContext.Provider
      value={{
        works,
        saveWorks,
        courses,
        saveCourses,
        site,
        saveSite,
        ready,
        seedIfNeeded,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}
