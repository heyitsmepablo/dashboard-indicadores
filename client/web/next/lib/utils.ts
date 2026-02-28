import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para mesclar classes do Tailwind CSS de forma condicional e sem conflitos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
