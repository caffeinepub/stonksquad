/**
 * Currency utility functions for USDC stablecoin formatting.
 * USDC is stored in cents (1 USDC = 100 cents).
 */

/**
 * Format cents to dollars with 2 decimal places
 */
export function formatStablecoin(cents: number | bigint): string {
  const dollars = Number(cents) / 100;
  return dollars.toFixed(2);
}

/**
 * Format cents to dollars with currency symbol
 */
export function formatStablecoinWithUnit(cents: number | bigint): string {
  return `$${formatStablecoin(cents)}`;
}

/**
 * Format cents to dollars with currency symbol (short form, alias for formatStablecoinWithUnit)
 */
export function formatStablecoinShort(cents: number | bigint): string {
  return formatStablecoinWithUnit(cents);
}

/**
 * Format a price value (already in dollars) with 2 decimal places
 */
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Format a price value with USDC unit
 */
export function formatPriceWithUnit(price: number): string {
  return `${formatPrice(price)} USDC`;
}

/**
 * Format bigint market cap values safely without lossy Number conversion.
 * Handles large integers (including 0) for display in Activity/Leaderboard.
 */
export function formatMarketCap(marketCap: bigint): string {
  if (marketCap === 0n) {
    return '$0';
  }
  
  // For display purposes, convert to number with safe handling
  const value = Number(marketCap);
  
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}
