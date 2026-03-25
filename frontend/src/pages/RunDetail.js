import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRun } from '../services/api';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function RunDetail() {
  const [run, setRun] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRun();
  }, [id]);

  const fetchRun = async () => {
    try {
      const { data } = await getRun(id);
      setRun(data);
    } catch (err) {
      alert('Failed to load run');
      navigate('/running');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace) => {
    const mins = Math.floor(pace);
    const secs = Math.floor((pace % 1) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!run) return <div className="container">Loading...</div>;

  const center = run.route.length > 0 
    ? [run.route[0].lat, run.route[0].lng]
    : [0, 0];

  return (
    <div className="container">
      <button onClick={() => navigate('/running')} className="btn-secondary">← Back</button>
      
      <h2>Run - {new Date(run.date).toLocaleDateString()}</h2>

      <div className="run-detail-stats">
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-value">{run.distance.toFixed(2)}</div>
          <div className="stat-label">Kilometers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{formatTime(run.duration)}</div>
          <div className="stat-label">Duration</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{formatPace(run.pace)}</div>
          <div className="stat-label">Pace (min/km)</div>
        </div>
      </div>

      {run.route && run.route.length > 0 ? (
        <div className="map-container">
          <MapContainer 
            center={center} 
            zoom={14} 
            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Polyline 
              positions={run.route.map(p => [p.lat, p.lng])} 
              color="blue"
              weight={4}
            />
            <Marker position={[run.route[0].lat, run.route[0].lng]}>
              <Popup>Start</Popup>
            </Marker>
            <Marker position={[run.route[run.route.length - 1].lat, run.route[run.route.length - 1].lng]}>
              <Popup>Finish</Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <div className="no-route">
          <p>No route data available for this run</p>
        </div>
      )}

      {run.notes && (
        <div className="run-notes">
          <h3>Notes</h3>
          <p>{run.notes}</p>
        </div>
      )}
    </div>
  );
}

export default RunDetail;
