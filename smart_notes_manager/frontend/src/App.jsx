import { Outlet, Link, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <Link to="/dashboard" className="brand">Smart Notes</Link>
        <div>
          {token ? (
            <button onClick={logout} className="navBtn">Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

export default App;
