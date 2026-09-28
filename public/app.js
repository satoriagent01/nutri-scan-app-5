import { scanImage } from '../src/ocr.js';
import { parseNutritionTable } from '../src/nutrition-parser.js';
import { addMeal, getMeals, deleteMeal } from '../src/meal-planner.js';
import { saveProduct, getProducts, deleteProduct } from '../src/storage.js';

// DOM Elements
const imageInput = document.getElementById('image-input');
const scanProgress = document.getElementById('scan-progress');
const scanResult = document.getElementById('scan-result');
const nutritionInfo = document.getElementById('nutrition-info');
const saveProductBtn = document.getElementById('save-product-btn');
const mealNameInput = document.getElementById('meal-name');
const mealDateInput = document.getElementById('meal-date');
const addMealBtn = document.getElementById('add-meal-btn');
const mealsList = document.getElementById('meals-list');
const historyList = document.getElementById('history-list');
const productsList = document.getElementById('products-list');

// Set today's date as default
mealDateInput.value = new Date().toISOString().split('T')[0];

// Handle image upload and scanning
imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show progress
  scanProgress.style.display = 'block';
  scanResult.style.display = 'none';

  try {
    // Perform OCR
    const ocrResult = await scanImage(file);
    
    // Parse nutrition table
    const nutritionData = parseNutritionTable(ocrResult);
    
    // Display results
    displayNutritionInfo(nutritionData);
    scanResult.style.display = 'block';
  } catch (error) {
    console.error('Error scanning image:', error);
    alert('Error al escanear la imagen. Por favor, intenta de nuevo.');
  } finally {
    scanProgress.style.display = 'none';
  }
});

// Display nutrition information
function displayNutritionInfo(data) {
  nutritionInfo.innerHTML = '';
  
  const items = [
    { label: 'Calorías', value: `${data.calories} kcal`, key: 'calories' },
    { label: 'Grasas', value: `${data.fat}g`, key: 'fat' },
    { label: 'Carbohidratos', value: `${data.carbs}g`, key: 'carbs' },
    { label: 'Proteínas', value: `${data.protein}g`, key: 'protein' },
    { label: 'Azúcar', value: `${data.sugar}g`, key: 'sugar' },
    { label: 'Sodio', value: `${data.sodium}mg`, key: 'sodium' }
  ];

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'nutrition-item';
    div.innerHTML = `
      <div class="value">${item.value}</div>
      <div class="label">${item.label}</div>
    `;
    nutritionInfo.appendChild(div);
  });

  // Store current nutrition data for saving
  window.currentNutritionData = data;
}

// Save product
saveProductBtn.addEventListener('click', () => {
  if (!window.currentNutritionData) return;

  const productName = prompt('Nombre del producto:');
  if (!productName) return;

  const product = {
    id: Date.now(),
    name: productName,
    nutrition: window.currentNutritionData,
    date: new Date().toISOString()
  };

  saveProduct(product);
  alert('Producto guardado exitosamente!');
  loadProducts();
});

// Add meal
addMealBtn.addEventListener('click', () => {
  const name = mealNameInput.value.trim();
  const date = mealDateInput.value;

  if (!name || !date) {
    alert('Por favor, ingresa el nombre y la fecha de la comida.');
    return;
  }

  const meal = {
    id: Date.now(),
    name,
    date,
    nutrition: window.currentNutritionData || {
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
      sugar: 0,
      sodium: 0
    }
  };

  addMeal(meal);
  mealNameInput.value = '';
  alert('Comida agregada exitosamente!');
  loadMeals();
});

// Load meals
function loadMeals() {
  const meals = getMeals();
  mealsList.innerHTML = '';

  meals.forEach(meal => {
    const div = document.createElement('div');
    div.className = 'meal-item';
    div.innerHTML = `
      <div class="meal-info">
        <strong>${meal.name}</strong>
        <p>${meal.date}</p>
        <p>Calorías: ${meal.nutrition.calories} kcal</p>
      </div>
      <div class="meal-actions">
        <button class="delete-btn" data-id="${meal.id}">Eliminar</button>
      </div>
    `;
    mealsList.appendChild(div);
  });

  // Add delete event listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      deleteMeal(id);
      loadMeals();
    });
  });
}

// Load products
function loadProducts() {
  const products = getProducts();
  productsList.innerHTML = '';

  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <div class="product-info">
        <strong>${product.name}</strong>
        <p>Calorías: ${product.nutrition.calories} kcal</p>
        <p>Guardado: ${new Date(product.date).toLocaleDateString()}</p>
      </div>
      <div class="product-actions">
        <button class="delete-btn" data-id="${product.id}">Eliminar</button>
      </div>
    `;
    productsList.appendChild(div);
  });

  // Add delete event listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      deleteProduct(id);
      loadProducts();
    });
  });
}

// Load initial data
loadMeals();
loadProducts();