import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FacultyHistory() {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id || user._id) {
      fetch(`http://localhost:3000/api/availability/my-requests/${user.id || user._id}`)
        .then(res => res.json())
        .then(data => setMyRequests(data))
        .catch(err => console.error(err));
    }
  }, []);

  return (
    <main className="pageContainer">
      <section className="intro">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/faculty')} 
            style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
          >
            ←
          </button>
          <div>
            <p className="eyebrow">REQUEST HISTORY</p>
            <h1 style={{ margin: '5px 0' }}>All Previous Requests</h1>
          </div>
        </div>
        <p className="introText" style={{ marginLeft: '65px' }}>
          A complete log of all your submitted venue requests sorted by time.
        </p>
      </section>

      <div style={{ maxWidth: '800px', margin: '40px auto 0' }}>
        {myRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fcfdff', border: '1px solid #dce7ff', borderRadius: '8px' }}>
            <h3 style={{ color: '#5e7590' }}>No request history found.</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {myRequests.map(req => (
              <div key={req._id} style={{ border: '1px solid #dce7ff', padding: '25px', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#14205c', fontSize: '20px' }}>{req.title}</h3>
                  <span style={{ 
                    fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '15px',
                    backgroundColor: req.status === 'Approved' ? '#d4edda' : req.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                    color: req.status === 'Approved' ? '#155724' : req.status === 'Rejected' ? '#721c24' : '#856404'
                  }}>
                    {req.status}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#71859b', fontWeight: 'bold', textTransform: 'uppercase' }}>Requested Venue</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#14205c' }}>{req.requestedRoom?.roomNumber || 'Unknown'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#71859b', fontWeight: 'bold', textTransform: 'uppercase' }}>Date & Time</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#14205c' }}>{req.dayOfWeek} | {req.startTime} - {req.endTime}</p>
                  </div>
                </div>

                {req.adminRemarks && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', borderLeft: '4px solid #ced4da' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#495057' }}><strong>Admin Remarks:</strong> {req.adminRemarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default FacultyHistory;
