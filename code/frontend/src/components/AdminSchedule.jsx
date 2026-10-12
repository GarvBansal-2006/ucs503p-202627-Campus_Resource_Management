import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminSchedule() {
  const [schedule, setSchedule] = useState([]);
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const [dateList] = useState(generateDates());
  const [selectedDateStr, setSelectedDateStr] = useState(dateList[0].toDateString());
  const selectedDateObj = new Date(selectedDateStr);
  const selectedDay = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const handleDateClick = (e, dateStr) => {
    setSelectedDateStr(dateStr);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };
    const [filterBlock, setFilterBlock] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventStudents, setEventStudents] = useState([]);
  const [metadata, setMetadata] = useState({ rooms: [] });
  const [selectedShiftRoom, setSelectedShiftRoom] = useState('');

  const getAvailableRooms = () => {
    if (!selectedEvent) return [];
    
    const parseTime = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const sStart = parseTime(selectedEvent.startTime);
    const sEnd = parseTime(selectedEvent.endTime);

    const occupiedRoomIds = new Set();
    schedule.forEach(item => {
      if (item._id === selectedEvent._id) return;
      if (item.status !== 'Approved') return;
      if (!item.requestedRoom) return;

      const iStart = parseTime(item.startTime);
      const iEnd = parseTime(item.endTime);

      if (iStart < sEnd && iEnd > sStart) {
        occupiedRoomIds.add(item.requestedRoom._id || item.requestedRoom);
      }
    });

    return metadata.rooms.filter(r => !occupiedRoomIds.has(r._id));
  };

  const availableRooms = getAvailableRooms();


  
  useEffect(() => {
    fetchSchedule(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/metadata')
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error(err));
  }, []);


  useEffect(() => {
    if (selectedEvent && selectedEvent.affectedBatches && selectedEvent.affectedBatches.length > 0) {
      fetch('http://localhost:3000/api/admin/students-by-batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batches: selectedEvent.affectedBatches })
      })
      .then(res => res.json())
      .then(data => setEventStudents(data))
      .catch(err => console.error(err));
    } else {
      setEventStudents([]);
    }
  }, [selectedEvent]);


  const fetchSchedule = async (day) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/schedule/day/${day}`);
      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSchedule = schedule.filter(item => {
    if (filterBlock === 'All') return true;
    const rn = item.requestedRoom?.roomNumber || '';
    if (filterBlock === 'LP Block' && rn.startsWith('LP')) return true;
    if (filterBlock === 'LT Block' && rn.startsWith('LT')) return true;
    if (filterBlock === 'CSED Building' && rn.startsWith('L') && !rn.startsWith('LP') && !rn.startsWith('LT')) return true;
    return false;
  });

  
  const handleAction = async (action) => {
    if (action === 'shift' && !selectedShiftRoom) {
      alert("Please select an alternate room first.");
      return;
    }
    if (!window.confirm(`Are you sure you want to ${action} this activity? Notifications will be sent.`)) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/activity/${selectedEvent._id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, newRoomId: selectedShiftRoom })
      });
      if (response.ok) {
        alert('Activity updated successfully!');
        setSelectedEvent(null);
        fetchSchedule(selectedDay);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="adminPage">
      <div className="sideBar">
        <Link to="/adminHomePage">Home</Link>
        <Link to="/admin/requests">Pending Requests</Link>
        <Link to="/admin/booking">Venue Booking</Link>
        <Link to="/admin/schedule">View Schedule</Link>
        <Link to="#">Settings</Link>
      </div> 
      <div className="adminContent" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", overflow: "hidden", boxSizing: "border-box", gap: 0 }}>
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <h2 style={{ color: '#1800ad', marginBottom: '5px' }}>Approved Venue Schedule</h2>
        <p style={{ color: '#5e7590', marginTop: 0, marginBottom: '20px' }}>Select a day to view the confirmed timetable across the campus.</p>
        
        <div style={{ maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <div className="hide-scroll" style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
          {dateList.map(d => {
            const isSelected = d.toDateString() === selectedDateStr;
            const fullDayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <button
                key={d.toDateString()}
                onClick={(e) => handleDateClick(e, d.toDateString())}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  backgroundColor: isSelected ? '#007bff' : '#e5f4ff',
                  color: isSelected ? 'white' : '#1800ad',
                  whiteSpace: 'nowrap'
                }}
              >
                {fullDayName}, {monthDay}
              </button>
            )
          })}
        </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#14205c' }}>{selectedDay}'s Classes <span style={{fontSize: '14px', color: '#64748b', fontWeight: 'normal'}}>({selectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span></h3>
          
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '8px' }}>
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
                  color: filterBlock === block ? 'white' : '#5e7590'
                }}
              >
                {block}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', paddingBottom: '20px' }}>
        {filteredSchedule.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>No approved activities found for {selectedDay} in {filterBlock}.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {filteredSchedule.map(item => (
              <button 
                key={item._id} 
                onClick={() => { setSelectedEvent(item); setSelectedShiftRoom(''); }}
                style={{ 
                  border: '1px solid #dce7ff', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  backgroundColor: 'white', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#1800ad', fontSize: '16px' }}>{item.title}</h4>
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <p style={{ margin: 0 }}><strong>Venue:</strong> <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{item.requestedRoom?.roomNumber || 'TBD'}</span></p>
                  <p style={{ margin: 0 }}><strong>Time:</strong> {item.startTime} - {item.endTime}</p>
                  <p style={{ margin: 0 }}><strong>Faculty:</strong> {item.faculty?.email}</p>
                  <p style={{ margin: 0 }}><strong>Batches:</strong> {item.affectedBatches && item.affectedBatches.length > 0 ? item.affectedBatches.join(', ') : 'N/A'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>

      {selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '800px', maxWidth: '95%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1800ad' }}>{selectedEvent.title}</h2>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>{selectedEvent.dayOfWeek} | {selectedEvent.startTime} - {selectedEvent.endTime}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>VENUE</span>
                    <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#334155', fontWeight: 'bold' }}>{selectedEvent.requestedRoom?.roomNumber || 'TBD'}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>ASSIGNED FACULTY</span>
                    <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#334155', fontWeight: 'bold' }}>{selectedEvent.faculty?.email || 'Unknown'}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>ATTENDING BATCHES</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                    {selectedEvent.affectedBatches && selectedEvent.affectedBatches.length > 0 ? (
                      selectedEvent.affectedBatches.map(b => (
                        <span key={b} style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: 'bold' }}>{b}</span>
                      ))
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>No specific batches assigned</span>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: 'auto' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>Admin Override</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>If this venue is under maintenance, you can shift or cancel the event. Notifications will be sent automatically.</p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select 
                      value={selectedShiftRoom} 
                      onChange={(e) => setSelectedShiftRoom(e.target.value)}
                      style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                      <option value="">Select Alternate Room...</option>
                      {availableRooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber} (Cap: {r.capacity})</option>)}
                    </select>
                    <button 
                      onClick={() => handleAction('shift')}
                      style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Shift Venue
                    </button>
                  </div>

                  <button 
                    onClick={() => handleAction('cancel')}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Cancel Activity Completely
                  </button>
                </div>
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>STUDENTS LIST ({eventStudents.length})</span>
                </div>
                
                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {eventStudents.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                      {selectedEvent.affectedBatches?.length > 0 ? 'Loading students...' : 'No students found.'}
                    </div>
                  ) : (
                    <ul style={{ margin: 0, padding: '0', listStyle: 'none', overflowY: 'auto', maxHeight: '350px' }}>
                      {eventStudents.map((stu, index) => (
                        <li key={stu._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderBottom: index === eventStudents.length - 1 ? 'none' : '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? 'white' : 'transparent' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '14px' }}>{stu.name}</span>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>{stu.email}</span>
                          </div>
                          <span style={{ backgroundColor: '#e5f4ff', color: '#1800ad', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', alignSelf: 'center' }}>
                            {stu.batch}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminSchedule;
