import { createAdminClient } from "@/lib/supabase/server";

type ModerationTargetType = "place" | "review";

export async function getLatestModerationNotes(
  targetType: ModerationTargetType,
  ids: string[]
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("target_id, detail, created_at")
    .eq("target_type", targetType)
    .in("target_id", ids)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return new Map();
  }

  const notes = new Map<string, string>();

  for (const log of data) {
    if (notes.has(log.target_id)) continue;
    if (!log.detail || typeof log.detail !== "object" || Array.isArray(log.detail)) continue;

    const note = "notes" in log.detail ? log.detail.notes : null;
    if (typeof note === "string" && note.trim()) {
      notes.set(log.target_id, note);
    }
  }

  return notes;
}
