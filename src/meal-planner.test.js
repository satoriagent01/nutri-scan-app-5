import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createMealPlanner } from './meal-planner.js';

describe('createMealPlanner', () => {
  it('should add a meal with a product and calculate nutrition', () => {
    const planner = createMealPlanner();
    const product = {
      name: 'Chocolate Bar',
      nutrition: {
        energyKj: 2292,
        energyKcal: 549,
        fat: 33,
        saturatedFat: 13,
        carbs: 55,
        sugar: 45,
        fiber: 2.4,
        protein: 6.8,
        sodium: 0.18
      }
    };

    planner.addMeal('Lunch', product, 100);

    const meals = planner.getMeals();
    assert.equal(meals.length, 1);
    assert.equal(meals[0].name, 'Lunch');
    assert.equal(meals[0].items.length, 1);
    assert.equal(meals[0].items[0].productName, 'Chocolate Bar');
    assert.equal(meals[0].items[0].grams, 100);
    assert.equal(meals[0].items[0].nutrition.energyKcal, 549);
  });

  it('should calculate nutrition for partial serving', () => {
    const planner = createMealPlanner();
    const product = {
      name: 'Chocolate Bar',
      nutrition: {
        energyKj: 2292,
        energyKcal: 549,
        fat: 33,
        saturatedFat: 13,
        carbs: 55,
        sugar: 45,
        fiber: 2.4,
        protein: 6.8,
        sodium: 0.18
      }
    };

    planner.addMeal('Snack', product, 50);

    const meals = planner.getMeals();
    assert.equal(meals[0].items[0].nutrition.energyKcal, 274.5);
    assert.equal(meals[0].items[0].nutrition.fat, 16.5);
  });

  it('should calculate daily totals', () => {
    const planner = createMealPlanner();
    const product1 = {
      name: 'Chocolate Bar',
      nutrition: {
        energyKj: 2292,
        energyKcal: 549,
        fat: 33,
        saturatedFat: 13,
        carbs: 55,
        sugar: 45,
        fiber: 2.4,
        protein: 6.8,
        sodium: 0.18
      }
    };
    const product2 = {
      name: 'Apple',
      nutrition: {
        energyKj: 218,
        energyKcal: 52,
        fat: 0.2,
        saturatedFat: 0,
        carbs: 14,
        sugar: 10,
        fiber: 2.4,
        protein: 0.3,
        sodium: 0.01
      }
    };

    planner.addMeal('Lunch', product1, 100);
    planner.addMeal('Snack', product2, 150);

    const totals = planner.getDailyTotals();

    assert.equal(totals.energyKcal, 627);
    assert.equal(totals.fat, 33.2);
    assert.equal(totals.carbs, 66);
    assert.equal(totals.sugar, 55);
    assert.equal(totals.fiber, 4.8);
    assert.equal(totals.protein, 7.1);
    assert.equal(totals.saturatedFat, 13);
    assert.equal(totals.sodium, 0.19);
  });

  it('should handle multiple meals', () => {
    const planner = createMealPlanner();
    const product = {
      name: 'Chocolate Bar',
      nutrition: {
        energyKj: 2292,
        energyKcal: 549,
        fat: 33,
        saturatedFat: 13,
        carbs: 55,
        sugar: 45,
        fiber: 2.4,
        protein: 6.8,
        sodium: 0.18
      }
    };

    planner.addMeal('Breakfast', product, 50);
    planner.addMeal('Lunch', product, 100);
    planner.addMeal('Dinner', product, 75);

    const meals = planner.getMeals();
    assert.equal(meals.length, 3);
    assert.equal(meals[0].name, 'Breakfast');
    assert.equal(meals[1].name, 'Lunch');
    assert.equal(meals[2].name, 'Dinner');
  });

  it('should remove a meal', () => {
    const planner = createMealPlanner();
    const product = {
      name: 'Chocolate Bar',
      nutrition: {
        energyKj: 2292,
        energyKcal: 549,
        fat: 33,
        saturatedFat: 13,
        carbs: 55,
        sugar: 45,
        fiber: 2.4,
        protein: 6.8,
        sodium: 0.18
      }
    };

    planner.addMeal('Lunch', product, 100);
    planner.removeMeal(0);

    const meals = planner.getMeals();
    assert.equal(meals.length, 0);
  });
});