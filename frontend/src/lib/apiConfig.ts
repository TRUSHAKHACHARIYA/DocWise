const DEFAULT_API_ORIGIN = "http://localhost:4000";

// NEXT_PUBLIC_API_URL is the backend origin. Tolerate a trailing "/api" too —
// older deploy docs said to include it, which produced "/api/api/..." 404s.
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_ORIGIN)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;
