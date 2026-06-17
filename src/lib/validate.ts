/**
 * Lightweight input validation helpers. Avoids pulling in a heavy schema
 * library for the small number of fields we accept from the API.
 */

export function isNonEmptyString(v: unknown, max = 500): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

export function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

export function isCuid(v: unknown): v is string {
  // cuid() ids start with 'c' and are ~24 chars of [a-z0-9].
  return typeof v === "string" && /^c[a-z0-9]{20,30}$/i.test(v);
}

export function isSafeUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    // Only allow http(s) to prevent javascript: / data: URL injection.
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Truncate + trim a string for safe storage. */
export function sanitizeString(v: unknown, max = 2000): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max).trim();
}

/** Strip control characters that could be used for log/header injection. */
export function sanitizeHeader(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  // Remove CR/LF and other control chars.
  const cleaned = v.replace(/[\r\n\t\x00-\x1f\x7f]/g, "").slice(0, max).trim();
  return cleaned || null;
}
