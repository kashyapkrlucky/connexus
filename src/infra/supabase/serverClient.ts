import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer the secret key (bypasses RLS, like the old service_role key) for
// server-only work. Without one, fall back to the publishable key — uploads
// still work as long as Storage bucket policies allow it, just RLS-bound.
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseServerClient =
  url && secretKey ? createClient(url, secretKey, { auth: { persistSession: false } }) : null;

export const isSupabaseConfigured = Boolean(supabaseServerClient);

export const POST_IMAGES_BUCKET = "post-images";
export const COMMUNITY_IMAGES_BUCKET = "community-images";
