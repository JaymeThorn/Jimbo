import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getRunStats } from '../services/api';
import { Line } from 'react-chartjs-2';
import { formatDistance } from '../utils/units';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Progress() {
  const [stats, setStats] = useState({ prs: {}, progressData: {} });
  const [runStats, setRunStats] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [view, setView] = useState('workout'); // workout or running
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRunStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getStats();
      setStats(data);
      if (Object.keys(data.progressData).length > 0) {
        setSelectedExercise(Object.keys(data.progressData)[0]);
      }
    } catch (err) {
      alert('Failed to load progress data');
    }
  };

  const fetchRunStats = async () => {
    try {
      const { data } = await getRunStats();
      setRunStats(data);
    } catch (err) {
      console.error('Failed to load run stats');
    }
  };

  const getChartData = () => {
    if (!selectedExercise || !stats.progressData[selectedExercise]) {
      return { labels: [], datasets: [] };
    }

    const data = stats.progressData[selectedExercise];
    return {
      labels: data.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [{
        label: 'Max Weight (lbs)',
        data: data.map(d => d.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }]
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${selectedExercise} Progress` }
    }
  };

  return (
    <div className="container jimbo-container">
      <h2>Progress & Personal Records</h2>

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={view === 'workout' ? 'active' : ''}
          onClick={() => setView('workout')}
        >
          💪 Workout
        </button>
        <button 
          className={view === 'running' ? 'active' : ''}
          onClick={() => setView('running')}
        >
          🏃 Running
        </button>
      </div>

      {view === 'workout' ? (
        <>
          {/* PRs Section */}
          <div className="prs-section">
            <h3>🏆 Personal Records</h3>
            {Object.keys(stats.prs).length === 0 ? (
              <p>No personal records yet. Complete some workouts!</p>
            ) : (
              <div className="prs-grid">
                {Object.entries(stats.prs).map(([exercise, weight]) => (
                  <div key={exercise} className="pr-card">
                    <div className="pr-exercise">{exercise}</div>
                    <div className="pr-weight">{weight} lbs</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Chart */}
          {Object.keys(stats.progressData).length > 0 && (
            <div className="chart-section">
              <h3>📈 Progress Chart</h3>
              <select 
                value={selectedExercise} 
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="exercise-select"
              >
                {Object.keys(stats.progressData).map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
              <div className="chart-container">
                <Line data={getChartData()} options={options} />
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Running Stats */}
          {runStats && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{formatDistance(parseFloat(runStats.totalDistance))}</div>
                  <div className="stat-label">Total Distance</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{runStats.totalRuns}</div>
                  <div className="stat-label">Total Runs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{runStats.currentStreak}</div>
                  <div className="stat-label">Current Streak</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{runStats.longestStreak}</div>
                  <div className="stat-label">Longest Streak</div>
                </div>
              </div>

              {/* Running PRs */}
              {runStats.personalRecords && (
                Object.values(runStats.personalRecords).some(pr => pr && pr.time) ||
                (runStats.personalRecords.longestRun && runStats.personalRecords.longestRun.distance)
              ) && (
                <div className="prs-section">
                  <h3>🏆 Running Personal Records</h3>
                  <div className="pr-grid">
                    {runStats.personalRecords.fastest5k?.time && (
                      <div className="pr-card">
                        <div className="pr-distance">5K</div>
                        <div className="pr-time">{Math.floor(runStats.personalRecords.fastest5k.time / 60)}:{(runStats.personalRecords.fastest5k.time % 60).toString().padStart(2, '0')}</div>
                      </div>
                    )}
                    {runStats.personalRecords.fastest10k?.time && (
                      <div className="pr-card">
                        <div className="pr-distance">10K</div>
                        <div className="pr-time">{Math.floor(runStats.personalRecords.fastest10k.time / 60)}:{(runStats.personalRecords.fastest10k.time % 60).toString().padStart(2, '0')}</div>
                      </div>
                    )}
                    {runStats.personalRecords.fastestHalfMarathon?.time && (
                      <div className="pr-card">
                        <div className="pr-distance">Half Marathon</div>
                        <div className="pr-time">{Math.floor(runStats.personalRecords.fastestHalfMarathon.time / 60)}:{(runStats.personalRecords.fastestHalfMarathon.time % 60).toString().padStart(2, '0')}</div>
                      </div>
                    )}
                    {runStats.personalRecords.longestRun?.distance && (
                      <div className="pr-card">
                        <div className="pr-distance">Longest Run</div>
                        <div className="pr-time">{formatDistance(runStats.personalRecords.longestRun.distance)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pace Zones */}
              {runStats.paceZones && (
                <div className="section">
                  <h3>Pace Zone Distribution</h3>
                  <div className="pace-zones">
                    {Object.entries(runStats.paceZones).map(([zone, count]) => (
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
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Progress;
