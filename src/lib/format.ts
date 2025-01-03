export function formatCompactNumber(number: number): string {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(number);
} 