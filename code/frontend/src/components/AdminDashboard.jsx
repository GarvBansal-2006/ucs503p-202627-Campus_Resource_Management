import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    title: 'DBMS Lab',
    roomId: '', 
    facultyId: '',
    dayOfWeek: 'Monday',
    startTime: '14:00', 
    endTime: '16:00',  
    batches: '2C54' 
  });  

  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/metadata')
      .then(res => res.json())
      .then(data => {
        setRooms(data.rooms);
        setFaculty(data.faculty);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(function(prevState) {
    return {
        ...prevState,
        [name]: value
    };
}); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to schedule activity");
    }
  };

  const styles = {
    container: { border: '1px solid rgba(42, 165, 242, 0.61)', width: '100%', maxWidth: '750px', padding: '20px 30px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.85)', boxSizing: 'border-box', margin: '0 auto' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
    input: { padding: '8px', fontSize: '14px', marginTop: '5px', width: '100%', boxSizing: 'border-box', backgroundColor: '#dcf2ff61', border: '1px solid rgba(42, 165, 242, 0.61)', borderRadius: '5px'},
    row: { display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' },
    col: { flex: '1 1 200px', display: 'flex', flexDirection: 'column' },
    button: { padding: '10px 25px', fontSize: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div className="adminPage">
      <div className="sideBar">
        <Link to="/adminHomePage">Home</Link>
        <Link to="/">Venue Booking</Link>
        <Link to="#">Exam Scheduling</Link>
        <Link to="#">Calendar</Link>
        <Link to="#">Settings</Link>
      </div> 
      <div className="adminContent">
        <div style={{ textAlign: 'center', marginBottom: '5px' }}>
          <h2 style={{ color: '#1800ad', margin: '0 0 5px 0' }}>Create New Activity</h2>
          <p style={{ margin: 0, color: '#5e7590', fontSize: '14px' }}>Schedule a class, lab, placement test, or other campus activity.</p>
        </div>
        
        <form style={styles.container} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={{ fontSize: '14px' }}>Activity Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={{ fontSize: '14px' }}>Select Room:</label>
              <select name="roomId" value={formData.roomId} onChange={handleChange} style={styles.input} required>
                <option value="">-- Choose a Room --</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>{room.roomNumber}</option>
                ))}
              </select>
            </div>

            <div style={styles.col}>
              <label style={{ fontSize: '14px' }}>Select Faculty:</label>
              <select name="facultyId" value={formData.facultyId} onChange={handleChange} style={styles.input} required>
                <option value="">-- Choose Faculty --</option>
                {faculty.map(fac => (
                  <option key={fac._id} value={fac._id}>{fac.email.split('@')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={{ fontSize: '14px' }}>Day of Week:</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} style={styles.input}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={{ fontSize: '14px' }}>Start Time:</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.col}>
              <label style={{ fontSize: '14px' }}>End Time:</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={{ fontSize: '14px' }}>Affected Batches (comma separated):</label>
            <input type="text" name="batches" value={formData.batches} onChange={handleChange} style={styles.input} placeholder="e.g., 2C51, 2C52" required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button type="submit" style={styles.button}>Check Availability</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;