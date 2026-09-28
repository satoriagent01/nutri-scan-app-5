import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from './storage.js';

describe('createStorage', () => {
  it('should save and retrieve a product', () => {
    const storage = createStorage();
    const product = {
      id: '1',
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

    storage.saveProduct(product);
    const retrieved = storage.getProduct('1');

    assert.deepEqual(retrieved, product);
  });

  it('should return null for non-existent product', () => {
    const storage = createStorage();
    const retrieved = storage.getProduct('non-existent');

    assert.equal(retrieved, null);
  });

  it('should save and retrieve a meal', () => {
    const storage = createStorage();
    const meal = {
      id: '1',
      name: 'Lunch',
      items: [
        {
          productName: 'Chocolate Bar',
          grams: 100,
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
        }
      ]
    };

    storage.saveMeal(meal);
    const retrieved = storage.getMeal('1');

    assert.deepEqual(retrieved, meal);
  });

  it('should return null for non-existent meal', () => {
    const storage = createStorage();
    const retrieved = storage.getMeal('non-existent');

    assert.equal(retrieved, null);
  });

  it('should list all products', () => {
    const storage = createStorage();
    const product1 = { id: '1', name: 'Chocolate Bar', nutrition: {} };
    const product2 = { id: '2', name: 'Apple', nutrition: {} };

    storage.saveProduct(product1);
    storage.saveProduct(product2);

    const products = storage.listProducts();

    assert.equal(products.length, 2);
    assert.equal(products[0].name, 'Chocolate Bar');
    assert.equal(products[1].name, 'Apple');
  });

  it('should list all meals', () => {
    const storage = createStorage();
    const meal1 = { id: '1', name: 'Lunch', items: [] };
    const meal2 = { id: '2', name: 'Dinner', items: [] };

    storage.saveMeal(meal1);
    storage.saveMeal(meal2);

    const meals = storage.listMeals();

    assert.equal(meals.length, 2);
    assert.equal(meals[0].name, 'Lunch');
    assert.equal(meals[1].name, 'Dinner');
  });

  it('should delete a product', () => {
    const storage = createStorage();
    const product = { id: '1', name: 'Chocolate Bar', nutrition: {} };

    storage.saveProduct(product);
    storage.deleteProduct('1');

    const retrieved = storage.getProduct('1');
    assert.equal(retrieved, null);
  });

  it('should delete a meal', () => {
    const storage = createStorage();
    const meal = { id: '1', name: 'Lunch', items: [] };

    storage.saveMeal(meal);
    storage.deleteMeal('1');

    const retrieved = storage.getMeal('1');
    assert.equal(retrieved, null);
  });

  it('should handle empty storage', () => {
    const storage = createStorage();

    assert.equal(storage.listProducts().length, 0);
    assert.equal(storage.listMeals().length, 0);
  });
});