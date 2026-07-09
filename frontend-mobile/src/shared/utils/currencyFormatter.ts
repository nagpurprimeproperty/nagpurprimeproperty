/**
 * shared/utils/currencyFormatter.ts
 *
 * Indian-locale currency formatter used throughout the property listings.
 * Converts raw numeric amounts to human-readable strings with crore / lakh
 * suffixes appropriate for the Nagpur real-estate market.
 */
export function formatPrice(amount: number | string, prefix = '₹'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!isFinite(n)) return `${prefix}0`;

  // Indian numbering: 1 Cr = 1,00,00,000 | 1 L = 1,00,000
  if (n >= 1_00_00_000) return `${prefix}${(n / 1_00_00_000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 1_00_000)    return `${prefix}${(n / 1_00_000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `${prefix}${n.toLocaleString('en-IN')}`;
}
