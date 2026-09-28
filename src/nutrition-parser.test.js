import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseNutritionTable } from './nutrition-parser.js';

describe('parseNutritionTable', () => {
  it('should parse a German nutrition table', () => {
    const table = {
      'Energie': { value: 2292, unit: 'kJ' },
      'Fett': { value: 33, unit: 'g' },
      'davon gesättigte Fettsäuren': { value: 13, unit: 'g' },
      'Kohlenhydrate': { value: 55, unit: 'g' },
      'davon Zucker': { value: 45, unit: 'g' },
      'Ballaststoffe': { value: 2.4, unit: 'g' },
      'Eiweiß': { value: 6.8, unit: 'g' },
      'Salz': { value: 0.18, unit: 'g' }
    };

    const result = parseNutritionTable(table);

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

  it('should parse a Dutch nutrition table', () => {
    const table = {
      'energie': { value: 199, unit: 'kJ' },
      'vetten': { value: 0, unit: 'g' },
      'verzadigde vetzuren': { value: 0, unit: 'g' },
      'koolhydraten': { value: 11, unit: 'g' },
      'suikers': { value: 10, unit: 'g' },
      'vezels': { value: 0.7, unit: 'g' },
      'eiwitten': { value: 0.4, unit: 'g' },
      'zout': { value: 0, unit: 'g' }
    };

    const result = parseNutritionTable(table);

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
    const table = {
      'Energie': { value: 2292, unit: 'kJ' },
      'Fett': { value: 33, unit: 'g' }
    };

    const result = parseNutritionTable(table);

    assert.deepEqual(result, {
      energyKj: 2292,
      energyKcal: 549,
      fat: 33,
      saturatedFat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      protein: 0,
      sodium: 0
    });
  });

  it('should return zeros for empty table', () => {
    const result = parseNutritionTable({});

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