/**
 * Meal planner module for tracking meals with custom gram amounts.
 * Allows users to add products to meals with custom serving sizes
 * and track nutritional intake across meals.
 */

/**
 * Create a new meal planner instance.
 * @returns {Object} The meal planner instance.
 */
export function createMealPlanner() {
  const meals = [];
  let currentMealId = 1;

  /**
   * Add a product to the current meal.
   * @param {Object} product - The product to add.
   * @param {number} grams - The amount in grams.
   * @returns {Object} The added meal item.
   */
  function addProductToMeal(product, grams) {
    const mealItem = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      grams: grams,
      nutrition: calculateNutrition(product, grams)
    };

    // Add to current meal or create new meal
    let currentMeal = getCurrentMeal();
    if (!currentMeal) {
      currentMeal = createNewMeal();
    }

    currentMeal.items.push(mealItem);
    return mealItem;
  }

  /**
   * Calculate nutrition for a given amount of product.
   * @param {Object} product - The product.
   * @param {number} grams - The amount in grams.
   * @returns {Object} Calculated nutrition values.
   */
  function calculateNutrition(product, grams) {
    const nutrition = {};
    const factor = grams / 100; // Convert to per 100g basis

    for (const [nutrient, value] of Object.entries(product.nutrients || {})) {
      nutrition[nutrient] = Math.round(value * factor * 100) / 100;
    }

    return nutrition;
  }

  /**
   * Get the current meal.
   * @returns {Object|null} The current meal or null.
   */
  function getCurrentMeal() {
    return meals.find(meal => !meal.completed);
  }

  /**
   * Create a new meal.
   * @returns {Object} The new meal.
   */
  function createNewMeal() {
    const meal = {
      id: currentMealId++,
      date: new Date().toISOString(),
      name: `Meal ${currentMealId - 1}`,
      items: [],
      completed: false
    };

    meals.push(meal);
    return meal;
  }

  /**
   * Complete the current meal.
   * @returns {Object|null} The completed meal or null.
   */
  function completeCurrentMeal() {
    const currentMeal = getCurrentMeal();
    if (currentMeal) {
      currentMeal.completed = true;
      return currentMeal;
    }
    return null;
  }

  /**
   * Get all meals.
   * @returns {Object[]} All meals.
   */
  function getAllMeals() {
    return meals;
  }

  /**
   * Get meal summary with total nutrition.
   * @param {Object} meal - The meal to summarize.
   * @returns {Object} Meal summary with total nutrition.
   */
  function getMealSummary(meal) {
    const summary = {
      id: meal.id,
      date: meal.date,
      name: meal.name,
      items: meal.items,
      totalNutrition: {}
    };

    // Sum up all nutrition values
    for (const item of meal.items) {
      for (const [nutrient, value] of Object.entries(item.nutrition)) {
        if (!summary.totalNutrition[nutrient]) {
          summary.totalNutrition[nutrient] = 0;
        }
        summary.totalNutrition[nutrient] += value;
      }
    }

    // Round total nutrition values
    for (const [nutrient, value] of Object.entries(summary.totalNutrition)) {
      summary.totalNutrition[nutrient] = Math.round(value * 100) / 100;
    }

    return summary;
  }

  /**
   * Delete a meal.
   * @param {number} mealId - The ID of the meal to delete.
   */
  function deleteMeal(mealId) {
    const index = meals.findIndex(meal => meal.id === mealId);
    if (index !== -1) {
      meals.splice(index, 1);
    }
  }

  /**
   * Get total nutrition across all meals.
   * @returns {Object} Total nutrition values.
   */
  function getTotalNutrition() {
    const total = {};

    for (const meal of meals) {
      for (const item of meal.items) {
        for (const [nutrient, value] of Object.entries(item.nutrition)) {
          if (!total[nutrient]) {
            total[nutrient] = 0;
          }
          total[nutrient] += value;
        }
      }
    }

    // Round total nutrition values
    for (const [nutrient, value] of Object.entries(total)) {
      total[nutrient] = Math.round(value * 100) / 100;
    }

    return total;
  }

  return {
    addProductToMeal,
    getCurrentMeal,
    createNewMeal,
    completeCurrentMeal,
    getAllMeals,
    getMealSummary,
    deleteMeal,
    getTotalNutrition
  };
}

export default { createMealPlanner };