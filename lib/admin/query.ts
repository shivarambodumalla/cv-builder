/** Query helpers for admin server components: paging, error unwrapping, per-block failure. */

export type Loaded<T> = { ok: true; data: T } | { ok: false; error: string };

export async function load<T>(name: string, fn: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[admin] ${name} failed:`, message);
    return { ok: false, error: message };
  }
}

export type Res<T> = { data: T | null; error: { message: string } | null };
export type CountRes = { count: number | null; error: { message: string } | null };

export function must<T>(res: Res<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function mustCount(res: CountRes): number {
  if (res.error) throw new Error(res.error.message);
  return res.count ?? 0;
}

const PAGE = 1000;
const MAX_ROWS = 200_000;

/** Reads every row of a query in pages (PostgREST caps a response at 1,000 rows). */
export async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<Res<T[]>>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const rows = must(await page(from, from + PAGE - 1)) ?? [];
    out.push(...rows);
    if (rows.length < PAGE) return out;
  }
  throw new Error(`more than ${MAX_ROWS.toLocaleString()} rows; narrow the range`);
}
