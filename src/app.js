/**
 * Main application entry point that wires together all modules.
 * This file is not used in the browser version but serves as
 * the main entry point for Node.js testing and potential server-side use.
 */

import { createMealPlanner } from './meal-planner.js';
import * as storage from './storage.js';
import { parseNutritionTable } from './nutrition-parser.js';

/**
 * Initialize the application.
 * @returns {Object} The initialized application.
 */
export function initApp() {
  const mealPlanner = createMealPlanner();
  
  // Load saved data
  const savedProducts = storage.loadProducts();
  const savedMeals = storage.loadMeals();
  const savedHistory = storage.loadHistory();

  return {
    mealPlanner,
    storage,
    parseNutritionTable,
    savedProducts,
    savedMeals,
    savedHistory
  };
}

export default { initApp };