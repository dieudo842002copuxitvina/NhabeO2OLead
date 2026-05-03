/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUPABASE STORAGE UTILITY                                                   ║
 * ║  Handles image uploads to Supabase Storage with proper error handling         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * FEATURES:
 * ─────────
 * - Unique filename generation (prevents cache & overwrite issues)
 * - Type validation
 * - File size validation
 * - Progress tracking
 * - Error handling
 */

import { supabase } from "@/integrations/supabase/client";

/* ─────────────────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Maximum allowed file size (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed image MIME types
 */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Storage bucket name
 */
const STORAGE_BUCKET = "agri-assets";

/* ─────────────────────────────────────────────────────────────────────────────
 * UTILITY FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Generate a unique filename to prevent caching and overwrites
 * 
 * Format: {timestamp}-{randomString}.{extension}
 * Example: 1714567890123-a1b2c3d4.jpg
 * 
 * @param originalFilename - Original file name
 * @returns Unique filename with timestamp and random suffix
 */
export function generateUniqueFilename(originalFilename: string): string {
  // Extract file extension
  const fileExt = originalFilename.split(".").pop()?.toLowerCase() || "jpg";
  
  // Generate unique identifier
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  
  return `${timestamp}-${randomSuffix}.${fileExt}`;
}

/**
 * Validate file type
 * 
 * @param file - File to validate
 * @returns true if valid, throws error if invalid
 */
export function validateFileType(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Định dạng file không được hỗ trợ. Vui lòng sử dụng: ${ALLOWED_TYPES.join(", ")}`);
  }
  return true;
}

/**
 * Validate file size
 * 
 * @param file - File to validate
 * @returns true if valid, throws error if invalid
 */
export function validateFileSize(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  return true;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * UPLOAD FUNCTION
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Upload image to Supabase Storage
 * 
 * @param file - File to upload
 * @param folder - Folder path within bucket (e.g., 'posts', 'products')
 * @returns Public URL of uploaded file
 * @throws Error if upload fails
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = "general"
): Promise<string> {
  // 1. Validate file
  validateFileType(file);
  validateFileSize(file);
  
  // 2. Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.name);
  const filePath = `${folder}/${uniqueFilename}`;
  
  // 3. Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false, // Don't overwrite existing files
    });
  
  // 4. Handle upload errors
  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(`Upload thất bại: ${error.message}`);
  }
  
  // 5. Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}

/**
 * Delete image from Supabase Storage
 * 
 * @param publicUrl - Full public URL of the file
 * @returns true if deleted successfully
 */
export async function deleteImageFromSupabase(publicUrl: string): Promise<boolean> {
  // Extract path from public URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/agri-assets/posts/filename.jpg
  const pathMatch = publicUrl.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  
  if (!pathMatch) {
    console.warn("Could not extract path from URL:", publicUrl);
    return false;
  }
  
  const filePath = pathMatch[1];
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);
  
  if (error) {
    console.error("Delete error:", error);
    return false;
  }
  
  return true;
}

/**
 * Get image URL with cache-busting query parameter
 * 
 * @param url - Original image URL
 * @param bustCache - Whether to add cache-busting (default: true for new uploads)
 * @returns URL with or without cache-busting parameter
 */
export function getImageUrlWithCacheBust(
  url: string | null | undefined,
  bustCache: boolean = true
): string {
  if (!url) return "";
  
  if (bustCache) {
    // Add timestamp to prevent caching
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
  }
  
  return url;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ───────────────────────────────────────────────────────────────────────────── */

export default uploadImageToSupabase;
