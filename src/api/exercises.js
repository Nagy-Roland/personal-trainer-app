// src/api/exercises.js

/**
 * Fetches exercises from wger API based on a category ID and normalizes the data structure,
 * filtering specifically for English translations.
 * @param {number} categoryId - The category ID (e.g., 11 for Chest)
 * @returns {Promise<Array>} - An array of normalized English exercise objects
 */
export async function fetchExercisesByCategory(categoryId) {
  try {
    const response = await fetch(
      `https://wger.de/api/v2/exerciseinfo/?category=${categoryId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return (data.results || []).map((ex, index) => {
      const englishTranslation = ex.translations?.find(t => t.language === 2);

      const resolvedName = 
        englishTranslation?.name || 
        ex.name || 
        ex.exercise_base_name || 
        `Exercise #${ex.id || index + 1}`;

      const resolvedDescription = 
        englishTranslation?.description || 
        ex.description || 
        '';

      return {
        ...ex,
        name: resolvedName,
        description: resolvedDescription,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch exercises for category ID ${categoryId}:`, error);
    return [];
  }
}