import { Match, Team } from "../types";

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
 * Formats date to short month format for Shutterstock Editorial
 * Example: 2022-09-22 -> 22 Sep 2022
 */
function formatDateForEditorial(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Gets ordinal suffix for day (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/**
 * Formats date for Imago format
 * Example: 2024-05-05 -> 5th May 2024
 */
function formatDateForImago(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const year = date.getFullYear();
  
  return `${day}${suffix} ${month} ${year}`;
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
 * Shutterstock Editorial format: Team1 v Team2, Description, Venue, City, Country - dd MMM yyyy
 * Example: Croatia v Denmark, UEFA Nations League, Group A, Football, Maksimir Stadium, Zagreb, Croatia - 22 Sep 2022
 */
export function formatForShutterstockEditorial(match: Match, teams: Team[]): string {
  const teamNames = teams.map(t => t.name).filter(Boolean);
  const team1 = teamNames[0] || "Team 1";
  const team2 = teamNames[1] || "Team 2";
  const description = match.description || "";
  const venue = match.venue || "";
  const city = match.city || "";
  const country = match.country || "";
  const date = formatDateForEditorial(match.date);
  
  const parts = [];
  
  // Team1 v Team2
  parts.push(`${team1} v ${team2}`);
  
  // Description
  if (description) {
    parts.push(description);
  }
  
  // Venue
  if (venue) {
    parts.push(venue);
  }
  
  // City
  if (city) {
    parts.push(city);
  }
  
  // Country
  if (country) {
    parts.push(country);
  }
  
  // Join all parts with commas
  let result = parts.join(", ");
  
  // Add date at the end
  result += ` - ${date}`;
  
  return result;
}

/**
 * Imago format: City, Country, d m yyyy. Description at Venue, City.
 * Example: Manchester, England, 5th May 2024. Lauren Hemp of Manchester City (L) is challenged by Emily Fox of Arsenal during the FA Women s Super League match at the Academy Stadium, Manchester.
 */
export function formatForImago(match: Match): string {
  const city = match.city || "";
  const country = match.country || "";
  const date = formatDateForImago(match.date);
  const description = match.description || "";
  const venue = match.venue || "";
  
  const parts = [];
  
  // City, Country, Date
  if (city && country) {
    parts.push(`${city}, ${country}, ${date}.`);
  } else if (city) {
    parts.push(`${city}, ${date}.`);
  } else if (country) {
    parts.push(`${country}, ${date}.`);
  } else {
    parts.push(`${date}.`);
  }
  
  // Description at Venue, City
  if (description) {
    let descriptionPart = description;
    if (venue) {
      descriptionPart += ` at ${venue}`;
    }
    if (city) {
      descriptionPart += `, ${city}`;
    }
    descriptionPart += ".";
    parts.push(descriptionPart);
  } else if (venue || city) {
    let locationPart = "";
    if (venue) {
      locationPart = `at ${venue}`;
    }
    if (city) {
      locationPart += locationPart ? `, ${city}` : city;
    }
    if (locationPart) {
      parts.push(`${locationPart}.`);
    }
  }
  
  return parts.join(" ");
}

/**
 * List of available stock agency formatters
 */
export const stockAgencies = {
  shutterstock: {
    name: "Shutterstock",
    format: formatForShutterstock,
  },
  shutterstockEditorial: {
    name: "Shutterstock Editorial",
    format: formatForShutterstockEditorial,
  },
  imago: {
    name: "Imago",
    format: formatForImago,
  },
  // Add more agencies here in the future
  // getty: { name: "Getty Images", format: formatForGetty },
  // alamy: { name: "Alamy", format: formatForAlamy },
} as const;

export type StockAgency = keyof typeof stockAgencies;
