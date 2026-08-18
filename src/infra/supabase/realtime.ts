import { supabaseServerClient } from "./serverClient";

export type CommunityRealtimeEvent = "post:new" | "post:vote" | "post:share";

/**
 * Publishes a Supabase Realtime *broadcast* message (not Postgres Changes) —
 * our data of record lives in Neon via Prisma, not in Supabase's own
 * Postgres, so change-data-capture realtime isn't an option here. This is
 * best-effort: if Supabase isn't configured yet, it silently no-ops.
 */
export async function publishCommunityEvent(
  communitySlug: string,
  event: CommunityRealtimeEvent,
  payload: Record<string, unknown>
) {
  if (!supabaseServerClient) return;

  const channel = supabaseServerClient.channel(`community:${communitySlug}`);
  try {
    await channel.send({ type: "broadcast", event, payload });
  } catch {
    // Realtime is a live-update nicety, never fail the request over it.
  } finally {
    await supabaseServerClient.removeChannel(channel);
  }
}
