import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const STATIC_ROUTES = [
  "",
  "/list",
  "/submit",
  "/guidelines",
  "/terms",
  "/report",
  "/takedown",
  "/official-response",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return staticEntries;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: places } = await supabase
    .from("places")
    .select("id, updated_at")
    .eq("status", "approved");

  const placeEntries: MetadataRoute.Sitemap = (places ?? []).map((place) => ({
    url: `${siteUrl}/places/${place.id}`,
    lastModified: place.updated_at ?? now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...placeEntries];
}
