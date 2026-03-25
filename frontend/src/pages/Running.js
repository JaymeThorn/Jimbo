import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRuns, deleteRun, getRunStats } from '../services/api';

function Running() {
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [runsRes, statsRes] = await Promise.all([
        getRuns(),
        getRunStats()
      ]);
      setRuns(runsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load runs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this run?')) {
      try {
        await deleteRun(id);
        setRuns(runs.filter(r => r._id !== id));
        fetchData();
      } catch (err) {
        alert('Failed to delete run');
      }
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatPace = (pace) => {
    const mins = Math.floor(pace);
    const secs = Math.floor((pace % 1) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back to Gym</button>
      
      <div className="header">
        <h2>🏃 Running</h2>
        <Link to="/run-tracker" className="btn">Start Run</Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏃</div>
          <div className="stat-value">{stats.totalRuns || 0}</div>
          <div className="stat-label">Total Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-value">{stats.totalDistance || 0}</div>
          <div className="stat-label">Total KM</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{formatPace(stats.avgPace || 0)}</div>
          <div className="stat-label">Avg Pace (min/km)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.longestRun || 0}</div>
          <div className="stat-label">Longest Run (km)</div>
        </div>
      </div>

      {/* Run History */}
      {runs.length === 0 ? (
        <div className="empty-state">
          <p>No runs yet. Start your first run!</p>
        </div>
      ) : (
        <div className="workout-list">
          {runs.map(run => (
            <div key={run._id} className="workout-card run-card">
              <div className="workout-header">
                <h3>{new Date(run.date).toLocaleDateString()}</h3>
                <div>
                  <Link to={`/run/${run._id}`} className="btn-small">View</Link>
                  <button onClick={() => handleDelete(run._id)} className="btn-small btn-danger">Delete</button>
                </div>
              </div>
              <div className="run-summary">
                <span>📏 {run.distance.toFixed(2)} km</span>
                <span>⏱️ {formatTime(run.duration)}</span>
                <span>⚡ {formatPace(run.pace)} /km</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Running;
