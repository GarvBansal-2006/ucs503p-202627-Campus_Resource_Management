import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import FacultyDashboard from './components/FacultyDashboard';
import FacultyHistory from './components/FacultyHistory';
import ConflictResolution from './components/ConflictResolution';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminHomePage from './components/AdminHomePage';
import AdminSchedule from './components/AdminSchedule';
import AdminRequests from './components/AdminRequests';
import AdminBooking from './components/AdminBooking';
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
    padding: '15px 30px',
    backgroundColor: '#5e7590',
    borderBottom: 'none',
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-between',
    alignItems: 'center',
    anchorName: '--navStyle'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: 'white',
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
              <Link to="/faculty" style={linkStyle}>Faculty Booking</Link>
            )}
            {user.role === 'Admin' && (
              <Link to="/adminHomePage" style={linkStyle}>Admin Home</Link> 
            )}
            {user.role === 'Student' && (
              <Link to="/student" style={linkStyle}>Student Portal</Link>
            )}
          </div>
          <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>
        </nav>
      )}
       
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to={user.role === 'Student' ? '/student' : user.role === 'Admin' ? '/adminHomePage' : '/faculty'} />} />
        <Route path="/faculty" element={user && user.role === 'Faculty' ? <FacultyDashboard /> : <Navigate to="/" />} />
        <Route path="/faculty/history" element={user && user.role === 'Faculty' ? <FacultyHistory /> : <Navigate to="/" />} />
        <Route path="/recommendations" element={user && user.role === 'Faculty' ? <ConflictResolution /> : <Navigate to="/" />} />
        <Route path="/admin" element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/requests" element={user && user.role === 'Admin' ? <AdminRequests /> : <Navigate to="/" />} />
        <Route path="/admin/booking" element={user && user.role === 'Admin' ? <AdminBooking /> : <Navigate to="/" />} />
        <Route path="/student" element={user && user.role === 'Student' ? <StudentDashboard /> : <Navigate to="/" />} />
        <Route path="/adminHomePage" element={user && user.role === 'Admin' ? <AdminHomePage /> : <Navigate to="/" />} />
        <Route path="/admin/schedule" element={user && user.role === 'Admin' ? <AdminSchedule /> : <Navigate to="/" />} />
      </Routes>
      {user && (
        <div style={{ height: '30px', backgroundColor: '#5e7590', width: '100%', position: 'fixed', bottom: 0, left: 0, zIndex: 1000 }}></div>
      )}
    </BrowserRouter>
  );
}

export default App;