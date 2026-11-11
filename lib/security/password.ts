import { z } from "zod";

const COMMON = ["password", "123456", "qwerty", "letmein", "welcome", "outbusy", "admin"];

/**
 * Team password policy: at least 12 characters, with a letter and a number (or 16+ characters
 * as a passphrase), not built from the account email or an obvious word.
 */
export function passwordProblem(password: string, email?: string): string | null {
  if (password.length < 12) return "Use at least 12 characters.";
  if (password.length > 128) return "Use at most 128 characters.";
  if (password.length < 16 && !(/[a-z]/i.test(password) && /\d/.test(password))) {
    return "Mix letters and numbers, or use a passphrase of 16+ characters.";
  }
  const lower = password.toLowerCase();
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lower.includes(local)) return "Don't include your email in the password.";
  if (COMMON.some((w) => lower.includes(w))) return "Avoid common words like “password” or the company name.";
  if (/^(.)\1+$/.test(password)) return "That password is too easy to guess.";
  return null;
}

export const newPasswordSchema = z.string().min(1, "Enter a new password.").max(128);
