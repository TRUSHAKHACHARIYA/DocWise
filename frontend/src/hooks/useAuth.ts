/**
 * useAuth — re-exports the authStore for use in components.
 * This keeps a clean import path: `import { useAuth } from "@/hooks/useAuth"`
 *
 * NOTE: In Day 10, the mock login/register will be replaced with
 * real API calls using `lib/api.ts` and JWT token management from `lib/auth.ts`.
 */
export { useAuthStore as useAuth } from "@/store/authStore";
