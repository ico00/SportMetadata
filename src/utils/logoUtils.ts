/**
 * Utility functions for team logo/emblem handling
 */

/**
 * Converts an SVG file to a string
 * @param file - File object (should be SVG)
 * @returns Promise<string> - SVG content as string
 */
export async function fileToSVGString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Validates if a string is valid SVG content
 * @param svgString - String to validate
 * @returns boolean - True if string appears to be valid SVG
 */
export function isValidSVG(svgString: string): boolean {
  const trimmed = svgString.trim();
  return trimmed.startsWith('<svg') || trimmed.startsWith('<?xml');
}

/**
 * Creates a data URL from SVG string
 * @param svgString - SVG content as string
 * @returns string - Data URL (data:image/svg+xml;base64,...)
 */
export function svgStringToDataURL(svgString: string): string {
  // If it's already a data URL, return as is
  if (svgString.startsWith('data:')) {
    return svgString;
  }
  
  // Encode SVG string for data URL
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
