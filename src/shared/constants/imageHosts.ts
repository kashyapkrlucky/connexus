/**
 * Hosts served through the Next.js image optimizer (see next.config.ts). Images from
 * anywhere else, such as publisher images on curated posts, are loaded directly.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  "lh3.googleusercontent.com", // Google avatars
  "kozsmuhorghziwxqzvuq.supabase.co", // uploaded images
  "api.dicebear.com", // generated community icons
] as const;

export function isOptimizedImageHost(src: string): boolean {
  try {
    return (OPTIMIZED_IMAGE_HOSTS as readonly string[]).includes(new URL(src).hostname);
  } catch {
    return true; // relative paths like /logo.png are local and always optimizable
  }
}
