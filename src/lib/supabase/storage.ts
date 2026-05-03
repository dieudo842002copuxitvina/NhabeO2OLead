/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUPABASE STORAGE UTILITIES                                          ║
 * ║  Image upload and URL generation utilities for Supabase Storage           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { supabaseAdmin } from "@/lib/supabase-admin";

/* ─────────────────────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────────────────────── */

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * UPLOAD FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param folder - Target folder in storage bucket (default: "posts")
 * @returns Promise<string> - The public URL of the uploaded file
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = "posts"
): Promise<string> {
  const supabase = supabaseAdmin();
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${timestamp}-${randomStr}.${extension}`;

  // Convert file to array buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload an image and get the public URL
 * @param file - The file to upload
 * @param folder - Target folder (default: "posts")
 * @returns Promise<UploadResult> - Result object with success status and URL
 */
export async function uploadImageAndGetUrl(
  file: File,
  folder: string = "posts"
): Promise<UploadResult> {
  try {
    const url = await uploadImageToSupabase(file, folder);
    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * URL UTILITIES
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Add cache-busting query parameter to image URL
 * @param url - The original image URL
 * @param bustCache - Whether to add cache-busting (default: true)
 * @returns URL with cache-busting parameter
 */
export function getImageUrlWithCacheBust(
  url: string,
  bustCache: boolean = true
): string {
  if (!bustCache) return url;

  const separator = url.includes("?") ? "&" : "?";
  const timestamp = Date.now();
  
  return `${url}${separator}_cb=${timestamp}`;
}

/**
 * Extract the path from a Supabase storage URL
 * @param url - Full public URL
 * @returns The storage path
 */
export function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Expected format: https://xxx.supabase.co/storage/v1/object/public/images/folder/file.jpg
    const pathParts = urlObj.pathname.split("/");
    const imagesIndex = pathParts.indexOf("images");
    if (imagesIndex === -1) return null;
    return pathParts.slice(imagesIndex + 1).join("/");
  } catch {
    return null;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @returns Promise<boolean> - Success status
 */
export async function deleteImageFromStorage(url: string): Promise<boolean> {
  const path = extractStoragePath(url);
  if (!path) {
    console.error("Invalid storage URL:", url);
    return false;
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.storage.from("images").remove([path]);

  if (error) {
    console.error("Delete error:", error);
    return false;
  }

  return true;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * VALIDATION
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate an image file
 * @param file - File to validate
 * @returns Object with isValid and error message
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { isValid: true };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * LEGACY COMPATIBILITY
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * @deprecated Use uploadImageToSupabase instead
 * Alias for backwards compatibility
 */
export const uploadToSupabase = uploadImageToSupabase;

/**
 * @deprecated Use getImageUrlWithCacheBust instead
 * Alias for backwards compatibility
 */
export const getPublicUrlWithCacheBust = getImageUrlWithCacheBust;
