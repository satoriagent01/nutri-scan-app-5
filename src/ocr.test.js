import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractNutritionTable } from './ocr.js';

describe('extractNutritionTable', () => {
  it('should extract nutrition values from a typical nutrition table', () => {
    const ocrText = `
      Nährwertdeklaration
      Energie 2292 kJ 549 kcal
      Fett 33 g
      davon gesättigte Fettsäuren 13 g
      Kohlenhydrate 55 g
      davon Zucker 45 g
      Ballaststoffe 2,4 g
      Eiweiß 6,8 g
      Salz 0,18 g
    `;

    const result = extractNutritionTable(ocrText);

    assert.deepEqual(result, {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
      saturatedFat: 13,
      carbs: 55,
      sugar: 45,
      fiber: 2.4,
      protein: 6.8,
      sodium: 0.18
    });
  });

  it('should handle Dutch nutrition table', () => {
    const ocrText = `
      Voedingswaarde per 100 ml
      energie 199 kJ / 47 kcal
      vetten, waarvan 0 g
      - verzadigde vetzuren 0 g
      - onverzadigde vetzuren 0 g
      koolhydraten, waarvan 11 g
      - suikers 10 g
      - zoetstoffen 0 g
      vezels 0,7 g
      eiwitten 0,4 g
      zout 0 g
    `;

    const result = extractNutritionTable(ocrText);

    assert.deepEqual(result, {
      energyKj: 199,
      energyKcal: 47,
      fat: 0,
      saturatedFat: 0,
      carbs: 11,
      sugar: 10,
      fiber: 0.7,
      protein: 0.4,
      sodium: 0
    });
  });

  it('should handle missing values gracefully', () => {
    const ocrText = `
      Energie 2292 kJ 549 kcal
      Fett 33 g
      Kohlenhydrate 55 g
    `;

    const result = extractNutritionTable(ocrText);

    assert.deepEqual(result, {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
      saturatedFat: 0,
      carbs: 55,
      sugar: 0,
      fiber: 0,
      protein: 0,
      sodium: 0
    });
  });

  it('should return zeros for empty text', () => {
    const result = extractNutritionTable('');

    assert.deepEqual(result, {
      energyKj: 0,
      energyKcal: 0,
      fat: 0,
      saturatedFat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      protein: 0,
      sodium: 0
    });
  });
});