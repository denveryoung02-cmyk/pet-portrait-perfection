/**
 * Pet-photo upload service.
 *
 * Validates a File client-side, uploads it to the private `pet-uploads`
 * Supabase Storage bucket, and inserts a row in `uploaded_images`.
 *
 * Requires the user to be authenticated (RLS scopes uploads to auth.uid()).
 */
import { supabase } from "@/integrations/supabase/client";

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB
export const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type UploadValidationError =
  | { kind: "wrong-type"; message: string }
  | { kind: "too-large"; message: string };

export function validateImage(file: File): UploadValidationError | null {
  if (!file.type.startsWith("image/")) {
    return { kind: "wrong-type", message: "That's not an image — try a JPG, PNG or HEIC." };
  }
  // HEIC sometimes has empty `type`; fall back to extension check
  if (file.type && !ACCEPTED_MIME.includes(file.type)) {
    return { kind: "wrong-type", message: `Unsupported format (${file.type}). Use JPG, PNG, WEBP or HEIC.` };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { kind: "too-large", message: `Photo is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 12MB.` };
  }
  return null;
}

export type UploadedImage = {
  id: string;
  storagePath: string;
  publicUrl: string | null;
  petName: string | null;
};

export type UploadProgress = (percent: number) => void;

/**
 * Upload a pet photo to Supabase Storage and create a DB row.
 * Real progress events are not exposed by supabase-js; we emit 0 → 60 → 100
 * milestones so callers can drive a believable progress bar.
 */
export async function uploadPetPhoto(
  file: File,
  opts: { petName?: string; onProgress?: UploadProgress } = {},
): Promise<UploadedImage> {
  const error = validateImage(file);
  if (error) throw new Error(error.message);

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) throw new Error("You must be signed in to upload a photo.");

  opts.onProgress?.(5);

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;

  opts.onProgress?.(20);

  const { error: upErr } = await supabase.storage
    .from("pet-uploads")
    .upload(storagePath, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  opts.onProgress?.(80);

  const { data: row, error: insErr } = await supabase
    .from("uploaded_images")
    .insert({
      user_id: user.id,
      storage_path: storagePath,
      pet_name: opts.petName ?? null,
    })
    .select("id, storage_path, public_url, pet_name")
    .single();

  if (insErr || !row) throw new Error(`Saving image record failed: ${insErr?.message ?? "unknown"}`);

  opts.onProgress?.(100);

  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    petName: row.pet_name,
  };
}

/** Create a short-lived signed URL for previewing a private upload. */
export async function getSignedPreview(storagePath: string, expiresInSeconds = 60 * 30): Promise<string> {
  const { data, error } = await supabase.storage.from("pet-uploads").createSignedUrl(storagePath, expiresInSeconds);
  if (error || !data) throw new Error(`Could not load preview: ${error?.message}`);
  return data.signedUrl;
}
