export function formatWeeklyVisitors(n?: number | null): string {
  if (n == null || n <= 0) {
    return "—";
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1)}K`;
  }
  return String(n);
}
