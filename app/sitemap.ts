import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/guides";
import { getAllHubs, getHubPath } from "@/lib/hubs";
import { getSiteUrl } from "@/lib/siteUrl";

const STATIC_ROUTES = [
  "",
  "/list",
  "/guides",
  "/jobs",
  "/areas",
  "/apps",
  "/guidelines",
  "/about",
  "/editorial-policy",
  "/terms",
  "/privacy",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/guides" || path === "/jobs" || path === "/areas" || path === "/apps" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/guides" || path === "/jobs" || path === "/areas" || path === "/apps" ? 0.9 : 0.7,
  }));

  const guideEntries: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
    url: `${siteUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const hubEntries: MetadataRoute.Sitemap = getAllHubs().map((hub) => ({
    url: `${siteUrl}${getHubPath(hub)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return [...staticEntries, ...guideEntries, ...hubEntries];
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: places, error } = await supabase
    .from("places")
    .select("id, updated_at")
    .eq("status", "approved");

  if (error) {
    console.error("sitemap places fetch failed", error);
    throw new Error("Failed to generate place sitemap entries.");
  }

  const placeEntries: MetadataRoute.Sitemap = (places ?? []).map((place) => ({
    url: `${siteUrl}/places/${place.id}`,
    lastModified: place.updated_at ?? now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...guideEntries, ...hubEntries, ...placeEntries];
}
