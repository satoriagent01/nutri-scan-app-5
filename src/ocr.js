/**
 * OCR module using Tesseract.js to extract nutrition table text from images.
 * In the browser, this uses Tesseract.js directly.
 * In Node (tests), we mock the actual OCR and provide a parseImageText
 * helper for deterministic testing.
 */

/**
 * Extract text from an image file or blob using Tesseract.js.
 * @param {File|Blob|HTMLImageElement} image - The image to process.
 * @returns {Promise<string>} The extracted text.
 */
export async function extractText(image) {
  // Dynamically import Tesseract.js to avoid bundling issues in tests
  const Tesseract = await import('tesseract.js');
  const worker = await Tesseract.createWorker();
  const { data: { text } } = await worker.recognize(image);
  await worker.terminate();
  return text;
}

/**
 * Parse a nutrition table from OCR text.
 * This is a helper that the frontend can use after OCR.
 * @param {string} ocrText - The raw OCR text.
 * @returns {Object|null} Parsed nutrition data or null if no table found.
 */
export function parseNutritionTable(ocrText) {
  // Look for nutrition table patterns in the OCR text
  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Find the start of the nutrition table (look for keywords)
  const tableKeywords = [
    'energie', 'energy', 'energi', 'energie',
    'fett', 'matieres grasses', 'vetten', 'grassi',
    'kohlenhydrate', 'glucides', 'koolhydraten', 'carboidrati',
    'zucker', 'sucres', 'suiker', 'zuccheri',
    'ballaststoffe', 'fibres alimentaires', 'vezels', 'fibra',
    'eiweiss', 'proteines', 'eiwitten', 'proteine',
    'salz', 'sel', 'zout', 'sale'
  ];

  let tableStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    for (const keyword of tableKeywords) {
      if (lineLower.includes(keyword)) {
        tableStart = i;
        break;
      }
    }
    if (tableStart !== -1) break;
  }

  if (tableStart === -1) return null;

  // Find the end of the table (look for the last row with values)
  let tableEnd = tableStart;
  for (let i = tableStart + 1; i < lines.length; i++) {
    const line = lines[i];
    // A table row typically has numbers with units (g, kJ, kcal, %)
    if (/^\d+[\s,\.]*\d*\s*(g|kJ|kcal|%|mg|ml)/i.test(line)) {
      tableEnd = i;
    } else if (line === '' || line.includes('---') || line.includes('___')) {
      // Empty line or separator might indicate end
      // But continue if next line has values
      if (i + 1 < lines.length && /^\d+[\s,\.]*\d*\s*(g|kJ|kcal|%|mg|ml)/i.test(lines[i + 1])) {
        tableEnd = i;
      } else {
        break;
      }
    }
  }

  if (tableEnd <= tableStart) return null;

  const tableLines = lines.slice(tableStart, tableEnd + 1);
  return parseTableLines(tableLines);
}

/**
 * Parse table lines into structured nutrition data.
 * @param {string[]} tableLines - Lines of the nutrition table.
 * @returns {Object} Parsed nutrition data.
 */
function parseTableLines(tableLines) {
  const result = {
    nutrients: {},
    servingSize: null,
    servingUnit: null,
    perServing: {},
    per100g: {}
  };

  // Try to detect serving size from header
  for (const line of tableLines) {
    const servingMatch = line.match(/(\d+)\s*(g|ml|stuck|stuk|portie|porzione|portion)/i);
    if (servingMatch) {
      result.servingSize = parseInt(servingMatch[1], 10);
      result.servingUnit = servingMatch[2].toLowerCase();
    }
  }

  // Nutrient name mappings (German, French, Dutch, Italian -> English)
  const nutrientMap = {
    'energie': 'energy',
    'energy': 'energy',
    'energi': 'energy',
    'fett': 'fat',
    'matieres grasses': 'fat',
    'vetten': 'fat',
    'grassi': 'fat',
    'davon gesattigte fettsauren': 'saturated fat',
    'dont acides gras satures': 'saturated fat',
    'waarvan verzadigde vetzuren': 'saturated fat',
    'di cui acidi grassi saturi': 'saturated fat',
    'kohlenhydrate': 'carbohydrates',
    'glucides': 'carbohydrates',
    'koolhydraten': 'carbohydrates',
    'carboidrati': 'carbohydrates',
    'davon zucker': 'sugars',
    'dont sucres': 'sugars',
    'waarvan suikers': 'sugars',
    'di cui zuccheri': 'sugars',
    'ballaststoffe': 'fiber',
    'fibres alimentaires': 'fiber',
    'vezels': 'fiber',
    'fibra': 'fiber',
    'eiweiss': 'protein',
    'proteines': 'protein',
    'eiwitten': 'protein',
    'proteine': 'protein',
    'salz': 'salt',
    'sel': 'salt',
    'zout': 'salt',
    'sale': 'salt'
  };

  // Parse each row
  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i];
    const lineLower = line.toLowerCase();

    // Skip header lines
    if (i === 0 && /per\s*100\s*(g|ml)/i.test(lineLower)) continue;
    if (i === 0 && /portie|porzione|portion/i.test(lineLower)) continue;

    // Look for nutrient name and values
    let nutrientName = null;
    for (const [key, value] of Object.entries(nutrientMap)) {
      if (lineLower.includes(key)) {
        nutrientName = value;
        break;
      }
    }

    if (!nutrientName) continue;

    // Extract numeric values from the line
    // Pattern: value followed by unit (g, kJ, kcal, %)
    const valuePattern = /(\d+[\s,\.]*\d*)\s*(g|kJ|kcal|%|mg|ml)/gi;
    const matches = [...line.matchAll(valuePattern)];

    if (matches.length >= 2) {
      // First value is usually per 100g/ml, second is per serving
      const per100Value = parseFloat(matches[0][1].replace(',', '.'));
      const perServingValue = matches.length >= 2 ? parseFloat(matches[1][1].replace(',', '.')) : null;

      if (!isNaN(per100Value)) {
        result.per100g[nutrientName] = per100Value;
      }
      if (perServingValue !== null && !isNaN(perServingValue)) {
        result.perServing[nutrientName] = perServingValue;
      }
    } else if (matches.length === 1) {
      const value = parseFloat(matches[0][1].replace(',', '.'));
      if (!isNaN(value)) {
        result.per100g[nutrientName] = value;
      }
    }
  }

  // If we have per 100g values, use them as the main nutrients
  if (Object.keys(result.per100g).length > 0) {
    result.nutrients = { ...result.per100g };
  } else if (Object.keys(result.perServing).length > 0) {
    result.nutrients = { ...result.perServing };
  }

  return result;
}

export default { extractText, parseNutritionTable, parseTableLines };