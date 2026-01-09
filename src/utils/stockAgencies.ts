import { Match } from "../types";

/**
 * Formats date to uppercase month name format
 * Example: 2026-01-08 -> JANUARY 8, 2026
 */
function formatDateForStock(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Formats city name to uppercase (for stock agency format)
 */
function formatCity(city: string): string {
  return city.toUpperCase();
}

/**
 * Formats country name to uppercase (for stock agency format)
 */
function formatCountry(country: string): string {
  return country.toUpperCase();
}

/**
 * Shutterstock format: CITY, COUNTRY - MONTH DAY, YEAR: Description
 * Example: ZAGREB, CROATIA - JANUARY 8, 2026: Friendly match between Croatia and Germany
 */
export function formatForShutterstock(match: Match): string {
  const city = formatCity(match.city || "");
  const country = formatCountry(match.country || "");
  const date = formatDateForStock(match.date);
  const description = match.description || "";
  
  if (!city || !country) {
    return `Please fill in city and country for Shutterstock format`;
  }
  
  return `${city}, ${country} - ${date}: ${description}`;
}

/**
 * List of available stock agency formatters
 */
export const stockAgencies = {
  shutterstock: {
    name: "Shutterstock",
    format: formatForShutterstock,
  },
  // Add more agencies here in the future
  // getty: { name: "Getty Images", format: formatForGetty },
  // alamy: { name: "Alamy", format: formatForAlamy },
} as const;

export type StockAgency = keyof typeof stockAgencies;
