const DEFAULT_API_ORIGIN = "http://localhost:4000";

const rawUrl = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
export const API_BASE_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

