/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUPABASE LIBRARY INDEX                                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// Re-export storage utilities
export {
  uploadImageToSupabase,
  uploadImageAndGetUrl,
  getImageUrlWithCacheBust,
  extractStoragePath,
  deleteImageFromStorage,
  validateImageFile,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  // Deprecated aliases
  uploadToSupabase,
  getPublicUrlWithCacheBust,
} from "./storage";

export type { UploadResult } from "./storage";
