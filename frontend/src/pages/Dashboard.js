import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getWorkouts, deleteWorkout, getStats, getRuns, deleteRun } from '../services/api';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { formatWeight, formatDistance, getWeightUnit, getDistanceUnit } from '../utils/units';
import 'leaflet/dist/leaflet.css';

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState({ streak: 0, totalWorkouts: 0, prs: {} });
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    const handleUnitsChange = () => forceUpdate({});
    window.addEventListener('unitsChanged', handleUnitsChange);
    return () => window.removeEventListener('unitsChanged', handleUnitsChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [workoutsRes, statsRes, runsRes] = await Promise.all([
        getWorkouts(),
        getStats(),
        getRuns()
      ]);
      setWorkouts(workoutsRes.data);
      setStats(statsRes.data);
      setRuns(runsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (window.confirm('Delete this workout?')) {
      try {
        await deleteWorkout(id);
        setWorkouts(workouts.filter(w => w._id !== id));
        fetchData();
      } catch (err) {
        alert('Failed to delete workout');
      }
    }
  };

  const handleDeleteRun = async (id) => {
    if (window.confirm('Delete this run?')) {
      try {
        await deleteRun(id);
        setRuns(runs.filter(r => r._id !== id));
      } catch (err) {
        alert('Failed to delete run');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatPace = (pace) => {
    const mins = Math.floor(pace);
    const secs = Math.floor((pace % 1) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Combine and sort activities by date
  const allActivities = [
    ...workouts.map(w => ({ ...w, type: 'workout', date: new Date(w.date) })),
    ...runs.map(r => ({ ...r, type: 'run', date: new Date(r.date) }))
  ].sort((a, b) => b.date - a.date);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container jimbo-container">
      <div className="jimbo-header">
        <h1 className="jimbo-title">JIMBO</h1>
      </div>

      <div className="header">
        <h2>Activity Feed</h2>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalWorkouts}</div>
          <div className="stat-label">Workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{runs.length}</div>
          <div className="stat-label">Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(stats.prs).length}</div>
          <div className="stat-label">Personal Records</div>
        </div>
      </div>

      {/* Activity Feed */}
      {allActivities.length === 0 ? (
        <div className="empty-state">
          <p>No activities yet. Start your fitness journey!</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/create-workout" className="btn">Create Workout</Link>
            <Link to="/run-tracker" className="btn">Start Run</Link>
          </div>
        </div>
      ) : (
        <div className="activity-feed">
          {allActivities.map(activity => (
            <div key={`${activity.type}-${activity._id}`} className="activity-card">
              {/* Header */}
              <div className="activity-card-header">
                <div>
                  <span className={`activity-badge ${activity.type}`}>
                    {activity.type === 'workout' ? 'Workout' : 'Run'}
                  </span>
                  <h3>{activity.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  <p className="activity-time">{activity.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="activity-actions">
                  <Link 
                    to={activity.type === 'workout' ? `/workout/${activity._id}` : `/run/${activity._id}`} 
                    className="btn-small"
                  >
                    View
                  </Link>
                  <button 
                    onClick={() => activity.type === 'workout' ? handleDeleteWorkout(activity._id) : handleDeleteRun(activity._id)} 
                    className="btn-small btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Content */}
              {activity.type === 'workout' ? (
                <div className="activity-content">
                  <div className="activity-stats-row">
                    <div className="activity-stat">
                      <div>
                        <div className="stat-number">{activity.exercises.length}</div>
                        <div className="stat-text">Exercises</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div>
                        <div className="stat-number">
                          {activity.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                        </div>
                        <div className="stat-text">Total Sets</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div>
                        <div className="stat-number">
                          {activity.exercises.reduce((sum, ex) => 
                            sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
                          ).toLocaleString()}
                        </div>
                        <div className="stat-text">Volume ({getWeightUnit()})</div>
                      </div>
                    </div>
                  </div>

                  <div className="activity-exercises">
                    <h4>Exercises:</h4>
                    {activity.exercises.map((ex, i) => (
                      <div key={i} className="exercise-summary">
                        <strong>{ex.name}</strong>
                        <span className="sets-summary">
                          {ex.sets.map((s, j) => `${s.reps}×${formatWeight(s.weight)}`).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="activity-content">
                  <div className="activity-stats-row">
                    <div className="activity-stat">
                      <div>
                        <div className="stat-number">{formatDistance(activity.distance)}</div>
                        <div className="stat-text">Distance</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div>
                        <div className="stat-number">{formatTime(activity.duration)}</div>
                        <div className="stat-text">Duration</div>
                      </div>
                    </div>
                    <div className="activity-stat">
                      <div>
                        <div className="stat-number">{formatPace(activity.pace)}</div>
                        <div className="stat-text">Pace (min/{getDistanceUnit()})</div>
                      </div>
                    </div>
                  </div>

                  {activity.route && activity.route.length > 0 && (
                    <div className="activity-map">
                      <MapContainer 
                        center={[activity.route[0].lat, activity.route[0].lng]} 
                        zoom={13} 
                        style={{ height: '250px', width: '100%', borderRadius: '8px' }}
                        scrollWheelZoom={false}
                        dragging={false}
                        zoomControl={false}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap'
                        />
                        <Polyline 
                          positions={activity.route.map(p => [p.lat, p.lng])} 
                          color="#6366f1"
                          weight={3}
                        />
                      </MapContainer>
                      <div className="map-overlay">
                        {activity.route.length} GPS points
                      </div>
                    </div>
                  )}

                  {activity.notes && (
                    <div className="activity-notes">
                      <p>{activity.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
