/**
 * Utility for deriving per-user asset identifiers.
 * Uses the username directly without any suffix.
 */
export function getUserAssetSymbol(username: string): string {
  return username;
}
