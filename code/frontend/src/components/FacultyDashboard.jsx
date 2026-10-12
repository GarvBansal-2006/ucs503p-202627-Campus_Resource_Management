import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';

function FacultyDashboard() {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [metadata, setMetadata] = useState({ rooms: [] });

  const [formData, setFormData] = useState({
    roomNumber: '',
    activityType: '',
    requirements: '',
    capacity: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/metadata')
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error(err));

    if (user.id || user._id) {
      fetch(`http://localhost:3000/api/availability/my-requests/${user.id || user._id}`)
        .then(res => res.json())
        .then(data => setMyRequests(data))
        .catch(err => console.error(err));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  
  const today = new Date().toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 60);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      navigate('/recommendations', { 
        state: { request: formData, result: data } 
      });

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to server.");
    }
  };

  return (
    
    
    <main style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#1800ad', margin: '0 0 10px 0' }}>Book a Room</h1>
        <p style={{ color: '#5e7590', margin: 0 }}>
          Submit your venue requirements and check availability for your activity.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px' }}>
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #dce7ff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>ACTIVITY TYPE</label>
              <input type="text" id="activityType" value={formData.activityType} onChange={handleChange} placeholder="Lecture, placement examination..." required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>ROOM / VENUE</label>
                <select id="roomNumber" value={formData.roomNumber} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                  <option value="">Select Venue...</option>
                  {metadata.rooms.map(r => <option key={r._id} value={r.roomNumber}>{r.roomNumber}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>DATE</label>
                <input type="date" id="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>START TIME</label>
                <input type="time" id="startTime" value={formData.startTime} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>END TIME</label>
                <input type="time" id="endTime" value={formData.endTime} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>REQUIRED FACILITIES</label>
                <input type="text" id="requirements" value={formData.requirements} onChange={handleChange} placeholder="Projector, microphones..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>REQUIRED CAPACITY</label>
                <input type="number" id="capacity" value={formData.capacity} onChange={handleChange} placeholder="Number of students" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
              CHECK AVAILABILITY & BOOK
            </button>
          </form>
        </div>
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Notifications userId={user.id || user._id} />

          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #dce7ff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1800ad', margin: '0 0 15px 0' }}>📋 My Pending Requests</h2>
            {myRequests.filter(req => req.status === 'Pending').length === 0 ? (
              <p style={{ color: '#71859b', fontStyle: 'italic', margin: 0 }}>No pending requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '350px', overflowY: 'auto' }}>
                {myRequests.filter(req => req.status === 'Pending').map(req => (
                  <div key={req._id} style={{ border: '1px solid #dce7ff', padding: '15px', borderRadius: '8px', backgroundColor: '#fcfdff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, color: '#14205c' }}>{req.title}</h4>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#fff3cd', color: '#856404' }}>
                        Pending
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#5e7590' }}>Room: {req.requestedRoom?.roomNumber || 'Unknown'}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#5e7590' }}>Time: {req.dayOfWeek} | {req.startTime} - {req.endTime}</p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={() => navigate('/faculty/history')}
                style={{ backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              >
                See previous requests →
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>


  );
}

export default FacultyDashboard;
