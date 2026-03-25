import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import RunDetail from './pages/RunDetail';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
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
          <Route path="/running" element={<PrivateRoute><Running /></PrivateRoute>} />
          <Route path="/run-tracker" element={<PrivateRoute><RunTracker /></PrivateRoute>} />
          <Route path="/run/:id" element={<PrivateRoute><RunDetail /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
