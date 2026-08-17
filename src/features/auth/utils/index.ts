import { NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_KEY, USER_KEY } from "../constants";

import { importSPKI, jwtVerify } from "jose";
let publicKeyPromise: Promise<any> | undefined;
import { createPublicKey } from "crypto";


// Helper functions for token management
export const getStoredToken = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

export const setStoredToken = (
  key: string = TOKEN_KEY,
  data: object | string | null,
): void => {
  if (typeof window !== "undefined") {
    if (data) {
      localStorage.setItem(
        key,
        typeof data === "string" ? data : JSON.stringify(data),
      );
    } else {
      localStorage.removeItem(key);
    }
  }
};

export const STORAGE_KEYS = {
  tasks: "tasks",
};

export const getCodeFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("c");
  if (code) {
    window.history.replaceState({}, "", window.location.pathname);
  }
  return code;
};


const normalizePem = (pem: string) => {
  const trimmed = pem.trim();
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unquoted.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
};
const getPublicKey = () => {
  const publicKeyPem = process.env.JWT_PUBLIC_KEY;
  if (!publicKeyPem) {
    throw new Error("JWT_PUBLIC_KEY is not set in environment variables");
  }

  const normalizedPublicKey = normalizePem(publicKeyPem);
  publicKeyPromise ??= normalizedPublicKey.includes(
    "-----BEGIN RSA PUBLIC KEY-----",
  )
    ? Promise.resolve(createPublicKey(normalizedPublicKey) as any)
    : importSPKI(normalizedPublicKey, "RS256");
  return publicKeyPromise;
};

/**
 * Verify access token and return payload or error
 */
export const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, await getPublicKey());
    return { payload, error: null };
  } catch (error) {
    console.error("Error verifying access token:", error);
    return { payload: null, error: "Invalid or expired token" };
  }
};

export const getUserFromHeaders = async (
  request: NextRequest,
): Promise<string | null> => {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : request.cookies.get(ACCESS_TOKEN_KEY)?.value;

  if (!token) return null;

  const { payload, error } = await verifyAccessToken(token);

  if (error || !payload?.sub) return null;
  return payload.sub;
};
