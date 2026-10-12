import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        
        if (data.user.role === 'Student') {
          navigate('/student');
        } else if (data.user.role === 'Admin') {
          navigate('/adminHomePage');
        } else {
          navigate('/faculty');
        }
      } else {
        if (data.message === 'User not found') {
            setError("The email address you entered isn't connected to an account.");
        } else if (data.message === 'Invalid credentials') {
            setError("The password you've entered is incorrect.");
        } else {
            setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Unable to connect to the server. Please check your connection.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: 'white' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#14205c' }}>Campus Resource Login</h2>
      
      {error && (
        <div style={{ backgroundColor: '#fdf2f2', border: '1px solid #f8b4b4', color: '#c53030', padding: '10px 15px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px', lineHeight: '1.4' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #cbd5e0', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
            required 
            placeholder="Enter your email"
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #cbd5e0', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
            required 
            placeholder="Enter your password"
          />
        </div>
        
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
