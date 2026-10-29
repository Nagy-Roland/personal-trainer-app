// src/api/categories.js

/**
 * Fetches all exercise categories from the wger API
 * @returns {Promise<Array>} - Array of category objects { id, name }
 */
export async function fetchCategoriesFromAPI() {
  try {
    const response = await fetch('https://wger.de/api/v2/exercisecategory/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Failed to fetch categories from API:', error);
    return [];
  }
}