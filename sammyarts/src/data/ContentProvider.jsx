import { useState } from "react";
import { portfolioData } from "./portfolio";
import siteData from "./site.json";
import { ContentContext } from "./content";
import { ADMIN_PASSWORD } from "../admin/gate";

async function putJson(url, body) {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_PASSWORD,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Save failed. Keep the preview running and try again.");
  }
}

export function ContentProvider({ children }) {
  const [works, setWorks] = useState(portfolioData);
  const [site, setSite] = useState(siteData);

  async function saveWorks(next) {
    await putJson("/api/works", next);
    setWorks(next);
  }

  async function saveSite(next) {
    await putJson("/api/site", next);
    setSite(next);
  }

  return (
    <ContentContext.Provider value={{ works, saveWorks, site, saveSite }}>
      {children}
    </ContentContext.Provider>
  );
}
