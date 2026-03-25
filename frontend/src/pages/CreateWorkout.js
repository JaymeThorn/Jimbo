import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkout, getTemplates, getWorkouts, getStats, createTemplate } from '../services/api';
import { EXERCISE_LIBRARY } from '../utils/exercises';
import { fetchExerciseImages, getExerciseImage } from '../utils/exerciseImages';

function CreateWorkout() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([{ name: '', sets: [{ reps: '', weight: '' }] }]);
  const [showSuggestions, setShowSuggestions] = useState({});
  const [showExercisePicker, setShowExercisePicker] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [previousWorkouts, setPreviousWorkouts] = useState([]);
  const [prs, setPrs] = useState({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    loadExerciseImages();
  }, []);

  const loadExerciseImages = async () => {
    await fetchExerciseImages();
  };

  const fetchData = async () => {
    try {
      const [templatesRes, workoutsRes, statsRes] = await Promise.all([
        getTemplates(),
        getWorkouts(),
        getStats()
      ]);
      setTemplates(templatesRes.data);
      setPreviousWorkouts(workoutsRes.data);
      setPrs(statsRes.data.prs);
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  const loadTemplate = (template) => {
    setExercises(template.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({ reps: s.reps || '', weight: s.weight || '' }))
    })));
    setShowTemplateModal(false);
  };

  const getLastWorkoutForExercise = (exerciseName) => {
    if (!exerciseName) return null;
    
    for (let workout of previousWorkouts) {
      const exercise = workout.exercises.find(ex => 
        ex.name.toLowerCase() === exerciseName.toLowerCase()
      );
      if (exercise && exercise.sets.length > 0) {
        return exercise.sets;
      }
    }
    return null;
  };

  const autofillLastWorkout = (exerciseIndex) => {
    const exerciseName = exercises[exerciseIndex].name;
    const lastSets = getLastWorkoutForExercise(exerciseName);
    
    if (lastSets) {
      const updated = [...exercises];
      updated[exerciseIndex].sets = lastSets.map(s => ({ 
        reps: s.reps, 
        weight: s.weight 
      }));
      setExercises(updated);
    } else {
      alert('No previous workout found for this exercise');
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
    
    if (field === 'name') {
      setShowSuggestions({ ...showSuggestions, [index]: value.length > 0 });
    }
  };

  const selectExercise = (index, exerciseName) => {
    const updated = [...exercises];
    updated[index].name = exerciseName;
    setExercises(updated);
    setShowSuggestions({ ...showSuggestions, [index]: false });
    setShowExercisePicker(null);
  };

  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ reps: '', weight: '' });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkout({ date, exercises });
      
      // Save as template if requested
      if (showSaveTemplate && templateName.trim()) {
        await createTemplate({ name: templateName, exercises });
      }
      
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to create workout');
    }
  };

  return (
    <div className="container">
      <h2>Create Workout</h2>
      
      <button 
        type="button" 
        onClick={() => setShowTemplateModal(true)} 
        className="btn-secondary"
        style={{ marginBottom: '20px' }}
      >
        📋 Load Template
      </button>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Choose a Template</h3>
            {templates.length === 0 ? (
              <p>No templates yet. Create one from the Templates page!</p>
            ) : (
              <div className="template-list">
                {templates.map(template => (
                  <div key={template._id} className="template-item" onClick={() => loadTemplate(template)}>
                    <h4>{template.name}</h4>
                    <p>{template.exercises.length} exercises</p>
                    <div className="template-exercises">
                      {template.exercises.map((ex, i) => (
                        <span key={i} className="exercise-tag">{ex.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowTemplateModal(false)} className="btn-secondary">Close</button>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showExercisePicker !== null && (
        <div className="modal-overlay" onClick={() => setShowExercisePicker(null)}>
          <div className="modal-content exercise-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Choose Exercise</h3>
            <div className="exercise-categories">
              {Object.entries(EXERCISE_LIBRARY).map(([category, exerciseList]) => (
                <div key={category} className="exercise-category">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <div className="exercise-grid">
                    {exerciseList.map((exercise, i) => {
                      const imageUrl = getExerciseImage(exercise.name);
                      return (
                        <div 
                          key={i} 
                          className="exercise-card"
                          onClick={() => selectExercise(showExercisePicker, exercise.name)}
                        >
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={exercise.name} 
                              className="exercise-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <div className="exercise-icon" style={{ display: imageUrl ? 'none' : 'block' }}>
                            {exercise.icon}
                          </div>
                          <div className="exercise-name">{exercise.name}</div>
                          <div className="exercise-description">{exercise.description}</div>
                          <div className="exercise-muscle">{exercise.muscle}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowExercisePicker(null)} className="btn-secondary">Close</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {exercises.map((exercise, exerciseIndex) => {
          const lastSets = getLastWorkoutForExercise(exercise.name);
          const pr = prs[exercise.name];
          
          return (
            <div key={exerciseIndex} className="exercise-block">
              <div className="exercise-header">
                <div className="exercise-input-group">
                  <input
                    type="text"
                    placeholder="Exercise name or click Browse"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exerciseIndex, 'name', e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowExercisePicker(exerciseIndex)}
                    className="btn-small browse-btn"
                  >
                    📚 Browse
                  </button>
                </div>
                {exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(exerciseIndex)} className="btn-danger">Remove</button>
                )}
              </div>

              {/* Show PR and Last Workout Info */}
              {exercise.name && (
                <div className="exercise-info">
                  {pr && (
                    <span className="pr-badge">🏆 PR: {pr} lbs</span>
                  )}
                  {lastSets && (
                    <button 
                      type="button" 
                      onClick={() => autofillLastWorkout(exerciseIndex)}
                      className="btn-small autofill-btn"
                    >
                      ↻ Last: {lastSets.map(s => `${s.reps}×${s.weight}`).join(', ')}
                    </button>
                  )}
                </div>
              )}

              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="set-row">
                  <span>Set {setIndex + 1}</span>
                  <input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Weight"
                    value={set.weight}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                    required
                  />
                  {exercise.sets.length > 1 && (
                    <button type="button" onClick={() => removeSet(exerciseIndex, setIndex)} className="btn-small btn-danger">×</button>
                  )}
                </div>
              ))}

              <button type="button" onClick={() => addSet(exerciseIndex)} className="btn-small">Add Set</button>
            </div>
          );
        })}

        <button type="button" onClick={addExercise} className="btn-secondary">Add Exercise</button>
        
        <div className="save-template-section">
          <label>
            <input 
              type="checkbox" 
              checked={showSaveTemplate}
              onChange={(e) => setShowSaveTemplate(e.target.checked)}
            />
            Save as template
          </label>
          {showSaveTemplate && (
            <input
              type="text"
              placeholder="Template name (e.g., Leg Day)"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="template-name-input"
            />
          )}
        </div>

        <button type="submit" className="btn">Save Workout</button>
      </form>
    </div>
  );
}

export default CreateWorkout;
