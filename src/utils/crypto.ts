/**
 * Smart Meal Manager — Cryptographic Utilities
 * Safe Web Crypto API based password hashing with salt.
 * No plain text passwords are ever stored.
 */

const SALT_PREFIX = 'smm_salt_v1_';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salted = `${SALT_PREFIX}:${password.trim()}`;
  const data = encoder.encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const calculatedHash = await hashPassword(password);
  return calculatedHash === expectedHash;
}

export function generateId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
