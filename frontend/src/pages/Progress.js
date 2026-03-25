import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';
import { Line } from 'react-chartjs-2';
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
  const [selectedExercise, setSelectedExercise] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
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
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back</button>
      
      <h2>Progress & Personal Records</h2>

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
    </div>
  );
}

export default Progress;
