import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createRun } from '../services/api';

function RunTracker() {
  const [searchParams] = useSearchParams();
  const isGoalRun = searchParams.get('goal') === 'true';
  
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [route, setRoute] = useState([]);
  const [lastPosition, setLastPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [splits, setSplits] = useState([]);
  const [predictedTime, setPredictedTime] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [goalType, setGoalType] = useState('distance'); // distance, time, pace
  const [goalValue, setGoalValue] = useState('');
  const [showGoalSetup, setShowGoalSetup] = useState(isGoalRun);
  const lastMoveTime = useRef(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        
        // Auto-pause detection (no movement for 10 seconds)
        if (Date.now() - lastMoveTime.current > 10000 && currentSpeed < 0.5) {
          setIsPaused(true);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, currentSpeed]);

  // Calculate predicted finish times
  useEffect(() => {
    if (distance > 1 && duration > 0) {
      const currentPace = duration / distance; // seconds per km
      setPredictedTime({
        '5k': formatTime(currentPace * 5),
        '10k': formatTime(currentPace * 10),
        'half': formatTime(currentPace * 21.0975),
        'full': formatTime(currentPace * 42.195)
      });
    }
  }, [distance, duration]);

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
    setSplits([]);
    lastMoveTime.current = Date.now();

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude, speed } = position.coords;
        const newPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: Date.now(),
          elevation: altitude || 0,
          speed: speed ? speed * 3.6 : 0
        };

        setRoute(prev => [...prev, newPoint]);
        setCurrentSpeed(newPoint.speed);
        lastMoveTime.current = Date.now();

        setLastPosition(prevPos => {
          if (prevPos) {
            const dist = calculateDistance(
              prevPos.lat,
              prevPos.lng,
              latitude,
              longitude
            );
            
            // Add any movement over 1 meter
            if (dist > 0.001) {
              setDistance(prev => {
                const newDist = prev + dist;
                console.log('Distance updated:', newDist.toFixed(3), 'km');
                return newDist;
              });
            }
          }
          return { lat: latitude, lng: longitude };
        });
      },
      (error) => {
        console.error('GPS error:', error);
        alert('GPS error: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000
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

    if (distance < 0.01) {
      alert('Distance too short. Keep running for at least 10 meters!');
      resetTracking();
      return;
    }

    const pace = duration > 0 ? (duration / 60) / distance : 0;

    try {
      const { data } = await createRun({
        distance,
        duration,
        pace,
        route,
        routeName: routeName || undefined
      });
      
      // Show achievements if earned
      if (data.achievements && data.achievements.length > 0) {
        const achievementNames = data.achievements.map(a => `${a.icon} ${a.name}`).join('\n');
        alert(`🎉 New Achievements!\n\n${achievementNames}`);
      }
      
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

  const calculateGoalProgress = () => {
    if (!goalValue) return null;
    
    if (goalType === 'distance') {
      const target = parseFloat(goalValue);
      const remaining = Math.max(0, target - distance);
      const progress = Math.min(100, (distance / target) * 100);
      return { remaining: remaining.toFixed(2), unit: 'km', progress };
    } else if (goalType === 'time') {
      const target = parseInt(goalValue) * 60; // minutes to seconds
      const remaining = Math.max(0, target - duration);
      const progress = Math.min(100, (duration / target) * 100);
      return { remaining: formatTime(remaining), unit: '', progress };
    }
    return null;
  };

  const goalProgress = calculateGoalProgress();

  return (
    <div className="container jimbo-container">
      <div className="jimbo-header-small">
        <h1 className="jimbo-title-small">JIMBO</h1>
      </div>

      {showGoalSetup && !isTracking && (
        <div className="goal-setup">
          <h2>🎯 Set Your Goal</h2>
          <div className="goal-type-selector">
            <button 
              className={goalType === 'distance' ? 'active' : ''}
              onClick={() => setGoalType('distance')}
            >
              Distance
            </button>
            <button 
              className={goalType === 'time' ? 'active' : ''}
              onClick={() => setGoalType('time')}
            >
              Time
            </button>
          </div>
          <div className="goal-input">
            <input
              type="number"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder={goalType === 'distance' ? 'e.g., 5' : 'e.g., 30'}
            />
            <span className="goal-unit">{goalType === 'distance' ? 'km' : 'minutes'}</span>
          </div>
          <button 
            onClick={() => setShowGoalSetup(false)} 
            className="btn-jimbo-primary"
            disabled={!goalValue}
          >
            Let's Go! 💪
          </button>
        </div>
      )}

      {!showGoalSetup && (
        <div className="run-tracker">
          {!isTracking && (
            <div className="route-name-input">
              <label>Route Name (optional)</label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g., Morning Loop, Park Run"
              />
            </div>
          )}

          {goalProgress && isTracking && (
            <div className="goal-progress-card">
              <h3>🎯 Goal Progress</h3>
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{width: `${goalProgress.progress}%`}}></div>
              </div>
              <div className="goal-remaining">
                <span className="goal-remaining-value">{goalProgress.remaining}</span>
                <span className="goal-remaining-label">{goalProgress.unit} remaining</span>
              </div>
              {goalProgress.progress >= 100 && (
                <div className="goal-achieved">🎉 GOAL SMASHED! 🎉</div>
              )}
            </div>
          )}

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
            <div className="run-stat">
              <div className="stat-value">{currentSpeed.toFixed(1)}</div>
              <div className="stat-label">km/h</div>
            </div>
          </div>
        </div>

        {splits.length > 0 && (
          <div className="splits-display">
            <h3>Splits</h3>
            {splits.map((split, idx) => (
              <div key={idx} className="split-row">
                <span>Km {split.km}</span>
                <span>{formatTime(split.time)}</span>
                <span>{split.pace.toFixed(2)} min/km</span>
              </div>
            ))}
          </div>
        )}

        {predictedTime && distance > 1 && (
          <div className="predictions">
            <h3>Predicted Times</h3>
            <div className="prediction-grid">
              <div><strong>5K:</strong> {predictedTime['5k']}</div>
              <div><strong>10K:</strong> {predictedTime['10k']}</div>
              <div><strong>Half:</strong> {predictedTime['half']}</div>
              <div><strong>Full:</strong> {predictedTime['full']}</div>
            </div>
          </div>
        )}

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
            {isPaused ? 'Paused (Auto-pause)' : 'Tracking...'}
          </div>
        )}

        <div className="run-info">
          <p>📍 GPS points: {route.length}</p>
          <p>💡 Auto-pause • Split times per km</p>
        </div>
        </div>
      )}
    </div>
  );
}

export default RunTracker;
