import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRunStats, getRuns, getHeatmapData, getFriendsRuns } from '../services/api';
import { formatDistance, formatPace } from '../utils/units';

function RunningDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);
  const [friendsRuns, setFriendsRuns] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, runsResponse, friendsResponse] = await Promise.all([
        getRunStats(),
        getRuns(),
        getFriendsRuns().catch(() => ({ data: [] }))
      ]);
      setStats(statsResponse.data || statsResponse);
      const runsData = runsResponse.data || runsResponse || [];
      setRecentRuns(Array.isArray(runsData) ? runsData.slice(0, 5) : []);
      setFriendsRuns(friendsResponse.data || friendsResponse || []);
    } catch (err) {
      console.error('Failed to load running data:', err);
    }
  };

  const loadHeatmap = async () => {
    try {
      const data = await getHeatmapData();
      setHeatmapData(data);
      setShowHeatmap(true);
    } catch (err) {
      console.error('Failed to load heatmap:', err);
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

  if (!stats) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container jimbo-container">
      <div className="jimbo-header">
        <h1 className="jimbo-title">💪 JIMBO</h1>
        <p className="jimbo-tagline">Your Gym Bro for Life</p>
      </div>

      <div className="run-action-buttons">
        <button onClick={() => navigate('/run-tracker')} className="btn-jimbo-primary">
          🏃 START RUN
        </button>
        <button onClick={() => navigate('/run-tracker?goal=true')} className="btn-jimbo-secondary">
          🎯 Goal Run
        </button>
      </div>

      {/* Streak & Challenge */}
      <div className="stats-grid">
        <div className="stat-card streak-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-sublabel">Longest: {stats.longestStreak} days</div>
          </div>
        </div>

        <div className="stat-card challenge-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats.monthlyChallenge?.percentage || 0}%</div>
            <div className="stat-label">Monthly Challenge</div>
            <div className="stat-sublabel">
              {stats.monthlyChallenge?.current?.toFixed(1) || 0} / {stats.monthlyChallenge?.target || 100} km
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${stats.monthlyChallenge?.percentage || 0}%`}}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatDistance(parseFloat(stats.totalDistance))}</div>
          <div className="stat-label">Total Distance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalRuns}</div>
          <div className="stat-label">Total Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatPace(parseFloat(stats.avgPace))}</div>
          <div className="stat-label">Avg Pace</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDistance(parseFloat(stats.longestRun))}</div>
          <div className="stat-label">Longest Run</div>
        </div>
      </div>

      {/* Weekly/Monthly */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatDistance(parseFloat(stats.weeklyDistance))}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDistance(parseFloat(stats.monthlyDistance))}</div>
          <div className="stat-label">This Month</div>
        </div>
      </div>

      {/* Personal Records */}
      {stats.personalRecords && (
        Object.values(stats.personalRecords).some(pr => pr && pr.time) ||
        (stats.personalRecords.longestRun && stats.personalRecords.longestRun.distance)
      ) && (
        <div className="section">
          <h3>Personal Records</h3>
          <div className="pr-grid">
            {stats.personalRecords.fastest5k?.time && (
              <div className="pr-card">
                <div className="pr-distance">5K</div>
                <div className="pr-time">{formatTime(stats.personalRecords.fastest5k.time)}</div>
                <div className="pr-date">
                  {new Date(stats.personalRecords.fastest5k.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {stats.personalRecords.fastest10k?.time && (
              <div className="pr-card">
                <div className="pr-distance">10K</div>
                <div className="pr-time">{formatTime(stats.personalRecords.fastest10k.time)}</div>
                <div className="pr-date">
                  {new Date(stats.personalRecords.fastest10k.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {stats.personalRecords.fastestHalfMarathon?.time && (
              <div className="pr-card">
                <div className="pr-distance">Half Marathon</div>
                <div className="pr-time">{formatTime(stats.personalRecords.fastestHalfMarathon.time)}</div>
                <div className="pr-date">
                  {new Date(stats.personalRecords.fastestHalfMarathon.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {stats.personalRecords.fastestMarathon?.time && (
              <div className="pr-card">
                <div className="pr-distance">Marathon</div>
                <div className="pr-time">{formatTime(stats.personalRecords.fastestMarathon.time)}</div>
                <div className="pr-date">
                  {new Date(stats.personalRecords.fastestMarathon.date).toLocaleDateString()}
                </div>
              </div>
            )}
            {stats.personalRecords.longestRun?.distance && (
              <div className="pr-card">
                <div className="pr-distance">Longest</div>
                <div className="pr-time">{formatDistance(stats.personalRecords.longestRun.distance)}</div>
                <div className="pr-date">
                  {new Date(stats.personalRecords.longestRun.date).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pace Zones */}
      {stats.paceZones && (
        <div className="section">
          <h3>Pace Zone Distribution</h3>
          <div className="pace-zones">
            {Object.entries(stats.paceZones).map(([zone, count]) => (
              count > 0 && (
                <div key={zone} className={`pace-zone-bar ${zone}`}>
                  <span className="zone-label">{zone}</span>
                  <span className="zone-count">{count} runs</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="section">
        <button onClick={loadHeatmap} className="btn-secondary">
          {showHeatmap ? 'Hide' : 'Show'} Route Heatmap
        </button>
        {showHeatmap && heatmapData.length > 0 && (
          <div className="heatmap-info">
            <p>Heatmap shows {heatmapData.length} GPS points from all your runs</p>
            <p className="text-muted">Feature coming soon: Interactive map visualization</p>
          </div>
        )}
      </div>

      {/* Recent Runs */}
      <div className="section">
        <h3>Recent Runs</h3>
        {recentRuns.length === 0 ? (
          <p>No runs yet. Start tracking!</p>
        ) : (
          <div className="runs-list">
            {recentRuns.map(run => (
              <div 
                key={run._id} 
                className="run-card"
                onClick={() => navigate(`/run/${run._id}`)}
              >
                <div className="run-header">
                  <span className="run-date">
                    {new Date(run.date).toLocaleDateString()}
                  </span>
                  {run.routeName && <span className="route-name">{run.routeName}</span>}
                  {run.paceZone && <span className={`pace-badge ${run.paceZone}`}>{run.paceZone}</span>}
                </div>
                <div className="run-stats-row">
                  <div>
                    <strong>{formatDistance(run.distance)}</strong>
                    <span className="stat-label-small">Distance</span>
                  </div>
                  <div>
                    <strong>{formatTime(run.duration)}</strong>
                    <span className="stat-label-small">Time</span>
                  </div>
                  <div>
                    <strong>{formatPace(run.pace)}</strong>
                    <span className="stat-label-small">Pace</span>
                  </div>
                  {run.elevationGain > 0 && (
                    <div>
                      <strong>{run.elevationGain.toFixed(0)}m</strong>
                      <span className="stat-label-small">Elevation</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends Activity */}
      {friendsRuns.length > 0 && (
        <div className="section">
          <h3>Friends Activity</h3>
          <div className="friends-runs">
            {friendsRuns.map(run => (
              <div key={run._id} className="friend-run-card">
                <div className="friend-info">
                  <strong>{run.userId?.email}</strong>
                  <span className="run-date">{new Date(run.date).toLocaleDateString()}</span>
                </div>
                <div className="run-summary">
                  {formatDistance(run.distance)} • {formatTime(run.duration)} • {formatPace(run.pace)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <button onClick={() => navigate('/running/all')} className="btn-secondary">
          View All Runs
        </button>
      </div>
    </div>
  );
}

export default RunningDashboard;
