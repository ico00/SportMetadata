/**
 * Utility funkcije za parsiranje PDF datoteka i izvlačenje teksta
 */

/**
 * Izvlači tekst iz PDF datoteke
 * @param file - PDF File objekt
 * @returns Promise<string> - Izvučeni tekst iz PDF-a
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dinamički import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Postavi worker path
    // Koristimo CDN worker koji je pouzdan i radi u svim okruženjima
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    // Učitaj PDF dokument iz ArrayBuffer-a
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iteriraj kroz sve stranice
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Kombiniraj sve text items u jedan string
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      
      if (pageText) {
        fullText += pageText;
        // Dodaj novi red između stranica ako nije posljednja
        if (pageNum < pdf.numPages) {
          fullText += '\n';
        }
      }
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Error reading PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parsira PDF i vraća tekst pripremljen za parsiranje igrača
 * Pokušava prepoznati tablice i liste igrača
 * @param file - PDF File objekt
 * @returns Promise<string> - Parsiran tekst pripremljen za parser igrača
 */
export async function parsePDFForPlayers(file: File): Promise<string> {
  const rawText = await extractTextFromPDF(file);
  
  // Normaliziraj tekst - ukloni višestruke razmake, normaliziraj novе redove
  let normalizedText = rawText
    .replace(/\r\n/g, '\n') // Windows line endings
    .replace(/\r/g, '\n')   // Mac line endings
    .replace(/\n{3,}/g, '\n\n') // Višestruki novi redovi u dva
    .replace(/[ \t]+/g, ' ') // Višestruke razmake u jedan
    .trim();
  
  // Pokušaj prepoznati linije koje liče na igrače
  // Ovo je heuristička metoda - možda treba prilagoditi ovisno o formatu PDF-a
  const lines = normalizedText.split('\n');
  const playerLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Provjeri da li linija sadrži broj ili slovo na početku ili kraju
    // (formati koje parser već podržava)
    const hasPlayerPattern = 
      /^\d+[h]?\s+[A-Za-z]/.test(trimmed) || // "7 Ivan" ili "7h Ivan"
      /^[A-Za-z][h]?\s+[A-Za-z]/.test(trimmed) || // "A Ivan"
      /\([\dA-Za-z]+\)/.test(trimmed) || // "(7)" ili "(A)"
      /-\s*[\dA-Za-z]+$/.test(trimmed); // "- 7" ili "- A"
    
    if (hasPlayerPattern) {
      playerLines.push(trimmed);
    }
  }
  
  // Ako nismo pronašli nijednu liniju s patternom, vrati cijeli tekst
  // Parser će pokušati obraditi što može
  if (playerLines.length === 0) {
    return normalizedText;
  }
  
  return playerLines.join('\n');
}
