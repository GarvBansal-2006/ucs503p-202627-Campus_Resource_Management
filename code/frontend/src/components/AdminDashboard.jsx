import React from 'react';
import { useState } from 'react';

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

  const mockRooms = [
    { id: '1', name: 'G-101 (Lecture Hall)' },
    { id: '2', name: 'Computer Lab 3' }
  ]; 
  
  const mockFaculty = [
    { id: '101', name: 'Dr. Sharma' },
    { id: '102', name: 'Prof. Gupta' }
  ]; 

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(function(prevState) {
    return {
        ...prevState,
        [name]: value
    };
}); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Scheduling new activity:", formData);
    alert(`Attempting to schedule ${formData.title} for batch ${formData.batches}!`);
  };

  const styles = {
    container: { border: '1px solid rgba(42, 165, 242, 0.61)' , maxWidth:'650px' , padding: '40px', borderRadius: '5px' ,backgroundColor: 'rgba(255, 255, 255, 0.85)', marginLeft: '20%' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
    dayOfWeek: { padding: '8px', fontSize: '16px', marginTop: '5px', width: '260px', backgroundColor: '#dcf2ff61', border: '1px solid rgba(42, 165, 242, 0.61)', borderRadius: '5px'},
    input: { padding: '8px', fontSize: '16px', marginTop: '5px', backgroundColor: '#dcf2ff61', border: '1px solid rgba(42, 165, 242, 0.61)', borderRadius: '5px'},
    dropDownContainer: {display: 'flex', flexDirection: 'row', gap: '26px' ,padding: '20px', marginLeft: '-19px'},
    dropDown: {padding: '8px', fontSize: '14px', marginTop: '5px', width: '185px',backgroundColor: '#dcf2ff61',border: '1px solid rgba(42, 165, 242, 0.61)', borderRadius: '5px'},
    button: { padding: '10px 15px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }
  };

  return (
    <div className="adminPage">
    <div className="sideBar">
       <a href="/adminHomePage">Home</a>
        <a href="/">Venue Booking</a>
         <a href="#">Exam Scheduling</a>
          <a href="#">Calendar</a>
           <a href="#">Settings</a>
    </div>
    <div className="adminContent">
      <h2>Create New Activity</h2>
      <p>Schedule a class, lab, placement test, or other campus activity.<br/></p>
      <form style = {styles.container} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Activity Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
        </div>

        <div style={styles.dropDownContainer}>
          <div className = "roomDropDown"><label>Select Room:</label>
          <select name="roomId" value={formData.roomId} onChange={handleChange} style ={styles.dropDown} required>
            <option value="">-- Choose a Room --</option>
            {mockRooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div className = "facultyDropDown"><label>Select Faculty:</label>
          <select name="facultyId" value={formData.facultyId} onChange={handleChange} style ={styles.dropDown} required>
            <option value="">-- Choose Faculty --</option>
            {mockFaculty.map(faculty => (
              <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
            ))}
          </select>
        </div>
      </div>

        <div>
          <label>Day of Week: &emsp;&ensp; &ensp;  </label>
          <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} style ={styles.dayOfWeek}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>Start Time:</label>
            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label>End Time:</label>
            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} style={styles.input} required />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label>Affected Batches (comma separated):</label>
          <input type="text" name="batches" value={formData.batches} onChange={handleChange} style={styles.input} placeholder="e.g., 2C51, 2C52" required />
        </div>

        <button type="submit" style={styles.button}>Check Availability</button>
      </form>
    </div>
    </div>
  );
}

export default AdminDashboard;