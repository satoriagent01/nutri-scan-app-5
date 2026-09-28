# NutriScan - Plan

## Requirements

- **OCR from product photos**: Extract nutrition table data from images of product labels
- **Custom nutrient tracking**: Track any nutrient (calories, sodium, saturated fats, etc.)
- **Meal planner**: Add products with custom gram amounts to meals
- **Free and no ads**: Open source, no paywalls
- **Multi-language support**: Handle nutrition labels in German, Dutch, French, Italian, Spanish, etc.

## Shared Images Analysis

### Image 1 (Chocolate bar - German/French/Italian)
- Nutrition table with columns: per 100g and per serving (30g = 1 Melto)
- Nutrients: Energie, Fett, davon gesättigte Fettsäuren, Kohlenhydrate, davon Zucker, Ballaststoffe, Eiweiß, Salz
- Values in kJ/kcal for energy, grams for others
- Multi-language headers (German/French/Italian/Dutch)

### Image 2 (Apple juice - Dutch)
- Nutrition table with columns: per 100ml and per glass (200ml)
- Nutrients: energie, vetten (waarvan verzadigde vetzuren, onverzadigde vetzuren), koolhydraten (waarvan suikers, vezels, zoetstoffen), eiwitten, zout
- Additional: vitamin C percentage
- Serving size: 5 porties (200ml) from 1L

### Image 3 (Olive oil spray - Dutch)
- Nutrition table: per 100ml
- Nutrients: energie, vetten, koolhydraten, vezels, eiwitten, zout
- Additional: vitamin E percentage
- Serving suggestion: 5-10cm distance, 0g added sugars per 100ml

## Architecture

### Stack
- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework for simplicity)
- **OCR**: Tesseract.js (browser-based, no API key needed)
- **Storage**: LocalStorage (no backend needed)
- **Testing**: Node.js built-in test runner

### Modules

1. **OCR Module** (`src/ocr.js`): Wraps Tesseract.js to extract text from images
2. **Nutrition Parser** (`src/nutrition-parser.js`): Parses OCR text into structured nutrition data
3. **Meal Planner** (`src/meal-planner.js`): Manages meals, products, and nutrient calculations
4. **Storage** (`src/storage.js`): Persists data to LocalStorage
5. **App** (`src/app.js`): Main entry point wiring everything together
6. **Frontend** (`public/app.js`, `public/index.html`, `public/styles.css`): UI interactions

## Decisions

- **No backend**: All data stays on the user's device
- **No API keys**: Tesseract.js runs entirely in the browser
- **Simple stack**: Vanilla JS, no build step required
- **LocalStorage**: Simple persistence, no database needed

## What Comes Next

- Barcode scanning integration
- OpenFoodFacts database integration
- PWA support for mobile
- Cloud sync
- Export functionality