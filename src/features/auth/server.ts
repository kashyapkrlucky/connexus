import { auth } from "./auth";

/** The signed-in user's id for API route handlers, or null for anonymous requests. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
