/** Number formatting shared by the admin Home and Growth tabs. */

export function usd(n: number): string {
  const whole = Math.abs(n % 1) < 0.005;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function int(n: number): string {
  return n.toLocaleString("en-US");
}

/** "42%" of a whole, or an en dash when the whole is zero. */
export function pct(part: number, whole: number): string {
  if (!whole) return "–";
  const p = (part / whole) * 100;
  return `${p < 10 && p > 0 ? p.toFixed(1) : Math.round(p)}%`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${int(n)} ${n === 1 ? one : many}`;
}

/** "2 monthly, 1 yearly", ordered weekly → monthly → yearly → anything else. */
export function periodSplit(byPeriod: Record<string, number>): string {
  const order = ["weekly", "monthly", "yearly"];
  return Object.entries(byPeriod)
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => (order.indexOf(a) + 1 || 9) - (order.indexOf(b) + 1 || 9))
    .map(([p, n]) => `${n} ${p}`)
    .join(", ");
}
