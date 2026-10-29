import { useState } from 'react';
import { WORKOUT_SPLITS, AVAILABLE_TAGS } from '../data/workoutSplits';
import { fetchExercisesByCategory } from '../api/exercises';
import { generateDynamicSchedule } from '../utils/scheduleGenerator';

export function useWorkoutApp() {
  const [step, setStep] = useState('splits');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [frequency, setFrequency] = useState(3);
  const [workoutSchedule, setWorkoutSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const handleSelectSplit = (split) => {
    setSelectedSplit(split);
    setFrequency(split.recommendedDays[0] || 3);
    setStep('frequency');
  };

  const handleConfirmFrequency = async () => {
    setLoading(true);
    try {
      const exercisePromises = selectedSplit.categoriesCovered.map(async (cat) => {
        const exercises = await fetchExercisesByCategory(cat.id);
        return { 
          categoryId: cat.id, 
          categoryName: cat.name, 
          exercises: exercises.map(ex => ({ ...ex, categoryName: cat.name }))
        };
      });

      const categoryResults = await Promise.all(exercisePromises);
      const dynamicSchedule = generateDynamicSchedule(categoryResults, frequency);

      setWorkoutSchedule(dynamicSchedule);
      setStep('walkthrough');
    } catch (err) {
      console.error("Failed to build schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSplits = () => {
    setStep('splits');
    setSelectedSplit(null);
    setWorkoutSchedule([]);
  };

  const filteredSplits = WORKOUT_SPLITS.filter((split) => {
    const matchesName = split.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.every((tag) =>
      split.categoriesCovered.some((cat) => cat.name.toLowerCase() === tag.toLowerCase())
    );
    return matchesName && matchesTags;
  });

  return {
    step,
    searchQuery,
    selectedTags,
    AVAILABLE_TAGS,
    filteredSplits,
    isFiltered: searchQuery !== '' || selectedTags.length > 0,
    selectedSplit,
    frequency,
    setFrequency,
    workoutSchedule,
    loading,
    handleToggleTag,
    handleResetFilters,
    handleSearchChange: (e) => setSearchQuery(e.target.value),
    handleSelectSplit,
    handleConfirmFrequency,
    handleBackToSplits,
  };
}