import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Simple delay promise for UX sequencing
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
