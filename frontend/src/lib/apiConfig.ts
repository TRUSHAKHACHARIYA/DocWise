const DEFAULT_API_ORIGIN = "http://localhost:4000";

export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;
