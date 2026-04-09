import { clsx, type ClassValue } from "clsx";

/**
 * Merges class names and handles conditional classes.
 * Note: tailwind-merge is not installed, so this is a basic implementation using clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
