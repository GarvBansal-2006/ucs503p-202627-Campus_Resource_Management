import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { addDaysAsDateInput, formatDateInput, getDayOfWeekFromDate } from '../dateUtils';
import BatchSelector from './BatchSelector';
import FeedbackModal from './FeedbackModal';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    title: 'DBMS Lab',
    roomId: '',
    facultyId: '',
    date: '',
    dayOfWeek: '',
    startTime: '14:00', 
    endTime: '16:00',  
    batches: []
  });  

  const [rooms, setRooms] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [batches, setBatches] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    apiFetch('/api/admin/metadata')
      .then(res => res.json())
      .then(data => {
        setRooms(data.rooms);
        setFaculty(data.faculty);
        setBatches(data.batches || []);
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

  const handleDateChange = (e) => {
    const date = e.target.value;

    setFormData(prevState => ({
      ...prevState,
      date,
      dayOfWeek: date ? getDayOfWeekFromDate(date) : ''
    }));
  };

  const today = formatDateInput();
  const maxDate = addDaysAsDateInput(60);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.batches.length === 0) {
      setFeedback({ variant: 'error', title: 'Select a batch', message: 'Choose at least one batch before scheduling this activity.' });
      return;
    }

    try {
      const response = await apiFetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFeedback({ variant: 'success', title: 'Activity scheduled', message: 'Students from the selected batches and the assigned faculty member have been notified.' });
      } else {
        setFeedback({ variant: 'error', title: 'Unable to schedule activity', message: data.error || 'Please review the activity details and try again.' });
      }
    } catch (err) {
      setFeedback({ variant: 'error', title: 'Connection problem', message: 'The activity could not be scheduled. Please check that the backend is running and try again.' });
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

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={{ fontSize: '14px' }}>Activity Date:</label>
              <input type="date" name="date" value={formData.date} min={today} max={maxDate} onChange={handleDateChange} style={styles.input} required />
            </div>
            <div style={styles.col}>
              <label style={{ fontSize: '14px' }}>Day of Week:</label>
              <input type="text" value={formData.dayOfWeek} style={{ ...styles.input, backgroundColor: '#e2e8f0' }} readOnly />
            </div>
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
            <label style={{ fontSize: '14px' }}>Affected Batches:</label>
            <BatchSelector
              batches={batches}
              selectedBatches={formData.batches}
              onChange={selectedBatches => setFormData(prevState => ({ ...prevState, batches: selectedBatches }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button type="submit" style={styles.button}>Check Availability</button>
          </div>
        </form>
      </div>
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
    </div>
  );
}

export default AdminDashboard;
