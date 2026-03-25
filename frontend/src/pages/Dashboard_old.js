import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getWorkouts, deleteWorkout, getStats } from '../services/api';

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState({ streak: 0, totalWorkouts: 0, prs: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workoutsRes, statsRes] = await Promise.all([
        getWorkouts(),
        getStats()
      ]);
      setWorkouts(workoutsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this workout?')) {
      try {
        await deleteWorkout(id);
        setWorkouts(workouts.filter(w => w._id !== id));
        fetchData(); // Refresh stats
      } catch (err) {
        alert('Failed to delete workout');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="header">
        <h2>My Workouts</h2>
        <div>
          <Link to="/running" className="btn">🏃 Running</Link>
          <Link to="/create-workout" className="btn">New Workout</Link>
          <Link to="/templates" className="btn-secondary">Templates</Link>
          <Link to="/progress" className="btn-secondary">Progress</Link>
          <Link to="/health-sync" className="btn-secondary">Health Sync</Link>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-value">{stats.totalWorkouts}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{Object.keys(stats.prs).length}</div>
          <div className="stat-label">Personal Records</div>
        </div>
      </div>

      {workouts.length === 0 ? (
        <p>No workouts yet. Create your first workout!</p>
      ) : (
        <div className="workout-list">
          {workouts.map(workout => (
            <div key={workout._id} className="workout-card">
              <div className="workout-header">
                <h3>{new Date(workout.date).toLocaleDateString()}</h3>
                <div>
                  <Link to={`/workout/${workout._id}`} className="btn-small">View</Link>
                  <button onClick={() => handleDelete(workout._id)} className="btn-small btn-danger">Delete</button>
                </div>
              </div>
              <p>{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
