import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRun } from '../services/api';

function RunTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [route, setRoute] = useState([]);
  const [lastPosition, setLastPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    setDistance(0);
    setDuration(0);
    setRoute([]);
    setLastPosition(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: Date.now()
        };

        setRoute(prev => [...prev, newPoint]);

        if (lastPosition) {
          const dist = calculateDistance(
            lastPosition.lat,
            lastPosition.lng,
            latitude,
            longitude
          );
          setDistance(prev => prev + dist);
        }

        setLastPosition({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    setWatchId(id);
  };

  const pauseTracking = () => {
    setIsPaused(!isPaused);
  };

  const stopTracking = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    if (distance === 0) {
      alert('No distance recorded');
      resetTracking();
      return;
    }

    const pace = duration > 0 ? (duration / 60) / distance : 0;

    try {
      await createRun({
        distance,
        duration,
        pace,
        route,
        date: new Date()
      });
      navigate('/running');
    } catch (err) {
      alert('Failed to save run');
    }
  };

  const resetTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
    setIsTracking(false);
    setIsPaused(false);
    setDistance(0);
    setDuration(0);
    setRoute([]);
    setLastPosition(null);
    setWatchId(null);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = () => {
    if (distance === 0) return '0:00';
    const paceSeconds = (duration / distance);
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/running')} className="btn-secondary">← Back</button>
      
      <h2>Track Run</h2>

      <div className="run-tracker">
        <div className="run-stats-display">
          <div className="run-stat-large">
            <div className="stat-value-large">{distance.toFixed(2)}</div>
            <div className="stat-label">Kilometers</div>
          </div>

          <div className="run-stats-row">
            <div className="run-stat">
              <div className="stat-value">{formatTime(duration)}</div>
              <div className="stat-label">Time</div>
            </div>
            <div className="run-stat">
              <div className="stat-value">{formatPace()}</div>
              <div className="stat-label">Pace (min/km)</div>
            </div>
          </div>
        </div>

        <div className="run-controls">
          {!isTracking ? (
            <button onClick={startTracking} className="btn btn-large">
              ▶️ Start Run
            </button>
          ) : (
            <>
              <button onClick={pauseTracking} className="btn-secondary btn-large">
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button onClick={stopTracking} className="btn btn-large">
                ⏹️ Finish
              </button>
              <button onClick={resetTracking} className="btn-danger btn-large">
                ✖️ Cancel
              </button>
            </>
          )}
        </div>

        {isTracking && (
          <div className="tracking-indicator">
            <span className="pulse-dot"></span>
            {isPaused ? 'Paused' : 'Tracking...'}
          </div>
        )}

        <div className="run-info">
          <p>📍 GPS points recorded: {route.length}</p>
          <p>💡 Keep your phone with you and GPS enabled</p>
        </div>
      </div>
    </div>
  );
}

export default RunTracker;
