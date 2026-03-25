import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkout } from '../services/api';

function WorkoutDetail() {
  const [workout, setWorkout] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkout();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const { data } = await getWorkout(id);
      setWorkout(data);
    } catch (err) {
      alert('Failed to load workout');
      navigate('/dashboard');
    }
  };

  if (!workout) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back</button>
      
      <h2>Workout - {new Date(workout.date).toLocaleDateString()}</h2>

      {workout.exercises.map((exercise, index) => (
        <div key={index} className="exercise-detail">
          <h3>{exercise.name}</h3>
          <table>
            <thead>
              <tr>
                <th>Set</th>
                <th>Reps</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set, setIndex) => (
                <tr key={setIndex}>
                  <td>{setIndex + 1}</td>
                  <td>{set.reps}</td>
                  <td>{set.weight} lbs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default WorkoutDetail;
