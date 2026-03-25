import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRun, shareRun, getSegmentLeaderboard } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import { formatDistance, formatPace } from '../utils/units';
import 'leaflet/dist/leaflet.css';

function RunDetailEnhanced() {
  const [run, setRun] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showElevation, setShowElevation] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRun();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRun = async () => {
    try {
      const { data } = await getRun(id);
      setRun(data);
      
      // Load leaderboard if route has a name
      if (data.routeName) {
        try {
          const { data: leaderboardData } = await getSegmentLeaderboard(data.routeName);
          setLeaderboard(leaderboardData);
        } catch (err) {
          console.log('No leaderboard data');
        }
      }
    } catch (err) {
      alert('Failed to load run');
      navigate('/running');
    }
  };

  const handleShare = async () => {
    try {
      const { data } = await shareRun(id);
      setRun(data);
      alert(data.isShared ? 'Run shared with friends!' : 'Run unshared');
    } catch (err) {
      alert('Failed to share run');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPaceColor = (speed) => {
    // Color code based on speed (km/h)
    if (speed > 12) return '#00ff00'; // Fast - green
    if (speed > 10) return '#7fff00'; // Good - yellow-green
    if (speed > 8) return '#ffff00'; // Moderate - yellow
    if (speed > 6) return '#ff7f00'; // Slow - orange
    return '#ff0000'; // Very slow - red
  };

  if (!run) return <div className="container">Loading...</div>;

  const center = run.route.length > 0 
    ? [run.route[0].lat, run.route[0].lng]
    : [0, 0];

  // Create pace-colored segments
  const paceSegments = [];
  if (run.route.length > 1) {
    for (let i = 0; i < run.route.length - 1; i++) {
      paceSegments.push({
        positions: [[run.route[i].lat, run.route[i].lng], [run.route[i+1].lat, run.route[i+1].lng]],
        color: getPaceColor(run.route[i].speed || 0)
      });
    }
  }

  return (
    <div className="container">
      <button onClick={() => navigate('/running')} className="btn-secondary">← Back</button>
      
      <div className="run-detail-header">
        <div>
          <h2>{run.routeName || 'Run'}</h2>
          <p className="run-date">{new Date(run.date).toLocaleDateString()}</p>
        </div>
        <div className="run-actions">
          <button onClick={handleShare} className="btn-secondary">
            {run.isShared ? '🔓 Shared' : '🔒 Share'}
          </button>
        </div>
      </div>

      {run.paceZone && (
        <div className={`pace-zone-badge ${run.paceZone}`}>
          {run.paceZone.toUpperCase()} PACE
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatDistance(run.distance)}</div>
          <div className="stat-label">Distance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(run.duration)}</div>
          <div className="stat-label">Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatPace(run.pace)}</div>
          <div className="stat-label">Pace</div>
        </div>
        {run.elevationGain > 0 && (
          <div className="stat-card">
            <div className="stat-value">{run.elevationGain.toFixed(0)}m</div>
            <div className="stat-label">Elevation Gain</div>
          </div>
        )}
      </div>

      {run.weather && run.weather.temp && (
        <div className="weather-info">
          <span>🌡️ {run.weather.temp}°C</span>
          {run.weather.condition && <span> • {run.weather.condition}</span>}
          {run.weather.humidity && <span> • {run.weather.humidity}% humidity</span>}
        </div>
      )}

      {run.route && run.route.length > 0 && (
        <div className="map-container">
          <MapContainer center={center} zoom={14} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {paceSegments.map((segment, idx) => (
              <Polyline 
                key={idx}
                positions={segment.positions} 
                color={segment.color}
                weight={4}
              />
            ))}
            <Marker position={[run.route[0].lat, run.route[0].lng]} />
            <Marker position={[run.route[run.route.length-1].lat, run.route[run.route.length-1].lng]} />
          </MapContainer>
          <div className="map-legend">
            <span style={{color: '#00ff00'}}>■</span> Fast
            <span style={{color: '#ffff00'}}>■</span> Moderate
            <span style={{color: '#ff0000'}}>■</span> Slow
          </div>
        </div>
      )}

      {run.splits && run.splits.length > 0 && (
        <div className="section">
          <h3>Splits</h3>
          <div className="splits-table">
            <div className="splits-header">
              <span>Distance</span>
              <span>Time</span>
              <span>Pace</span>
            </div>
            {run.splits.map((split, idx) => (
              <div key={idx} className="split-row">
                <span>{split.distance} km</span>
                <span>{formatTime(split.time)}</span>
                <span>{split.pace.toFixed(2)} min/km</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {run.elevationGain > 0 && (
        <div className="section">
          <button onClick={() => setShowElevation(!showElevation)} className="btn-secondary">
            {showElevation ? 'Hide' : 'Show'} Elevation Profile
          </button>
          {showElevation && run.route && (
            <div className="elevation-profile">
              <svg width="100%" height="200" viewBox="0 0 1000 200">
                <polyline
                  points={run.route.map((point, idx) => 
                    `${(idx / run.route.length) * 1000},${200 - (point.elevation || 0) * 2}`
                  ).join(' ')}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                />
              </svg>
              <div className="elevation-stats">
                <span>⬆️ {run.elevationGain.toFixed(0)}m gain</span>
                <span>⬇️ {run.elevationLoss.toFixed(0)}m loss</span>
              </div>
            </div>
          )}
        </div>
      )}

      {run.similarRoutes && run.similarRoutes.length > 0 && (
        <div className="section">
          <button onClick={() => setShowComparison(!showComparison)} className="btn-secondary">
            {showComparison ? 'Hide' : 'Show'} Similar Routes ({run.similarRoutes.length})
          </button>
          {showComparison && (
            <div className="similar-routes">
              {run.similarRoutes.map((similar, idx) => (
                <div key={idx} className="similar-route-card" onClick={() => navigate(`/run/${similar._id}`)}>
                  <div className="route-date">{new Date(similar.date).toLocaleDateString()}</div>
                  <div className="route-stats">
                    <span>{formatDistance(similar.distance)}</span>
                    <span>{formatTime(similar.duration)}</span>
                    <span>{formatPace(similar.pace)}</span>
                  </div>
                  {similar.duration < run.duration && (
                    <div className="faster-badge">⚡ Faster</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="section">
          <h3>Segment Leaderboard: {run.routeName}</h3>
          <div className="leaderboard">
            {leaderboard.map((entry, idx) => (
              <div key={entry._id} className={`leaderboard-entry ${entry._id === run._id ? 'current' : ''}`}>
                <span className="rank">#{idx + 1}</span>
                <span className="runner">{entry.userId?.email || 'You'}</span>
                <span className="time">{formatTime(entry.duration)}</span>
                <span className="pace">{formatPace(entry.pace)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {run.notes && (
        <div className="section">
          <h3>Notes</h3>
          <p>{run.notes}</p>
        </div>
      )}
    </div>
  );
}

export default RunDetailEnhanced;
