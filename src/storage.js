/**
 * Storage module for persisting products, meals, and history
 * using localStorage.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'nutriscan_products',
  MEALS: 'nutriscan_meals',
  HISTORY: 'nutriscan_history'
};

/**
 * Save products to localStorage.
 * @param {Object[]} products - Array of product objects.
 */
export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

/**
 * Load products from localStorage.
 * @returns {Object[]} Array of product objects.
 */
export function loadProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

/**
 * Save meals to localStorage.
 * @param {Object[]} meals - Array of meal objects.
 */
export function saveMeals(meals) {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

/**
 * Load meals from localStorage.
 * @returns {Object[]} Array of meal objects.
 */
export function loadMeals() {
  const data = localStorage.getItem(STORAGE_KEYS.MEALS);
  return data ? JSON.parse(data) : [];
}

/**
 * Save history to localStorage.
 * @param {Object[]} history - Array of history objects.
 */
export function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

/**
 * Load history from localStorage.
 * @returns {Object[]} Array of history objects.
 */
export function loadHistory() {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

/**
 * Add a product to storage.
 * @param {Object} product - The product to add.
 * @returns {Object[]} Updated products array.
 */
export function addProduct(product) {
  const products = loadProducts();
  // Check if product already exists
  const existingIndex = products.findIndex(p => p.id === product.id);
  if (existingIndex !== -1) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  saveProducts(products);
  return products;
}

/**
 * Remove a product from storage.
 * @param {number} productId - The ID of the product to remove.
 * @returns {Object[]} Updated products array.
 */
export function removeProduct(productId) {
  const products = loadProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProducts(filtered);
  return filtered;
}

/**
 * Add a meal to storage.
 * @param {Object} meal - The meal to add.
 * @returns {Object[]} Updated meals array.
 */
export function addMeal(meal) {
  const meals = loadMeals();
  meals.push(meal);
  saveMeals(meals);
  return meals;
}

/**
 * Remove a meal from storage.
 * @param {number} mealId - The ID of the meal to remove.
 * @returns {Object[]} Updated meals array.
 */
export function removeMeal(mealId) {
  const meals = loadMeals();
  const filtered = meals.filter(m => m.id !== mealId);
  saveMeals(filtered);
  return filtered;
}

/**
 * Add an entry to history.
 * @param {Object} entry - The history entry to add.
 * @returns {Object[]} Updated history array.
 */
export function addHistoryEntry(entry) {
  const history = loadHistory();
  history.unshift(entry); // Add to beginning
  // Keep only last 100 entries
  if (history.length > 100) {
    history.pop();
  }
  saveHistory(history);
  return history;
}

/**
 * Clear all storage.
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.MEALS);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export default {
  saveProducts,
  loadProducts,
  saveMeals,
  loadMeals,
  saveHistory,
  loadHistory,
  addProduct,
  removeProduct,
  addMeal,
  removeMeal,
  addHistoryEntry,
  clearStorage
};