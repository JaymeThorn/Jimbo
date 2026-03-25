import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="jimbo-nav">
      <Link to="/dashboard" className="jimbo-nav-logo">JIMBO</Link>
      <div className="jimbo-nav-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/running" className={location.pathname.startsWith('/run') ? 'active' : ''}>
          Running
        </Link>
        <Link to="/create-workout" className={location.pathname.includes('workout') ? 'active' : ''}>
          Workout
        </Link>
        <Link to="/templates">Templates</Link>
        <Link to="/progress">Progress</Link>
        <Link to="/health-sync">Sync</Link>
        <Link to="/settings">Settings</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navigation;
