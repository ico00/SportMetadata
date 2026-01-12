/**
 * Shared string utility functions
 */

/**
 * Capitalizira svaku riječ u stringu (prvo slovo veliko, ostala mala)
 */
export function capitalizeWords(str: string): string {
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Uklanja dijakritike iz stringa (č, ć, ž, š, đ, itd.)
 */
export function removeDiacritics(str: string): string {
  return str
    .replace(/dž/g, "dz") // Prvo dž jer je duplo slovo
    .replace(/Dž/g, "Dz")
    .replace(/DŽ/g, "DZ")
    .replace(/đ/g, "dj") // đ → dj
    .replace(/Đ/g, "Dj")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Ukloni ostale dijakritike
    .replace(/ć/g, "c")
    .replace(/Ć/g, "C")
    .replace(/č/g, "c")
    .replace(/Č/g, "C")
    .replace(/š/g, "s")
    .replace(/Š/g, "S")
    .replace(/ž/g, "z")
    .replace(/Ž/g, "Z");
}
