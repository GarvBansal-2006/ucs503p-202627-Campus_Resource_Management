import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminBooking() {
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState({ rooms: [], faculty: [] });
  const [modalConfig, setModalConfig] = useState(null);
  const [selectedShiftRoom, setSelectedShiftRoom] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    roomId: '',
    facultyId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    batches: ''
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/metadata')
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    if (dateStr) {
      const d = new Date(dateStr);
      const day = d.toLocaleDateString('en-US', { weekday: 'long' });
      setFormData({ ...formData, dayOfWeek: day });
    }
  };

  
  const today = new Date().toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 60);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const checkRes = await fetch('http://localhost:3000/api/admin/check-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await checkRes.json();
      
      if (data.safe) {
        await fetch('http://localhost:3000/api/admin/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        alert('Venue booked successfully!');
        navigate('/adminHomePage');
      } else {
        setModalConfig({
          type: 'conflict',
          title: '❌ CONFLICT DETECTED',
          conflicts: data.conflicts
        });
        setSelectedShiftRoom('');
      }
    } catch (err) {
      console.error(err);
      alert('Error booking venue');
    }
  };

  const handleResolveConflict = async (action) => {
    if (action === 'shift' && !selectedShiftRoom) {
      alert("Please select an alternate room first.");
      return;
    }

    try {
      const conflictIds = modalConfig.conflicts.map(c => c._id);
      const response = await fetch('http://localhost:3000/api/admin/force-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          conflictIds, 
          newRoomId: selectedShiftRoom,
          newActivityData: formData
        })
      });
      
      if (response.ok) {
        setModalConfig(null);
        alert('Conflicts resolved and venue booked successfully!');
        navigate('/adminHomePage');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="adminPage">
      <div className="sideBar">
        <Link to="/adminHomePage">Home</Link>
        <Link to="/admin/booking">Venue Booking</Link>
        <Link to="#">Exam Scheduling</Link>
        <Link to="#">Calendar</Link>
        <Link to="#">Settings</Link>
      </div> 
      <div className="adminContent">
        <h2 style={{ color: '#1800ad', marginBottom: '5px' }}>Book a Venue (Admin)</h2>
        <p style={{ color: '#5e7590', marginTop: 0, marginBottom: '20px' }}>
          Schedule an event directly. If conflicts are found, you can resolve them instantly.
        </p>

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #dce7ff', maxWidth: '600px' }}>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>EVENT TITLE</label>
            <input type="text" id="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>VENUE</label>
              <select id="roomId" value={formData.roomId} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">Select Venue...</option>
                {metadata.rooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>FACULTY ASSIGNED</label>
              <select id="facultyId" value={formData.facultyId} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                <option value="">Select Faculty...</option>
                {metadata.faculty.map(f => <option key={f._id} value={f._id}>{f.email}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>DATE</label>
              <input type="date" min={today} max={maxDate} onChange={handleDateChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>DAY OF WEEK</label>
              <input type="text" value={formData.dayOfWeek} disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#eee' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>START TIME</label>
              <input type="time" id="startTime" value={formData.startTime} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#5e7590', marginBottom: '5px' }}>END TIME</label>
              <input type="time" id="endTime" value={formData.endTime} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
            CHECK AVAILABILITY & BOOK
          </button>
        </form>
      </div>

      {modalConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#dc3545', textAlign: 'center' }}>
              {modalConfig.title}
            </h2>
            
            <p style={{ color: '#5e7590', fontWeight: 'bold', marginBottom: '10px' }}>This venue is already occupied by:</p>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#fafafa', marginBottom: '20px' }}>
              {modalConfig.conflicts.map((c, idx) => (
                <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <strong>{c.title}</strong> ({c.startTime} - {c.endTime})<br />
                  <span style={{ fontSize: '13px', color: '#666' }}>Faculty: {c.faculty?.email}</span><br />
                  <span style={{ fontSize: '13px', color: '#666' }}>Batches: {c.affectedBatches?.join(', ') || 'N/A'}</span>
                </div>
              ))}
            </div>
            
            <h4 style={{ margin: '0 0 10px 0', color: '#14205c' }}>Force Approval Options:</h4>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
              Choose an action below. The affected faculty and students will automatically receive a notification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => handleResolveConflict('cancel')}
                style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel Existing Class & Book
              </button>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={selectedShiftRoom}
                  onChange={(e) => setSelectedShiftRoom(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                  <option value="">Select Alternate Venue...</option>
                  {metadata.rooms.map(room => (
                    <option key={room._id} value={room._id}>{room.roomNumber}</option>
                  ))}
                </select>
                <button 
                  onClick={() => handleResolveConflict('shift')}
                  style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Shift & Book
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setModalConfig(null)}
                style={{ padding: '8px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Close Without Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBooking;
