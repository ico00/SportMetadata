/**
 * Shared sorting utility functions
 */

/**
 * Sortira player number-ove koji mogu biti brojevi ili slova
 * Brojevi dolaze prije slova, brojevi se sortiraju numerički, slova alfabetski
 */
export function sortPlayerNumber(a: string, b: string): number {
  const aIsNumber = !isNaN(Number(a));
  const bIsNumber = !isNaN(Number(b));
  
  // Both are numbers - sort numerically
  if (aIsNumber && bIsNumber) {
    return Number(a) - Number(b);
  }
  
  // Both are letters - sort alphabetically
  if (!aIsNumber && !bIsNumber) {
    return a.localeCompare(b);
  }
  
  // Numbers come before letters
  if (aIsNumber && !bIsNumber) return -1;
  if (!aIsNumber && bIsNumber) return 1;
  
  return 0;
}
