import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { portfolioData } from "./portfolio";
import siteData from "./site.json";
import coursesData from "./courses.json";
import { blogPosts as blogSeed } from "./blogData";
import { workCategories } from "./workCategories";
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
    category: workCategories.includes(item?.category) ? item.category : "",
    caseStudyImages: Array.isArray(item?.caseStudyImages)
      ? item.caseStudyImages
          .filter((image) => typeof image === "string")
          .map((image) => image.slice(0, 2000))
          .filter(Boolean)
          .slice(0, 40)
      : [],
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
      featured: Boolean(item?.featured),
    };
  });
}

function normalizeBlog(list) {
  if (!Array.isArray(list)) return [];
  const posts = list.map((item, index) => {
    const title = String(item?.title ?? "").slice(0, 200);
    return {
      id: Number(item?.id) || index + 1,
      slug: String(item?.slug || slugify(title) || `post-${index + 1}`).slice(
        0,
        120,
      ),
      title,
      excerpt: String(item?.excerpt ?? "").slice(0, 600),
      body: String(item?.body ?? "").slice(0, 20000),
      author: String(item?.author ?? "Sammy").slice(0, 80),
      date: String(item?.date ?? "").slice(0, 40),
      img: String(item?.img ?? item?.image ?? ""),
      featured: Boolean(item?.featured),
    };
  });

  // Keep at most one featured post (first wins in list order).
  let featuredSeen = false;
  return posts.map((post) => {
    if (!post.featured) return post;
    if (featuredSeen) return { ...post, featured: false };
    featuredSeen = true;
    return post;
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
    caseStudyImages: work.caseStudyImages.map(displayImage),
  }));
}

function paintBlog(posts) {
  return posts.map((post) => ({
    ...post,
    img: displayImage(post.img),
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
      const img = isFirestoreImage(work.img) && !displayImage(work.img)
        ? await resolveImage(work.img)
        : "";
      const caseStudyImages = await Promise.all(
        work.caseStudyImages.map((image) =>
          isFirestoreImage(image) && !displayImage(image)
            ? resolveImage(image)
            : Promise.resolve(""),
        ),
      );
      if (cancelled()) return;
      setWorks((prev) =>
        prev.map((item) =>
          item.id === work.id
            ? {
                ...item,
                ...(img ? { img } : {}),
                caseStudyImages: item.caseStudyImages.map(
                  (image, index) => caseStudyImages[index] || image,
                ),
              }
            : item,
        ),
      );
    }),
  );
}

async function fillBlog(raw, setBlogPosts, cancelled) {
  await Promise.all(
    raw.map(async (post) => {
      if (!isFirestoreImage(post.img)) return;
      if (displayImage(post.img)) return;
      const url = await resolveImage(post.img);
      if (cancelled() || !url) return;
      setBlogPosts((prev) =>
        prev.map((item) =>
          item.id === post.id ? { ...item, img: url } : item,
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
      caseStudyImages: await Promise.all(
        work.caseStudyImages.map(
          async (image) =>
            (await resolveImage(image)) || displayImage(image) || "",
        ),
      ),
    })),
  );
}

async function hydrateBlog(posts) {
  return Promise.all(
    posts.map(async (post) => ({
      ...post,
      img: (await resolveImage(post.img)) || displayImage(post.img) || "",
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
      caseStudyImages: await Promise.all(
        work.caseStudyImages.map((image) =>
          image.startsWith("/uploads/") ? uploadLocalPath(image) : image,
        ),
      ),
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
  return Promise.all(
    works.map(async (work) => ({
      ...work,
      img: await persistImageField(work.img),
      caseStudyImages: await Promise.all(
        work.caseStudyImages.map(persistImageField),
      ),
    })),
  );
}

async function packBlogForCloud(posts) {
  const items = [];
  for (const post of posts) {
    items.push({
      ...post,
      img: await persistImageField(post.img),
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
  const [worksSnap, siteSnap, coursesSnap, blogSnap] = await Promise.all([
    getDoc(doc(db, "content", "works")),
    getDoc(doc(db, "content", "site")),
    getDoc(doc(db, "content", "courses")),
    getDoc(doc(db, "content", "blog")),
  ]);
  return { worksSnap, siteSnap, coursesSnap, blogSnap };
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
  const [blogPosts, setBlogPosts] = useState(() =>
    cloud ? [] : normalizeBlog(blogSeed),
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
        const { worksSnap, siteSnap, coursesSnap, blogSnap } = await readCloud();
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
        const cloudBlog = blogSnap.exists() ? blogSnap.data().items : null;
        const rawBlog =
          Array.isArray(cloudBlog) && cloudBlog.length
            ? normalizeBlog(cloudBlog)
            : normalizeBlog(blogSeed);

        setWorks(paintWorks(rawWorks));
        setSite(paintSite(rawSite));
        setCourses(rawCourses);
        setBlogPosts(paintBlog(rawBlog));
        setReady(true);

        await Promise.all([
          fillWorks(rawWorks, setWorks, isCancelled),
          fillSite(rawSite, setSite, isCancelled),
          fillBlog(rawBlog, setBlogPosts, isCancelled),
        ]);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setWorks(normalizeWorks(portfolioData));
          setSite(normalizeSite(siteData));
          setCourses(normalizeCourses(coursesData));
          setBlogPosts(normalizeBlog(blogSeed));
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
    setWorks(paintWorks(packed));
    fillWorks(packed, setWorks, () => false).catch(console.error);
  }

  async function saveCourses(next) {
    if (!db) throw new Error("Firebase is not set up.");
    if (!auth?.currentUser) throw new Error("Sign in to the admin before saving.");
    const packed = normalizeCourses(next);
    await setDoc(doc(db, "content", "courses"), { items: packed });
    setCourses(packed);
  }

  async function saveBlogPosts(next) {
    if (!db) throw new Error("Firebase is not set up.");
    if (!auth?.currentUser) throw new Error("Sign in to the admin before saving.");
    const packed = await packBlogForCloud(normalizeBlog(next));
    await setDoc(doc(db, "content", "blog"), { items: packed });
    setBlogPosts(await hydrateBlog(packed));
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

    const { worksSnap, siteSnap, coursesSnap, blogSnap } = await readCloud();

    const cloudBlog = blogSnap.exists() ? blogSnap.data().items : null;
    if (!Array.isArray(cloudBlog) || cloudBlog.length === 0) {
      const packedBlog = await packBlogForCloud(normalizeBlog(blogSeed));
      await setDoc(doc(db, "content", "blog"), { items: packedBlog });
      setBlogPosts(await hydrateBlog(packedBlog));
    } else {
      const rawBlog = normalizeBlog(cloudBlog);
      setBlogPosts(paintBlog(rawBlog));
      await fillBlog(rawBlog, setBlogPosts, () => false);
    }

    if (!coursesSnap.exists()) {
      const packedCourses = normalizeCourses(coursesData);
      await setDoc(doc(db, "content", "courses"), { items: packedCourses });
      setCourses(packedCourses);
    } else {
      const rawCourses = normalizeCourses(coursesSnap.data().items);
      setCourses(rawCourses);
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
        blogPosts,
        saveBlogPosts,
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
