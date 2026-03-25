import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, deleteTemplate, createWorkout } from '../services/api';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await getTemplates();
      setTemplates(data);
    } catch (err) {
      alert('Failed to load templates');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this template?')) {
      try {
        await deleteTemplate(id);
        setTemplates(templates.filter(t => t._id !== id));
      } catch (err) {
        alert('Failed to delete template');
      }
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      await createWorkout({
        date: new Date().toISOString().split('T')[0],
        exercises: template.exercises
      });
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to create workout from template');
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back</button>
      
      <div className="header">
        <h2>Workout Templates</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="btn">
          {showCreate ? 'Cancel' : 'Create Template'}
        </button>
      </div>

      {showCreate && (
        <div className="template-create">
          <p>Create a template by saving your next workout with a name!</p>
          <p>Go to Create Workout and you'll see an option to save as template.</p>
        </div>
      )}

      {templates.length === 0 ? (
        <p>No templates yet. Create your first template from a workout!</p>
      ) : (
        <div className="workout-list">
          {templates.map(template => (
            <div key={template._id} className="workout-card">
              <div className="workout-header">
                <h3>{template.name}</h3>
                <div>
                  <button onClick={() => handleUseTemplate(template)} className="btn-small">Use Template</button>
                  <button onClick={() => handleDelete(template._id)} className="btn-small btn-danger">Delete</button>
                </div>
              </div>
              <p>{template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}</p>
              <div className="template-exercises">
                {template.exercises.map((ex, i) => (
                  <span key={i} className="exercise-tag">{ex.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Templates;
