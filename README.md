# NutriScan

**Free nutrition tracker with OCR from product photos — no ads, no paywalls.**

Take a photo of a product's nutrition label, and NutriScan extracts the nutritional information using OCR (Tesseract.js). You can then track calories, sodium, saturated fats, or any custom nutrient by specifying how many grams of each product you consume.

## Features

- 📸 **OCR from photos**: Extract nutrition tables from product images using Tesseract.js
- 🥗 **Custom meal planner**: Add products with custom gram amounts to your meals
- 📊 **Track any nutrient**: Calories, sodium, saturated fats, sugars, proteins — you choose
- 💾 **Local storage**: All data stays on your device, no account needed
- 🌍 **Multi-language**: Supports nutrition labels in German, Dutch, French, Italian, Spanish, and more

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nutri-scan-app.git
   cd nutri-scan-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open `public/index.html` in your browser (or serve it with a local server):
   ```bash
   npx serve public
   ```

## Usage

1. **Scan a product**: Click "Scan Product", take or upload a photo of the nutrition label
2. **Review extracted data**: The app parses the nutrition table and shows you the values
3. **Save the product**: Give it a name and save it to your product library
4. **Plan meals**: Add saved products to meals, specifying the grams you consume
5. **Track nutrients**: View totals for calories, sodium, fats, and any custom nutrient

## Testing

Run the test suite:

```bash
npm test
```

## What's Not Done Yet

- Cloud sync across devices
- Barcode scanning (EAN/UPC)
- Nutrient database integration (OpenFoodFacts)
- Mobile app (PWA support planned)
- Export to CSV/PDF
- Dark mode

## License

MIT