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
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Scheduling new activity:", formData);
    alert(`Attempting to schedule ${formData.title} for batch ${formData.batches}!`);
  };

  const styles = {
    container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
    input: { padding: '8px', fontSize: '16px', marginTop: '5px' },
    button: { padding: '10px 15px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Scheduling Dashboard</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Activity Title:</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} style={styles.input} required />
        </div>

        <div style={styles.formGroup}>
          <label>Select Room:</label>
          <select name="roomId" value={formData.roomId} onChange={handleChange} style={styles.input} required>
            <option value="">-- Choose a Room --</option>
            {mockRooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Select Faculty:</label>
          <select name="facultyId" value={formData.facultyId} onChange={handleChange} style={styles.input} required>
            <option value="">-- Choose Faculty --</option>
            {mockFaculty.map(faculty => (
              <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Day of Week:</label>
          <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} style={styles.input}>
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

        <button type="submit" style={styles.button}>Check Collisions & Schedule</button>
      </form>
    </div>
  );
}

export default AdminDashboard;