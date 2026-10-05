import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FacultyDashboard from './components/FacultyDashboard';
import ConflictResolution from './components/ConflictResolution';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminHomePage from './components/AdminHomePage';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const navStyle = {
    padding: '15px 20px',
    background: 'transparent',
    borderBottom: 'none',
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    alignItems: 'center',
    justifyContent: 'space-between',
    anchorName: '--navStyle'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#2d3748',
    fontWeight: '600',
    fontSize: '15px'
  };

  const logoutButtonStyle = {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <BrowserRouter basename="/ucs503p-202627-Campus_Resource_Management/">
      {user && (
        <nav style={navStyle}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {user.role === 'Faculty' && (
              <>
                <Link to="/faculty" style={linkStyle}>Faculty Booking</Link>
                <Link to="/recommendations" style={linkStyle}>Conflict Resolution</Link>
              </>
            )}
            {user.role === 'Admin' && (
              <>
                <Link to="/adminHomePage" style={linkStyle}>Admin Home</Link>
                <Link to="/admin" style={linkStyle}>Admin Dashboard</Link>
              </>
            )}
            {user.role === 'Student' && (
              <Link to="/student" style={linkStyle}>Student Portal</Link>
            )}
          </div>
          <div>
            <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to={user.role === 'Student' ? '/student' : user.role === 'Admin' ? '/adminHomePage' : '/faculty'} />} />
        
        {/* Protected Routes */}
        <Route path="/faculty" element={user && user.role === 'Faculty' ? <FacultyDashboard /> : <Navigate to="/" />} />
        <Route path="/recommendations" element={user && user.role === 'Faculty' ? <ConflictResolution /> : <Navigate to="/" />} />
        <Route path="/admin" element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/adminHomePage" element={user && user.role === 'Admin' ? <AdminHomePage /> : <Navigate to="/" />} />
        <Route path="/student" element={user && user.role === 'Student' ? <StudentDashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;