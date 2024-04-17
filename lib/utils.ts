import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isNonNegativeInt(s: string) {
  return /^\d+$/.test(s);
}

export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
}
