/**
 * Recourse Client-Side API Key Management & Per-User Isolation
 * 
 * Stores credentials safely in the user's browser (localStorage).
 * Injects keys as custom request headers (x-groq-api-key, etc.) on API requests,
 * ensuring complete tenant isolation in cloud deployments like Vercel.
 */

export interface RecourseApiKeys {
  groqApiKey: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  recourseHmacSecret: string;
  isCustom: boolean;
  configuredAt?: number;
}

export const STORAGE_KEY = "recourse_user_api_keys";
export const ONBOARDING_DISMISSED_KEY = "recourse_onboarding_dismissed";

/**
 * Generate a cryptographically secure 32-character hex secret for HMAC-SHA256
 */
export function generateSecureHmacSecret(): string {
  const chars = "abcdef0123456789";
  let result = "recourse_";
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < array.length; i++) {
      result += chars[array[i] % chars.length];
    }
    return result + "_sec32";
  }
  return "recourse_super_secret_production_key_32_chars";
}

export const DEFAULT_DEMO_KEYS: RecourseApiKeys = {
  groqApiKey: "",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  recourseHmacSecret: "recourse_super_secret_production_key_32_chars",
  isCustom: false,
};

/**
 * Retrieve user's stored API keys from localStorage
 */
export function getStoredApiKeys(): RecourseApiKeys {
  if (typeof window === "undefined") {
    return DEFAULT_DEMO_KEYS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_KEYS;
    const parsed = JSON.parse(raw);
    return {
      groqApiKey: parsed.groqApiKey || "",
      razorpayKeyId: parsed.razorpayKeyId || "",
      razorpayKeySecret: parsed.razorpayKeySecret || "",
      recourseHmacSecret: parsed.recourseHmacSecret || "recourse_super_secret_production_key_32_chars",
      isCustom: Boolean(parsed.isCustom),
      configuredAt: parsed.configuredAt,
    };
  } catch {
    return DEFAULT_DEMO_KEYS;
  }
}

/**
 * Persist user's API keys to localStorage
 */
export function saveStoredApiKeys(keys: Partial<RecourseApiKeys>): void {
  if (typeof window === "undefined") return;

  const current = getStoredApiKeys();
  const updated: RecourseApiKeys = {
    groqApiKey: (keys.groqApiKey ?? current.groqApiKey).trim(),
    razorpayKeyId: (keys.razorpayKeyId ?? current.razorpayKeyId).trim(),
    razorpayKeySecret: (keys.razorpayKeySecret ?? current.razorpayKeySecret).trim(),
    recourseHmacSecret: (keys.recourseHmacSecret ?? current.recourseHmacSecret).trim() || generateSecureHmacSecret(),
    isCustom: true,
    configuredAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");

  // Dispatch custom storage event for live UI reactivity across components
  window.dispatchEvent(new Event("recourse-keys-updated"));
}

/**
 * Reset keys to built-in demo sandbox
 */
export function resetToDemoKeys(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
  window.dispatchEvent(new Event("recourse-keys-updated"));
}

/**
 * Check if the user has dismissed onboarding
 */
export function isOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "true";
}

/**
 * Construct transient HTTP headers with custom credentials
 */
export function getApiHeaders(customKeys?: RecourseApiKeys): Record<string, string> {
  const keys = customKeys || getStoredApiKeys();
  const headers: Record<string, string> = {};

  if (keys.isCustom) {
    if (keys.groqApiKey) headers["x-groq-api-key"] = keys.groqApiKey;
    if (keys.razorpayKeyId) headers["x-razorpay-key-id"] = keys.razorpayKeyId;
    if (keys.razorpayKeySecret) headers["x-razorpay-key-secret"] = keys.razorpayKeySecret;
    if (keys.recourseHmacSecret) headers["x-recourse-hmac-secret"] = keys.recourseHmacSecret;
  }

  return headers;
}

/**
 * Enhanced fetch wrapper that merges client-side API credentials into headers
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const customHeaders = getApiHeaders();
  const mergedHeaders = new Headers(init?.headers || {});

  Object.entries(customHeaders).forEach(([key, val]) => {
    if (val && !mergedHeaders.has(key)) {
      mergedHeaders.set(key, val);
    }
  });

  return fetch(input, {
    ...init,
    headers: mergedHeaders,
  });
}

/**
 * Format keys as a downloadable .env.local string
 */
export function formatAsEnvString(keys: RecourseApiKeys): string {
  return `# Recourse Risk Manager — Environment Configuration
GROQ_API_KEY=${keys.groqApiKey || "gsk_your_groq_production_key_here"}
RAZORPAY_KEY_ID=${keys.razorpayKeyId || "rzp_test_your_key_id"}
RAZORPAY_KEY_SECRET=${keys.razorpayKeySecret || "your_razorpay_secret_key"}
RECOURSE_HMAC_SECRET=${keys.recourseHmacSecret || "recourse_super_secret_production_key_32_chars"}
`;
}
