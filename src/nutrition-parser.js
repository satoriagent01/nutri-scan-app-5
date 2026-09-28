/**
 * Nutrition parser module - deterministic parsing of nutrition data
 * from OCR text extracted from product labels.
 */

/**
 * Parse a nutrition table from OCR text.
 * @param {string} ocrText - The raw OCR text from the image.
 * @returns {Object|null} Parsed nutrition data or null if no table found.
 */
export function parseNutritionTable(ocrText) {
  if (!ocrText || typeof ocrText !== 'string') {
    return null;
  }

  const lines = ocrText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    return null;
  }

  // Find the nutrition table section
  const tableSection = findNutritionTable(lines);
  if (!tableSection) {
    return null;
  }

  // Parse the table into structured data
  return parseTableData(tableSection);
}

/**
 * Find the nutrition table section in the OCR text.
 * @param {string[]} lines - Lines of OCR text.
 * @returns {string[]|null} The table lines or null if not found.
 */
function findNutritionTable(lines) {
  // Look for table start markers
  const tableStartKeywords = [
    'nahrwertdeklaration',
    'declaration nutritionnelle',
    'voedingswaarde',
    'dichiarazione nutrizionale',
    'voedingswaarde per',
    'nutrition facts',
    'nährwertdeklaration'
  ];

  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    for (const keyword of tableStartKeywords) {
      if (lineLower.includes(keyword)) {
        startIndex = i;
        break;
      }
    }
    if (startIndex !== -1) break;
  }

  if (startIndex === -1) {
    // Fallback: look for energy/nutrient rows
    const nutrientKeywords = [
      'energie', 'energy', 'fett', 'fat', 'kohlenhydrate', 'carbohydrates',
      'zucker', 'sugar', 'eiweiss', 'protein', 'salz', 'salt'
    ];

    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      for (const keyword of nutrientKeywords) {
        if (lineLower.includes(keyword)) {
          startIndex = i;
          break;
        }
      }
      if (startIndex !== -1) break;
    }
  }

  if (startIndex === -1) {
    return null;
  }

  // Find the end of the table
  let endIndex = startIndex;
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    // Table ends at empty line or when we see non-table content
    if (line === '' || line.includes('---') || line.includes('___')) {
      // Check if next line has more table data
      if (i + 1 < lines.length && isTableDataRow(lines[i + 1])) {
        endIndex = i;
      } else {
        break;
      }
    } else if (isTableDataRow(line)) {
      endIndex = i;
    } else {
      break;
    }
  }

  return lines.slice(startIndex, endIndex + 1);
}

/**
 * Check if a line is a table data row.
 * @param {string} line - The line to check.
 * @returns {boolean} True if it's a table data row.
 */
function isTableDataRow(line) {
  // Table rows typically contain nutrient names and numeric values
  const hasNutrient = /(?:energie|energy|fett|fat|kohlenhydrate|carbohydrates|zucker|sugar|eiweiss|protein|salz|salt|fiber|fibres|vezels)/i.test(line);
  const hasValue = /\d+[\s,\.]*\d*\s*(g|kJ|kcal|%|mg|ml)/i.test(line);
  return hasNutrient || hasValue;
}

/**
 * Parse table data into structured nutrition information.
 * @param {string[]} tableLines - Lines of the nutrition table.
 * @returns {Object} Parsed nutrition data.
 */
function parseTableData(tableLines) {
  const result = {
    nutrients: {},
    servingSize: null,
    servingUnit: null,
    perServing: {},
    per100g: {}
  };

  // Parse each line
  for (const line of tableLines) {
    // Try to extract serving size from header
    const servingMatch = line.match(/(\d+)\s*(g|ml|stuck|stuk|portie|porzione|portion)/i);
    if (servingMatch) {
      result.servingSize = parseInt(servingMatch[1], 10);
      result.servingUnit = servingMatch[2].toLowerCase();
      continue;
    }

    // Parse nutrient rows
    const nutrient = parseNutrientRow(line);
    if (nutrient) {
      // Determine if this is per 100g or per serving
      if (nutrient.per100g !== null) {
        result.per100g[nutrient.name] = nutrient.per100g;
      }
      if (nutrient.perServing !== null) {
        result.perServing[nutrient.name] = nutrient.perServing;
      }
    }
  }

  // Set main nutrients (prefer per 100g, fall back to per serving)
  if (Object.keys(result.per100g).length > 0) {
    result.nutrients = { ...result.per100g };
  } else if (Object.keys(result.perServing).length > 0) {
    result.nutrients = { ...result.perServing };
  }

  return result;
}

