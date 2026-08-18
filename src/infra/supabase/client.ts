import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Browser client for subscribing to realtime broadcast channels. Null until
// Supabase env vars are configured — callers must handle that.
export const supabaseBrowserClient =
  url && publishableKey ? createClient(url, publishableKey) : null;
