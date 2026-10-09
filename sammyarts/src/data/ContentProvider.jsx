import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { portfolioData } from "./portfolio";
import siteData from "./site.json";
import { ContentContext } from "./content";
import { auth, db, firebaseConfigured } from "./firebase";
import {
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

async function hydrateWorks(works) {
  return Promise.all(
    works.map(async (work) => ({
      ...work,
      img: (await resolveImage(work.img)) || work.img,
    })),
  );
}

async function hydrateSite(site) {
  const hero = {};
  for (const key of HERO_KEYS) {
    hero[key] = (await resolveImage(site.hero[key])) || site.hero[key];
  }
  return {
    ceo: (await resolveImage(site.ceo)) || site.ceo,
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
  const [worksSnap, siteSnap] = await Promise.all([
    getDoc(doc(db, "content", "works")),
    getDoc(doc(db, "content", "site")),
  ]);
  return { worksSnap, siteSnap };
}

export function ContentProvider({ children }) {
  const [works, setWorks] = useState(() => normalizeWorks(portfolioData));
  const [site, setSite] = useState(() => normalizeSite(siteData));
  const [ready, setReady] = useState(!firebaseConfigured());

  useEffect(() => {
    if (!db) return undefined;

    let cancelled = false;

    async function load() {
      try {
        const { worksSnap, siteSnap } = await readCloud();
        if (cancelled) return;

        if (worksSnap.exists()) {
          setWorks(await hydrateWorks(normalizeWorks(worksSnap.data().items)));
        }
        if (siteSnap.exists()) {
          setSite(await hydrateSite(normalizeSite(siteSnap.data())));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveWorks(next) {
    if (!db) {
      throw new Error("Firebase is not set up.");
    }
    if (!auth?.currentUser) {
      throw new Error("Sign in to the admin before saving.");
    }
    const packed = await packWorksForCloud(normalizeWorks(next));
    await setDoc(doc(db, "content", "works"), { items: packed });
    setWorks(await hydrateWorks(packed));
  }

  async function saveSite(next) {
    if (!db) {
      throw new Error("Firebase is not set up.");
    }
    if (!auth?.currentUser) {
      throw new Error("Sign in to the admin before saving.");
    }
    const packed = await packSiteForCloud(normalizeSite(next));
    await setDoc(doc(db, "content", "site"), packed);
    setSite(await hydrateSite(packed));
  }

  async function seedIfNeeded() {
    if (!db || !auth?.currentUser) return;

    const { worksSnap, siteSnap } = await readCloud();
    if (worksSnap.exists() && siteSnap.exists()) {
      setWorks(await hydrateWorks(normalizeWorks(worksSnap.data().items)));
      setSite(await hydrateSite(normalizeSite(siteSnap.data())));
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
      value={{ works, saveWorks, site, saveSite, ready, seedIfNeeded }}
    >
      {children}
    </ContentContext.Provider>
  );
}