/**
 * Parse a single nutrient row.
 * @param {string} line - The line to parse.
 * @returns {Object|null} Parsed nutrient data or null.
 */
function parseNutrientRow(line) {
  // Nutrient name mappings
  const nutrientMap = {
    'energie': { name: 'energy', unit: 'kJ' },
    'energy': { name: 'energy', unit: 'kJ' },
    'fett': { name: 'fat', unit: 'g' },
    'matieres grasses': { name: 'fat', unit: 'g' },
    'vetten': { name: 'fat', unit: 'g' },
    'grassi': { name: 'fat', unit: 'g' },
    'davon gesattigte fettsauren': { name: 'saturated fat', unit: 'g' },
    'dont acides gras satures': { name: 'saturated fat', unit: 'g' },
    'waarvan verzadigde vetzuren': { name: 'saturated fat', unit: 'g' },
    'di cui acidi grassi saturi': { name: 'saturated fat', unit: 'g' },
    'kohlenhydrate': { name: 'carbohydrates', unit: 'g' },
    'glucides': { name: 'carbohydrates', unit: 'g' },
    'koolhydraten': { name: 'carbohydrates', unit: 'g' },
    'carboidrati': { name: 'carbohydrates', unit: 'g' },
    'davon zucker': { name: 'sugars', unit: 'g' },
    'dont sucres': { name: 'sugars', unit: 'g' },
    'waarvan suikers': { name: 'sugars', unit: 'g' },
    'di cui zuccheri': { name: 'sugars', unit: 'g' },
    'ballaststoffe': { name: 'fiber', unit: 'g' },
    'fibres alimentaires': { name: 'fiber', unit: 'g' },
    'vezels': { name: 'fiber', unit: 'g' },
    'fibra': { name: 'fiber', unit: 'g' },
    'eiweiss': { name: 'protein', unit: 'g' },
    'proteines': { name: 'protein', unit: 'g' },
    'eiwitten': { name: 'protein', unit: 'g' },
    'proteine': { name: 'protein', unit: 'g' },
    'salz': { name: 'salt', unit: 'g' },
    'sel': { name: 'salt', unit: 'g' },
    'zout': { name: 'salt', unit: 'g' },
    'sale': { name: 'salt', unit: 'g' }
  };

  let nutrientInfo = null;
  const lineLower = line.toLowerCase();

  for (const [key, value] of Object.entries(nutrientMap)) {
    if (lineLower.includes(key)) {
      nutrientInfo = value;
      break;
    }
  }

  if (!nutrientInfo) {
    return null;
  }

  // Extract numeric values
  const valuePattern = /(\d+[\s,\.]*\d*)\s*(g|kJ|kcal|%|mg|ml)/gi;
  const matches = [...line.matchAll(valuePattern)];

  let per100g = null;
  let perServing = null;

  if (matches.length >= 2) {
    // First value is usually per 100g, second is per serving
    per100g = parseFloat(matches[0][1].replace(',', '.'));
    perServing = parseFloat(matches[1][1].replace(',', '.'));
  } else if (matches.length === 1) {
    per100g = parseFloat(matches[0][1].replace(',', '.'));
  }

  return {
    name: nutrientInfo.name,
    unit: nutrientInfo.unit,
    per100g: isNaN(per100g) ? null : per100g,
    perServing: isNaN(perServing) ? null : perServing
  };
}

export default { parseNutritionTable };