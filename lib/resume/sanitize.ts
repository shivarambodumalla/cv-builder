/**
 * Postgres cannot store U+0000 in `text` or `jsonb`, and PostgREST sends every
 * row as JSON, so a single NUL anywhere in the payload fails the whole insert
 * with "unsupported Unicode escape sequence". pdf.js emits U+0000 for any glyph
 * it cannot map back to a character, which turned a normal upload into a 500.
 *
 * The NUL stands in for a real character, so it becomes a space rather than
 * being dropped: the common case is an arrow, and deleting it would silently
 * rewrite "0->1 product development" as "01 product development".
 *
 * Lone surrogates are dropped outright - they carry no meaning of their own,
 * but they survive JSON.parse of a model response and cannot be encoded as
 * valid UTF-8 on the way to the DB.
 */
const LONE_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/** Replace the characters Postgres refuses in a single string. */
export function sanitizeDbString(value: string): string {
  return value.replace(/\u0000/g, " ").replace(LONE_SURROGATE, "");
}

/**
 * Deep-clean a value bound for a `jsonb` column. Object keys are cleaned too —
 * a NUL in a key fails the insert exactly like one in a value.
 */
export function sanitizeDbJson<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeDbString(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDbJson(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        sanitizeDbString(key),
        sanitizeDbJson(val),
      ])
    ) as T;
  }
  return value;
}
