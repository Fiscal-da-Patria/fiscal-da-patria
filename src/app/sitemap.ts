import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** As três páginas estáticas públicas (deep links são estados da home). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/poderes`, changeFrequency: "monthly", priority: 0.6 },
  ];
}