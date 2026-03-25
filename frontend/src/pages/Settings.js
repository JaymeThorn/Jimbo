import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const navigate = useNavigate();

  useEffect(() => {
    const savedWeightUnit = localStorage.getItem('weightUnit') || 'lbs';
    const savedDistanceUnit = localStorage.getItem('distanceUnit') || 'km';
    setWeightUnit(savedWeightUnit);
    setDistanceUnit(savedDistanceUnit);
  }, []);

  const handleWeightUnitChange = (unit) => {
    setWeightUnit(unit);
    localStorage.setItem('weightUnit', unit);
    window.dispatchEvent(new Event('unitsChanged'));
  };

  const handleDistanceUnitChange = (unit) => {
    setDistanceUnit(unit);
    localStorage.setItem('distanceUnit', unit);
    window.dispatchEvent(new Event('unitsChanged'));
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back</button>
      
      <div className="settings-container">
        <h2>Settings</h2>

        <div className="settings-section">
          <h3>Units</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>Weight Unit</h4>
              <p>Choose your preferred weight measurement</p>
            </div>
            <div className="setting-control">
              <button 
                className={`unit-btn ${weightUnit === 'lbs' ? 'active' : ''}`}
                onClick={() => handleWeightUnitChange('lbs')}
              >
                Pounds (lbs)
              </button>
              <button 
                className={`unit-btn ${weightUnit === 'kg' ? 'active' : ''}`}
                onClick={() => handleWeightUnitChange('kg')}
              >
                Kilograms (kg)
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Distance Unit</h4>
              <p>Choose your preferred distance measurement</p>
            </div>
            <div className="setting-control">
              <button 
                className={`unit-btn ${distanceUnit === 'km' ? 'active' : ''}`}
                onClick={() => handleDistanceUnitChange('km')}
              >
                Kilometers (km)
              </button>
              <button 
                className={`unit-btn ${distanceUnit === 'mi' ? 'active' : ''}`}
                onClick={() => handleDistanceUnitChange('mi')}
              >
                Miles (mi)
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>About</h3>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Version</h4>
              <p>1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
