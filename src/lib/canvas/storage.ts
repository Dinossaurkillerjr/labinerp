"use client";

// Canvas images used to be embedded as base64 data URLs directly inside the
// element (and therefore inside localStorage) — the exact thing this file
// exists to stop doing. Each image now uploads to a private Storage bucket
// under the owning user's own folder (RLS-enforced, see
// supabase/migrations/0001_init.sql) and the element only ever stores a URL.

import { createClient } from "@/lib/supabase/client";

const BUCKET = "canvas-images";
// Signed URLs must expire eventually (private bucket, no public access) —
// ~10 years is effectively permanent for this app's purposes without
// building a URL-refresh pipeline. Documented trade-off, not an oversight.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

export async function uploadCanvasImage(userId: string, elementId: string, file: File): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${elementId}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signError) throw signError;
  return data.signedUrl;
}
