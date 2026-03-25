import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateWorkout from './pages/CreateWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import Templates from './pages/Templates';
import Progress from './pages/Progress';
import HealthSync from './pages/HealthSync';
import Running from './pages/Running';
import RunTracker from './pages/RunTracker';
import RunDetailEnhanced from './pages/RunDetailEnhanced';
import RunningDashboard from './pages/RunningDashboard';
import ActivityFeed from './pages/ActivityFeed';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import ThemeToggle from './components/ThemeToggle';
import Navigation from './components/Navigation';
import './App.css';

function AppContent() {
  const location = useLocation();
  const showNav = !['/login', '/register'].includes(location.pathname) && localStorage.getItem('token');

  return (
    <>
      {showNav && <Navigation />}
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-workout" element={<PrivateRoute><CreateWorkout /></PrivateRoute>} />
        <Route path="/workout/:id" element={<PrivateRoute><WorkoutDetail /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/health-sync" element={<PrivateRoute><HealthSync /></PrivateRoute>} />
        <Route path="/running" element={<PrivateRoute><RunningDashboard /></PrivateRoute>} />
        <Route path="/running/all" element={<PrivateRoute><Running /></PrivateRoute>} />
        <Route path="/run-tracker" element={<PrivateRoute><RunTracker /></PrivateRoute>} />
        <Route path="/run/:id" element={<PrivateRoute><RunDetailEnhanced /></PrivateRoute>} />
        <Route path="/feed" element={<PrivateRoute><ActivityFeed /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
