import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractNutritionTable } from './ocr.js';

test('extractNutritionTable should extract nutrition table from OCR text', () => {
  const ocrText = `
    Nährwertdeklaration
    Energie 2292 kJ / 549 kcal
    Fett 33 g
    davon gesättigte Fettsäuren 13 g
    Kohlenhydrate 55 g
    davon Zucker 45 g
    Ballaststoffe 2,4 g
    Eiweiß 6,8 g
    Salz 0,18 g
  `;
  const result = extractNutritionTable(ocrText);
  assert.ok(result);
  assert.equal(result.Energie, 549);
  assert.equal(result.Fett, 33);
  assert.equal(result.Kohlenhydrate, 55);
  assert.equal(result.Zucker, 45);
  assert.equal(result.Eiweiß, 6.8);
  assert.equal(result.Salz, 0.18);
});

test('extractNutritionTable should handle Dutch nutrition table', () => {
  const ocrText = `
    Voedingswaarde per 100 ml
    energie 199 kJ / 47 kcal
    vetten, waarvan 0 g
    koolhydraten, waarvan 11 g
    - suikers 10 g
    eiwitten 0,7 g
    zout 0 g
  `;
  const result = extractNutritionTable(ocrText);
  assert.ok(result);
  assert.equal(result.Energie, 47);
  assert.equal(result.Vetten, 0);
  assert.equal(result.Koolhydraten, 11);
  assert.equal(result.Suikers, 10);
  assert.equal(result.Eiwitten, 0.7);
  assert.equal(result.Zout, 0);
});

test('extractNutritionTable should handle missing values gracefully', () => {
  const ocrText = `
    Energie 2292 kJ / 549 kcal
    Fett 33 g
  `;
  const result = extractNutritionTable(ocrText);
  assert.ok(result);
  assert.equal(result.Energie, 549);
  assert.equal(result.Fett, 33);
  assert.equal(result.Kohlenhydrate, 0);
  assert.equal(result.Zucker, 0);
});

test('extractNutritionTable should return zeros for empty table', () => {
  const ocrText = 'No nutrition information here';
  const result = extractNutritionTable(ocrText);
  assert.ok(result);
  assert.equal(result.Energie, 0);
  assert.equal(result.Fett, 0);
  assert.equal(result.Kohlenhydrate, 0);
  assert.equal(result.Zucker, 0);
  assert.equal(result.Eiweiß, 0);
  assert.equal(result.Salz, 0);
});