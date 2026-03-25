import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRuns, createRun } from '../services/api';

function HealthSync() {
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [runs, setRuns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkConnection();
    fetchRuns();
    handleStravaCallback();
  }, []);

  const checkConnection = () => {
    const token = localStorage.getItem('googleFitToken');
    setConnected(!!token);
    const stravaToken = localStorage.getItem('stravaAccessToken');
    setStravaConnected(!!stravaToken);
  };

  const fetchRuns = async () => {
    try {
      const { data } = await getRuns();
      setRuns(data);
    } catch (err) {
      console.error('Failed to load runs');
    }
  };

  const syncAppleHealth = async () => {
    setSyncing(true);
    try {
      alert('Apple Health sync requires the iOS app. Coming soon!');
    } catch (err) {
      alert('Failed to sync with Apple Health');
    } finally {
      setSyncing(false);
    }
  };

  const syncGoogleFit = async () => {
    setSyncing(true);
    try {
      const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      const SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.activity.write https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.location.write';
      
      if (!CLIENT_ID || CLIENT_ID === 'your_google_client_id_here') {
        alert('Google Fit integration not configured. Add REACT_APP_GOOGLE_CLIENT_ID to .env');
        setSyncing(false);
        return;
      }

      // Use Google Identity Services (newer method)
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            localStorage.setItem('googleFitToken', response.access_token);
            setConnected(true);
            setSyncing(false);
            alert('Successfully connected to Google Fit!');
          } else {
            setSyncing(false);
            alert('Failed to get access token');
          }
        },
        error_callback: (error) => {
          console.error('OAuth error:', error);
          setSyncing(false);
          alert('Failed to connect: ' + (error.message || 'Unknown error'));
        }
      });

      client.requestAccessToken();
    } catch (err) {
      console.error('Google Fit error:', err);
      alert('Failed to sync with Google Fit. Make sure you have a valid Client ID.');
      setSyncing(false);
    }
  };

  const disconnectGoogleFit = () => {
    localStorage.removeItem('googleFitToken');
    setConnected(false);
    alert('Disconnected from Google Fit');
  };

  const connectStrava = () => {
    const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
    
    if (!CLIENT_ID || CLIENT_ID === 'your_strava_client_id_here') {
      alert('Strava integration not configured. Add REACT_APP_STRAVA_CLIENT_ID to .env');
      return;
    }

    // Clear any existing tokens to force fresh auth
    localStorage.removeItem('stravaAccessToken');
    localStorage.removeItem('stravaRefreshToken');

    const redirectUri = `${window.location.origin}/health-sync`;
    const scope = 'read,activity:read_all';
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&approval_prompt=force`;
    
    window.location.href = stravaAuthUrl;
  };

  const handleStravaCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !localStorage.getItem('stravaAccessToken')) {
      setSyncing(true);
      try {
        const CLIENT_ID = process.env.REACT_APP_STRAVA_CLIENT_ID;
        const CLIENT_SECRET = process.env.REACT_APP_STRAVA_CLIENT_SECRET;
        
        const response = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code'
          })
        });

        const data = await response.json();
        
        if (data.access_token) {
          localStorage.setItem('stravaAccessToken', data.access_token);
          localStorage.setItem('stravaRefreshToken', data.refresh_token);
          setStravaConnected(true);
          alert('Successfully connected to Strava!');
          
          // Clean URL
          window.history.replaceState({}, document.title, '/health-sync');
        }
      } catch (err) {
        console.error('Strava auth error:', err);
        alert('Failed to connect to Strava');
      } finally {
        setSyncing(false);
      }
    }
  };

  const disconnectStrava = () => {
    localStorage.removeItem('stravaAccessToken');
    localStorage.removeItem('stravaRefreshToken');
    setStravaConnected(false);
    alert('Disconnected from Strava');
  };

  const importFromStrava = async () => {
    const token = localStorage.getItem('stravaAccessToken');
    if (!token) {
      alert('Please connect to Strava first');
      return;
    }

    setSyncing(true);
    try {
      // Get activities from last 6 months (more flexible)
      const after = Math.floor((Date.now() - 180 * 24 * 60 * 60 * 1000) / 1000);
      
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Strava API error:', errorData);
        throw new Error('Failed to fetch Strava activities');
      }

      const activities = await response.json();
      console.log('Total activities:', activities.length);
      
      const runs = activities.filter(a => a.type === 'Run' || a.type === 'VirtualRun');
      console.log('Runs found:', runs.length);

      if (runs.length === 0) {
        alert(`No runs found in Strava (last 6 months). Total activities: ${activities.length}`);
        setSyncing(false);
        return;
      }

      let importedCount = 0;

      for (const activity of runs) {
        try {
          // Get detailed activity with route
          const detailResponse = await fetch(
            `https://www.strava.com/api/v3/activities/${activity.id}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );

          const detail = await detailResponse.json();
          
          // Convert polyline to coordinates if available
          let route = [];
          if (detail.map && detail.map.polyline) {
            route = decodePolyline(detail.map.polyline);
          }

          const distanceKm = activity.distance / 1000;
          const durationSeconds = activity.moving_time;
          const pace = distanceKm > 0 ? (durationSeconds / 60) / distanceKm : 0;

          await createRun({
            date: new Date(activity.start_date),
            distance: distanceKm,
            duration: durationSeconds,
            pace: pace,
            route: route,
            notes: `Imported from Strava: ${activity.name}`
          });

          importedCount++;
        } catch (err) {
          console.error('Failed to import activity:', err);
        }
      }

      setSyncing(false);
      alert(`Imported ${importedCount} runs from Strava!`);
      fetchRuns();
    } catch (err) {
      console.error('Strava import error:', err);
      setSyncing(false);
      alert('Failed to import from Strava. Check console for details.');
    }
  };

  // Decode Strava polyline to lat/lng coordinates
  const decodePolyline = (encoded) => {
    const points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5, timestamp: Date.now() });
    }

    return points;
  };

  const syncRunToGoogleFit = async (run) => {
    const token = localStorage.getItem('googleFitToken');
    if (!token) {
      alert('Please connect to Google Fit first');
      return;
    }

    try {
      const startTime = new Date(run.date).getTime();
      const endTime = startTime + (run.duration * 1000);

      // Create session
      const session = {
        id: `run-${run._id}`,
        name: 'Running',
        description: `${run.distance.toFixed(2)} km run`,
        startTimeMillis: startTime,
        endTimeMillis: endTime,
        activityType: 8, // Running
        application: {
          name: 'Gym Tracker',
          version: '1.0'
        }
      };

      await fetch('https://www.googleapis.com/fitness/v1/users/me/sessions', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session)
      });

      // Add distance data
      const distanceDataSource = {
        dataStreamName: 'Distance',
        type: 'derived',
        application: { name: 'Gym Tracker' },
        dataType: {
          name: 'com.google.distance.delta',
          field: [{ name: 'distance', format: 'floatPoint' }]
        }
      };

      const distanceData = {
        minStartTimeNs: startTime * 1000000,
        maxEndTimeNs: endTime * 1000000,
        dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
        point: [{
          startTimeNanos: startTime * 1000000,
          endTimeNanos: endTime * 1000000,
          dataTypeName: 'com.google.distance.delta',
          value: [{ fpVal: run.distance * 1000 }] // Convert km to meters
        }]
      };

      await fetch(`https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta/datasets/${startTime * 1000000}-${endTime * 1000000}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(distanceData)
      });

      // Add route data if available
      if (run.route && run.route.length > 0) {
        const routePoints = run.route.map((point, index) => ({
          startTimeNanos: (startTime + (index * 1000)) * 1000000,
          endTimeNanos: (startTime + ((index + 1) * 1000)) * 1000000,
          dataTypeName: 'com.google.location.sample',
          value: [
            { fpVal: point.lat },
            { fpVal: point.lng },
            { fpVal: 10 }, // accuracy in meters
            { fpVal: 0 }   // altitude
          ]
        }));

        await fetch(`https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.location.sample:com.google.android.gms:merge_location_samples/datasets/${startTime * 1000000}-${endTime * 1000000}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            minStartTimeNs: startTime * 1000000,
            maxEndTimeNs: endTime * 1000000,
            point: routePoints
          })
        });
      }

      alert('Run synced to Google Fit!');
    } catch (err) {
      console.error('Sync error:', err);
      if (err.message?.includes('401')) {
        localStorage.removeItem('googleFitToken');
        setConnected(false);
        alert('Session expired. Please reconnect to Google Fit.');
      } else {
        alert('Failed to sync run. Check console for details.');
      }
    }
  };

  const syncAllRuns = async () => {
    if (!connected) {
      alert('Please connect to Google Fit first');
      return;
    }

    setSyncing(true);
    let successCount = 0;
    
    for (const run of runs) {
      try {
        await syncRunToGoogleFit(run);
        successCount++;
      } catch (err) {
        console.error(`Failed to sync run ${run._id}:`, err);
      }
    }

    setSyncing(false);
    alert(`Synced ${successCount} of ${runs.length} runs to Google Fit!`);
  };

  const importFromGoogleFit = async () => {
    const token = localStorage.getItem('googleFitToken');
    if (!token) {
      alert('Please connect to Google Fit first');
      return;
    }

    setSyncing(true);
    try {
      // Get runs from last 30 days
      const endTime = Date.now();
      const startTime = endTime - (30 * 24 * 60 * 60 * 1000); // 30 days ago

      // Fetch running sessions
      const sessionsResponse = await fetch(
        `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}&activityType=8`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const sessionsData = await sessionsResponse.json();
      const runningSessions = sessionsData.session || [];

      if (runningSessions.length === 0) {
        alert('No running sessions found in Google Fit (last 30 days)');
        setSyncing(false);
        return;
      }

      let importedCount = 0;

      for (const session of runningSessions) {
        try {
          const startTimeMs = parseInt(session.startTimeMillis);
          const endTimeMs = parseInt(session.endTimeMillis);
          const durationSeconds = (endTimeMs - startTimeMs) / 1000;

          // Fetch distance data for this session
          const distanceResponse = await fetch(
            `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                aggregateBy: [{
                  dataTypeName: 'com.google.distance.delta'
                }],
                startTimeMillis: startTimeMs,
                endTimeMillis: endTimeMs
              })
            }
          );

          const distanceData = await distanceResponse.json();
          let distanceMeters = 0;

          if (distanceData.bucket && distanceData.bucket[0]?.dataset[0]?.point) {
            const points = distanceData.bucket[0].dataset[0].point;
            distanceMeters = points.reduce((sum, point) => {
              return sum + (point.value[0]?.fpVal || 0);
            }, 0);
          }

          const distanceKm = distanceMeters / 1000;
          const pace = distanceKm > 0 ? (durationSeconds / 60) / distanceKm : 0;

          // Create run in our app
          await createRun({
            date: new Date(startTimeMs),
            distance: distanceKm,
            duration: durationSeconds,
            pace: pace,
            route: [], // Google Fit doesn't easily expose route data via API
            notes: `Imported from Google Fit: ${session.name || 'Running'}`
          });

          importedCount++;
        } catch (err) {
          console.error('Failed to import session:', err);
        }
      }

      setSyncing(false);
      alert(`Imported ${importedCount} runs from Google Fit!`);
      fetchRuns(); // Refresh the list
    } catch (err) {
      console.error('Import error:', err);
      setSyncing(false);
      if (err.message?.includes('401')) {
        localStorage.removeItem('googleFitToken');
        setConnected(false);
        alert('Session expired. Please reconnect to Google Fit.');
      } else {
        alert('Failed to import from Google Fit. Check console for details.');
      }
    }
  };

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">← Back</button>
      
      <h2>Health App Integration</h2>

      <div className="health-sync-section">
        <div className="health-card">
          <div className="health-icon">🍎</div>
          <h3>Apple Health</h3>
          <p>Sync your workouts to Apple Health on iOS devices</p>
          <button 
            onClick={syncAppleHealth} 
            disabled={syncing}
            className="btn"
          >
            {syncing ? 'Connecting...' : 'Connect Apple Health'}
          </button>
          <p className="health-note">Requires iOS app (coming soon)</p>
        </div>

        <div className="health-card">
          <div className="health-icon">🏃</div>
          <h3>Google Fit</h3>
          <p>Sync your workouts and runs to Google Fit</p>
          {connected ? (
            <>
              <div className="connected-badge">✅ Connected</div>
              <button 
                onClick={disconnectGoogleFit}
                className="btn-secondary"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button 
              onClick={syncGoogleFit} 
              disabled={syncing}
              className="btn"
            >
              {syncing ? 'Connecting...' : 'Connect Google Fit'}
            </button>
          )}
          <p className="health-note">Web integration available</p>
        </div>

        <div className="health-card">
          <div className="health-icon">🚴</div>
          <h3>Strava</h3>
          <p>Import your runs from Strava with full GPS routes</p>
          {stravaConnected ? (
            <>
              <div className="connected-badge">✅ Connected</div>
              <button 
                onClick={disconnectStrava}
                className="btn-secondary"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button 
              onClick={connectStrava} 
              disabled={syncing}
              className="btn"
            >
              {syncing ? 'Connecting...' : 'Connect Strava'}
            </button>
          )}
          <p className="health-note">Imports runs with routes</p>
        </div>
      </div>

      {stravaConnected && (
        <div className="sync-section">
          <h3>Import from Strava</h3>
          <p>Import your runs from Strava with full GPS routes (last 30 days)</p>
          <button 
            onClick={importFromStrava}
            disabled={syncing}
            className="btn"
            style={{ marginBottom: '20px' }}
          >
            {syncing ? 'Importing...' : '⬇️ Import Runs from Strava'}
          </button>
        </div>
      )}

      {connected && (
        <div className="sync-section">
          <h3>Import from Google Fit</h3>
          <p>Import your running data from Google Fit (last 30 days)</p>
          <button 
            onClick={importFromGoogleFit}
            disabled={syncing}
            className="btn"
            style={{ marginBottom: '20px' }}
          >
            {syncing ? 'Importing...' : '⬇️ Import Runs from Google Fit'}
          </button>

          {runs.length > 0 && (
            <>
              <h3>Export to Google Fit</h3>
              <p>You have {runs.length} run{runs.length !== 1 ? 's' : ''} to sync</p>
              <button 
                onClick={syncAllRuns}
                disabled={syncing}
                className="btn"
              >
                {syncing ? 'Syncing...' : `⬆️ Sync All ${runs.length} Runs to Google Fit`}
              </button>
              
              <div className="run-list-sync">
                {runs.slice(0, 5).map(run => (
                  <div key={run._id} className="sync-run-item">
                    <div>
                      <strong>{new Date(run.date).toLocaleDateString()}</strong>
                      <span> - {run.distance.toFixed(2)} km</span>
                    </div>
                    <button 
                      onClick={() => syncRunToGoogleFit(run)}
                      className="btn-small"
                      disabled={syncing}
                    >
                      Sync
                    </button>
                  </div>
                ))}
                {runs.length > 5 && (
                  <p className="more-runs">+ {runs.length - 5} more runs</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="health-info">
        <h3>What gets synced?</h3>
        <ul>
          <li>✅ Running sessions (date, duration, distance)</li>
          <li>✅ GPS route data (if available)</li>
          <li>✅ Pace and speed information</li>
          <li>✅ Workout sessions (strength training)</li>
          <li>✅ Exercise types and duration</li>
        </ul>

        <h3>Setup Instructions</h3>
        <div className="setup-instructions">
          <h4>Google Fit (Web)</h4>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Create a new project or select existing</li>
            <li>Enable "Fitness API"</li>
            <li>Create OAuth 2.0 credentials (Web application)</li>
            <li>Add authorized JavaScript origins:
              <ul>
                <li><code>http://localhost:3000</code> (development)</li>
                <li><code>https://your-domain.vercel.app</code> (production)</li>
              </ul>
            </li>
            <li>Copy Client ID to <code>.env</code> as <code>REACT_APP_GOOGLE_CLIENT_ID</code></li>
            <li>Restart your app</li>
          </ol>

          <h4>Required Scopes</h4>
          <ul>
            <li><code>fitness.activity.write</code> - Write workout sessions</li>
            <li><code>fitness.location.write</code> - Write GPS route data</li>
          </ul>

          <h4>Apple Health (iOS)</h4>
          <p>Apple Health integration requires a native iOS app built with:</p>
          <ul>
            <li>React Native + HealthKit</li>
            <li>Capacitor + Health plugin</li>
            <li>Swift native app</li>
          </ul>
          <p>Web browsers cannot access Apple Health directly for privacy reasons.</p>
        </div>
      </div>
    </div>
  );
}

export default HealthSync;
