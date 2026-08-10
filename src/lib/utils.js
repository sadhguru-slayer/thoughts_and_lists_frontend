import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}
