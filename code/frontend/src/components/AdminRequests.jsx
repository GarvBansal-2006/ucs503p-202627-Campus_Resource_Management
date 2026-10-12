import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [filterBlock, setFilterBlock] = useState('All');
  const [rooms, setRooms] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);
  const [selectedShiftRoom, setSelectedShiftRoom] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchSchedule();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/metadata');
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/schedule/today');
      const data = await response.json();
      setTodaySchedule(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleCheck = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/requests/${id}/check`);
      const data = await response.json();
      if (data.safe) {
        setModalConfig({
          type: 'success',
          title: '✅ Clear to Approve',
          message: 'No conflicts detected. It is safe to approve this request.'
        });
      } else {
        setModalConfig({
          type: 'conflict',
          title: '❌ CONFLICT DETECTED',
          conflicts: data.conflicts,
          requestId: id
        });
        setSelectedShiftRoom('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      if (response.ok) {
        fetchRequests(); 
        fetchSchedule();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveConflict = async (action) => {
    if (action === 'shift' && !selectedShiftRoom) {
      alert("Please select an alternate room first.");
      return;
    }

    try {
      const conflictIds = modalConfig.conflicts.map(c => c._id);
      const response = await fetch(`http://localhost:3000/api/admin/requests/${modalConfig.requestId}/resolve-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, conflictIds, newRoomId: selectedShiftRoom })
      });
      if (response.ok) {
        setModalConfig(null);
        fetchRequests();
        fetchSchedule();
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
        <h2 style={{ color: '#1800ad', marginBottom: '5px' }}>Pending Venue Requests</h2>
        <p style={{ color: '#5e7590', marginTop: 0 }}>Review and check for conflicts before approving faculty requests.</p>
        
        {requests.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#888' }}>No pending requests.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
            {requests.map(req => (
              <div key={req._id} style={{ border: '1px solid #dce7ff', padding: '15px 20px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#14205c' }}>{req.title}</h3>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#5e7590' }}>
                      <strong>Faculty:</strong> {req.faculty?.email}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#5e7590' }}>
                      <strong>Room:</strong> {req.requestedRoom?.roomNumber}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#5e7590' }}>
                      <strong>Time:</strong> {req.dayOfWeek} | {req.startTime} - {req.endTime}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button 
                      onClick={() => handleCheck(req._id)}
                      style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Check Conflicts
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                        onClick={() => handleAction(req._id, 'Approved')}
                        style={{ flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                        Approve
                        </button>
                        <button 
                        onClick={() => handleAction(req._id, 'Rejected')}
                        style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                        Reject
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        
        <div style={{ borderTop: '2px solid #e5f4ff', paddingTop: '30px', marginTop: '40px' }}>
    
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
          <div>
            <h2 style={{ color: '#1800ad', marginBottom: '5px' }}>Today's Approved Schedule</h2>
            <p style={{ color: '#5e7590', margin: 0 }}>Extra lectures and booked venues currently scheduled for today.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#e5f4ff', padding: '5px', borderRadius: '8px' }}>
            {['All', 'LT Block', 'LP Block', 'CSED Building'].map(block => (
              <button 
                key={block}
                onClick={() => setFilterBlock(block)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '5px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '13px',
                  backgroundColor: filterBlock === block ? '#007bff' : 'transparent',
                  color: filterBlock === block ? 'white' : '#1800ad'
                }}
              >
                {block}
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const filteredSchedule = todaySchedule.filter(item => {
            if (filterBlock === 'All') return true;
            const rn = item.requestedRoom?.roomNumber || '';
            if (filterBlock === 'LP Block' && rn.startsWith('LP')) return true;
            if (filterBlock === 'LT Block' && rn.startsWith('LT')) return true;
            if (filterBlock === 'CSED Building' && rn.startsWith('L') && !rn.startsWith('LP') && !rn.startsWith('LT')) return true;
            return false;
          });

          return filteredSchedule.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#888' }}>No approved activities match this filter.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {filteredSchedule.map(item => (
              <div 
                key={item._id} 
                style={{ 
                  border: '1px solid #c3e6cb', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  backgroundColor: '#d4edda',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#155724', fontSize: '16px' }}>{item.title}</h4>
                <div style={{ fontSize: '13px', color: '#155724', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <p style={{ margin: 0 }}><strong>Venue:</strong> <span style={{ fontWeight: 'bold' }}>{item.requestedRoom?.roomNumber || 'TBD'}</span></p>
                  <p style={{ margin: 0 }}><strong>Time:</strong> {item.startTime} - {item.endTime}</p>
                  <p style={{ margin: 0 }}><strong>Faculty:</strong> {item.faculty?.email}</p>
                  <p style={{ margin: 0 }}><strong>Batches:</strong> {item.affectedBatches && item.affectedBatches.length > 0 ? item.affectedBatches.join(', ') : 'N/A'}</p>
                </div>
              </div>
            ))}
            </div>
          );
        })()}
    
        </div>
      </div>

      {modalConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: modalConfig.type === 'conflict' ? '500px' : '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 15px 0', color: modalConfig.type === 'success' ? '#28a745' : '#dc3545' }}>
              {modalConfig.title}
            </h2>
            
            {modalConfig.type === 'conflict' ? (
              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <p style={{ color: '#5e7590', fontWeight: 'bold' }}>This venue is already occupied by:</p>
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
                    Cancel Existing Class & Approve
                  </button>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select 
                      value={selectedShiftRoom}
                      onChange={(e) => setSelectedShiftRoom(e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                      <option value="">Select Alternate Venue...</option>
                      {rooms.map(room => (
                        <option key={room._id} value={room._id}>{room.roomNumber}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleResolveConflict('shift')}
                      style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Shift & Approve
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button 
                    onClick={() => setModalConfig(null)}
                    style={{ padding: '8px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Close Without Approving
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={{ color: '#5e7590', marginBottom: '25px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {modalConfig.message}
                </p>
                <button 
                  onClick={() => setModalConfig(null)}
                  style={{ padding: '10px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Acknowledge
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRequests;
