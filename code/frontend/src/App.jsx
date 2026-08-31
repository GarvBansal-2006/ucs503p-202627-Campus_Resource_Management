import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FacultyDashboard from './components/FacultyDashboard';
import ConflictResolution from './components/ConflictResolution';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const navStyle = {
    padding: '15px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    gap: '20px',
    marginBottom: '30px'
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#2d3748',
    fontWeight: '600',
    fontSize: '15px'
  };

  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>Faculty Booking</Link>
        {/* <Link to="/admin" style={linkStyle}>Admin Dashboard</Link> */}
        {/* <Link to="/student" style={linkStyle}>Student Portal</Link> */}
      </nav>

      <Routes>
        <Route path="/" element={<FacultyDashboard />} />
        <Route path="/recommendations" element={<ConflictResolution />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;