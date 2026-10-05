import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FacultyDashboard from './components/FacultyDashboard';
import ConflictResolution from './components/ConflictResolution';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminHomePage from './components/AdminHomePage';

function App() {
  
  const navStyle = {
    padding: '15px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    anchorName: '--navStyle'
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
        <Link to="/adminHomePage" style={linkStyle}>Admin Home</Link> 
        <Link to="/student" style={linkStyle}>Student Portal</Link>
      </nav>
       
      <Routes>
        <Route path="/" element={<FacultyDashboard />} />
        <Route path="/recommendations" element={<ConflictResolution />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/adminHomePage" element={<AdminHomePage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;