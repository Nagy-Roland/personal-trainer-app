/**
 * Dynamically builds a workout schedule based on frequency and available categories.
 * @param {Array} categoryResults - Array of { categoryId, categoryName, exercises }
 * @param {number} frequency - Exact number of days selected by user
 */
export function generateDynamicSchedule(categoryResults, frequency) {
  const activeCategories = categoryResults.filter(cat => cat.exercises.length > 0);

  if (activeCategories.length === 0) return [];

  // Initialize N days based strictly on user frequency slider
  const schedule = Array.from({ length: frequency }, (_, i) => ({
    dayNumber: i + 1,
    dayName: `Day ${i + 1}`,
    categoriesCovered: [],
    exercises: []
  }));

  // Round-robin distribute active categories across the N days
  activeCategories.forEach((cat, index) => {
    const targetDayIndex = index % frequency;
    schedule[targetDayIndex].categoriesCovered.push(cat.categoryName);
    schedule[targetDayIndex].exercises.push(...cat.exercises);
  });

  // Format clean titles based on distributed categories
  return schedule.map((day) => ({
    ...day,
    dayName: day.categoriesCovered.length > 0
      ? `Day ${day.dayNumber}: ${day.categoriesCovered.join(' & ')}`
      : `Day ${day.dayNumber}: Rest / Active Recovery`
  }));
}