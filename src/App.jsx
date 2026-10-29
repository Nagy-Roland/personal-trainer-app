import { useState, useEffect } from 'react';
import { useWorkoutApp } from './hooks/useWorkoutApp';
import { fetchYouTubeVideoId } from './api/youtube';
import { cleanAndFormatInstructions } from './utils/instructionParser';
import './App.css';

export default function App() {
  const {
    step,
    searchQuery,
    selectedTags,
    AVAILABLE_TAGS,
    filteredSplits,
    isFiltered,
    selectedSplit,
    frequency,
    setFrequency,
    workoutSchedule,
    loading,
    handleToggleTag,
    handleResetFilters,
    handleSearchChange,
    handleSelectSplit,
    handleConfirmFrequency,
    handleBackToSplits,
  } = useWorkoutApp();

  const [walkthroughView, setWalkthroughView] = useState('selector');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Track collapsed state for each day card index
  const [collapsedDays, setCollapsedDays] = useState({});

  // Final Workout Plan state
  const [finalWorkoutPlan, setFinalWorkoutPlan] = useState({});
  const [planVideoCache, setPlanVideoCache] = useState({});

  useEffect(() => {
    async function loadVideo() {
      if (!selectedExercise) {
        setVideoId(null);
        return;
      }
      setVideoLoading(true);
      const id = await fetchYouTubeVideoId(selectedExercise.name);
      setVideoId(id);
      setVideoLoading(false);
    }
    loadVideo();
  }, [selectedExercise]);

  useEffect(() => {
    async function loadPlanVideos() {
      const newCache = { ...planVideoCache };
      let updated = false;

      for (const dayIdx of Object.keys(finalWorkoutPlan)) {
        for (const ex of finalWorkoutPlan[dayIdx]) {
          if (!newCache[ex.id]) {
            const id = await fetchYouTubeVideoId(ex.name);
            newCache[ex.id] = id;
            updated = true;
          }
        }
      }

      if (updated) {
        setPlanVideoCache(newCache);
      }
    }
    loadPlanVideos();
  }, [finalWorkoutPlan]);

  const handleAddExercise = (dayIdx, ex) => {
    setFinalWorkoutPlan(prev => {
      const currentDayExercises = prev[dayIdx] || [];
      if (currentDayExercises.some(item => item.id === ex.id)) return prev;
      return {
        ...prev,
        [dayIdx]: [
          ...currentDayExercises, 
          { ...ex, sets: 3, reps: '10' }
        ]
      };
    });
  };

  const handleRemoveExercise = (dayIdx, exId) => {
    setFinalWorkoutPlan(prev => {
      const currentDayExercises = prev[dayIdx] || [];
      return {
        ...prev,
        [dayIdx]: currentDayExercises.filter(item => item.id !== exId)
      };
    });
  };

  const handleUpdateSetsReps = (dayIdx, exId, field, value) => {
    setFinalWorkoutPlan(prev => {
      const currentDayExercises = prev[dayIdx] || [];
      return {
        ...prev,
        [dayIdx]: currentDayExercises.map(item => 
          item.id === exId ? { ...item, [field]: value } : item
        )
      };
    });
  };

  const toggleDayCollapse = (idx) => {
    setCollapsedDays(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const isExerciseAdded = (dayIdx, exId) => {
    return (finalWorkoutPlan[dayIdx] || []).some(item => item.id === exId);
  };

  const totalAddedCount = Object.values(finalWorkoutPlan).reduce(
    (acc, dayList) => acc + dayList.length, 
    0
  );

  return (
    <div className="container">
      
      {/* Header */}
      <div className="header">
        <h1 className="app-title">Personal Trainer App</h1>
        {step !== 'splits' && (
          <button onClick={() => { setWalkthroughView('selector'); handleBackToSplits(); }} className="reset-btn">
            ← Change Split
          </button>
        )}
        {step === 'splits' && isFiltered && (
          <button onClick={handleResetFilters} className="reset-btn">
            Reset Filters
          </button>
        )}
      </div>

      {/* STEP 1: SPLIT SELECTION */}
      {step === 'splits' && (
        <>
          <input
            type="text"
            placeholder="Search split by name (e.g. Arnold Split)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />

          <div className="tags-container">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`tag-btn ${isSelected ? 'active' : ''}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="splits-list">
            {filteredSplits.length > 0 ? (
              filteredSplits.map((split) => (
                <div key={split.id} className="split-card">
                  <h2>{split.title}</h2>
                  <p>{split.description}</p>
                  
                  <div className="category-badges">
                    {split.categoriesCovered.map((cat) => (
                      <span key={cat.id} className="category-badge">
                        {cat.name}
                      </span>
                    ))}
                  </div>

                  <button className="select-button" onClick={() => handleSelectSplit(split)}>
                    Select Routine →
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">No workout splits found covering all selected tags.</div>
            )}
          </div>
        </>
      )}

      {/* STEP 2: FREQUENCY / DAY SELECTOR */}
      {step === 'frequency' && selectedSplit && (
        <div className="frequency-card">
          <h2>Configure Frequency</h2>
          <p>How many days per week would you like to run the <strong>{selectedSplit.title}</strong>?</p>
          
          <div className="slider-container">
            <label htmlFor="daySlider">Training Days: <strong>{frequency} Days / Week</strong></label>
            <input 
              id="daySlider"
              type="range" 
              min="2" 
              max="6" 
              value={frequency} 
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="day-slider"
            />
            <div className="slider-markers">
              <span>2 Days</span>
              <span>4 Days</span>
              <span>6 Days</span>
            </div>
          </div>

          <button 
            className="select-button" 
            onClick={handleConfirmFrequency}
            disabled={loading}
          >
            {loading ? 'Building Workout Schedule...' : 'Generate Workout Walkthrough →'}
          </button>
        </div>
      )}

      {/* STEP 3: WORKOUT WALKTHROUGH */}
      {step === 'walkthrough' && (
        <div className="walkthrough-container">
          
          {/* VIEW 1: EXERCISE SELECTOR + MINI TRACKER */}
          {walkthroughView === 'selector' && (
            <div className="selector-page">
              <div className="page-intro-banner">
                <h2>{selectedSplit.title} ({frequency} Days)</h2>
                <p>Add movements to your tracker on the right, then click Generate Final Workout Plan.</p>
              </div>

              <div className="selector-grid-layout">
                {/* Left Side: Exercises Pool */}
                <div className="schedule-list pool-column">
                  {workoutSchedule.map((day, idx) => {
                    const dayAddedCount = (finalWorkoutPlan[idx] || []).length;
                    const isCollapsed = collapsedDays[idx];
                    return (
                      <div key={idx} className="day-card">
                        <div className="day-card-header-row" onClick={() => toggleDayCollapse(idx)}>
                          <div className="day-title-group">
                            <span className={`collapse-badge ${isCollapsed ? 'collapsed' : ''}`}>
                               {isCollapsed ? '▶ Expand' : '▼ Hide'}
                            </span>
                          <h3>{day.dayName}</h3>
                        </div>
                        <span className="tracker-counter-tag">Selected: {dayAddedCount}</span>
                      </div>
                        
                        {!isCollapsed && (
                          <div className="exercises-preview">
                            {day.exercises.map((ex) => {
                              const exerciseName = ex.name || 'Unnamed Exercise';
                              const added = isExerciseAdded(idx, ex.id);
                              return (
                                <div key={ex.id} className="exercise-item">
                                  <div>
                                    <span className="ex-name">{exerciseName} </span>
                                    <span className="ex-cat">({ex.categoryName})</span>
                                  </div>
                                  <div className="exercise-action-btns">
                                    <button 
                                      className="inline-details-btn"
                                      onClick={() => setSelectedExercise(ex)}
                                    >
                                      Details
                                    </button>
                                    <button 
                                      className={`inline-add-btn ${added ? 'added' : ''}`}
                                      onClick={() => handleAddExercise(idx, ex)}
                                      disabled={added}
                                    >
                                      {added ? 'Added' : 'Add'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right Side: Mini Tracker Window */}
                <div className="mini-tracker-window">
                  <div className="mini-tracker-header">
                    <h3>Current Queue</h3>
                    <span className="mini-tracker-count">{totalAddedCount} Items</span>
                  </div>

                  <div className="mini-tracker-body">
                    {workoutSchedule.map((day, idx) => {
                      const dayAddedExercises = finalWorkoutPlan[idx] || [];
                      return (
                        <div key={`mini-day-${idx}`} className="mini-tracker-day">
                          <span className="mini-day-title">{day.dayName}</span>
                          
                          {dayAddedExercises.length > 0 ? (
                            <div className="mini-exercise-list">
                              {dayAddedExercises.map((ex) => (
                                <div key={ex.id} className="mini-exercise-chip">
                                  <span className="mini-ex-name">{ex.name}</span>
                                  <button 
                                    className="mini-remove-btn"
                                    onClick={() => handleRemoveExercise(idx, ex.id)}
                                    title="Remove from queue"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="mini-empty-text">No exercises added yet</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    className="select-button generate-plan-btn"
                    onClick={() => setWalkthroughView('finalPlan')}
                    disabled={totalAddedCount === 0}
                  >
                    Generate Final Workout Plan →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: FINAL WORKOUT PLAN VIEW */}
          {walkthroughView === 'finalPlan' && (
            <div className="final-plan-page">
              <div className="page-intro-banner">
                <h2>Your Final Workout Plan</h2>
                <p>Customize sets and reps, watch video tutorials, and review form instructions.</p>
              </div>

              <div className="schedule-list">
                {workoutSchedule.map((day, idx) => {
                  const dayAddedExercises = finalWorkoutPlan[idx] || [];
                  return (
                    <div key={`final-day-${idx}`} className="day-card final-day-card">
                      <h3>{day.dayName}</h3>
                      <span className="exercise-count">{dayAddedExercises.length} Movements Planned</span>
                      
                      {dayAddedExercises.length > 0 ? (
                        <div className="final-exercises-stack">
                          {dayAddedExercises.map((ex) => {
                            const pVideoId = planVideoCache[ex.id];
                            return (
                              <div key={ex.id} className="final-exercise-card">
                                <div className="final-ex-header">
                                  <div>
                                    <h4 className="final-ex-title">{ex.name}</h4>
                                    <span className="category-badge">{ex.categoryName}</span>
                                  </div>
                                </div>

                                <div className="sets-reps-config-row">
                                  <div className="set-rep-field">
                                    <label>Sets</label>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      max="10" 
                                      value={ex.sets} 
                                      onChange={(e) => handleUpdateSetsReps(idx, ex.id, 'sets', Number(e.target.value))}
                                      className="set-rep-input"
                                    />
                                  </div>
                                  <div className="set-rep-field">
                                    <label>Reps / Time</label>
                                    <input 
                                      type="text" 
                                      value={ex.reps} 
                                      onChange={(e) => handleUpdateSetsReps(idx, ex.id, 'reps', e.target.value)}
                                      className="set-rep-input reps-text-input"
                                    />
                                  </div>
                                </div>

                                {pVideoId ? (
                                  <div className="video-player-container">
                                    <iframe
                                      title={`${ex.name} Video Tutorial`}
                                      className="embedded-video"
                                      src={`https://www.youtube.com/embed/${pVideoId}`}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : (
                                  <div className="video-player-container video-loading-state">
                                    <span>Loading video tutorial...</span>
                                  </div>
                                )}

                                <div className="instructions-section" style={{ marginTop: '16px' }}>
                                  <h4>Form Instructions</h4>
                                  {ex.description ? (
                                    <div className="exercise-html-desc">
                                      {cleanAndFormatInstructions(ex.description)}
                                    </div>
                                  ) : (
                                    <p className="no-desc">No detailed instructions available from API for this movement.</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="empty-day-state" style={{ color: '#71717a', fontSize: '0.875rem', fontStyle: 'italic', padding: '12px 0' }}>
                          No exercises added to this day yet.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                className="select-button secondary-nav-btn" 
                style={{ marginTop: '20px', backgroundColor: '#18181b', border: '1px solid #27272a' }}
                onClick={() => setWalkthroughView('selector')}
              >
                ← Back to Exercise Selector
              </button>
            </div>
          )}

        </div>
      )}

      {/* EXERCISE DETAIL MODAL */}
      {selectedExercise && (
        <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <h2 className="modal-title-large">{selectedExercise.name || 'Exercise Details'}</h2>
                <span className="category-badge">{selectedExercise.categoryName}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedExercise(null)}>✕</button>
            </div>

            <div className="modal-body">
              {videoLoading ? (
                <div className="video-player-container video-loading-state">
                  <span>Searching YouTube for tutorial...</span>
                </div>
              ) : videoId ? (
                <div className="video-player-container">
                  <iframe
                    title={`${selectedExercise.name} Video Tutorial`}
                    className="embedded-video"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="video-player-container video-loading-state">
                  <span>No video found or API key missing.</span>
                </div>
              )}

              <div className="instructions-section">
                <h3>Form Instructions</h3>
                {selectedExercise.description ? (
                  <div className="exercise-html-desc">
                    {cleanAndFormatInstructions(selectedExercise.description)}
                  </div>
                ) : (
                  <p className="no-desc">No detailed instructions available from API for this movement.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}