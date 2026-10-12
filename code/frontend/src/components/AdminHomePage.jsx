import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminHomePage(){
    const navigate = useNavigate();
    const [modalType, setModalType] = useState(null);
    const [modalData, setModalData] = useState([]);
    
    const [stats, setStats] = useState({
        venues: 0,
        conflicts: 0,
        pending: 0,
        events: 0
    });

    useEffect(() => {
        fetch('http://localhost:3000/api/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    
    const fetchTodayEvents = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/schedule/today');
            const data = await res.json();
            setModalData(data);
            setModalType('events');
        } catch (err) { console.error(err); }
    };

    const fetchVenues = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/metadata');
            const data = await res.json();
            setModalData(data.rooms);
            setModalType('venues');
        } catch (err) { console.error(err); }
    };

    const styles = {
        button: {
            cursor: 'pointer',
            padding: '15px 30px',
            borderRadius: '12px',
            backgroundColor: 'white',   
            fontSize: '16px',
            color: '#0f2541',
            border: '1px solid rgba(134, 176, 211, 0.55)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            fontWeight: 'bold',
            alignSelf: 'flex-end'
        }
    };

    return(
       <div className="adminPage">
            <div className="sideBar">
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/booking">Venue Booking</Link>
                <Link to="/admin/schedule">View Schedule</Link>
                <Link to="#">Exam Scheduling</Link>
                <Link to="#">Calendar</Link>
                <Link to="#">Settings</Link>
            </div> 

            <div className="adminContent">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Welcome, Admin</h2>
                        <p>Here's what's happening across Campus.</p>
                    </div>
                    <button style={styles.button} onClick={() => navigate('/admin')}>
                        Go to dashboard
                    </button>
                </div>

                <div className ="widgets">
                    <div className="widgetOne" style={{cursor: "pointer"}} onClick={fetchVenues}> 
                        <h2>Available Venues</h2> 
                        <h2 className="widgetContent">{stats.venues}</h2>
                    </div>
                    <div className ="widgetOne"> 
                        <h2>Ongoing Conflicts</h2>
                        <h2 className="widgetContent">{stats.conflicts}</h2> 
                    </div>
                    <div className ="widgetOne">  
                        <h2>Pending requests</h2> 
                        <h2 className="widgetContent">{stats.pending}</h2> 
                    </div>
                    <div className="widgetOne" style={{cursor: "pointer"}} onClick={fetchTodayEvents}> 
                        <h2>Today's events</h2>
                        <h2 className="widgetContent">{stats.events}</h2>  
                    </div>
                </div>
            
                <div className="quickActions"> 
                    <div id="header"><h2>Quick Actions</h2></div>
                    <div className="quickActionsGrid">
                        <Link className="quickActionsWidget" to="/admin/requests"><h2>See pending requests</h2></Link>
                        <Link className="quickActionsWidget" to="/admin/schedule"><h2>See today's schedule</h2></Link>
                        <Link className="quickActionsWidget" to="/admin/booking"><h2>Find a Venue</h2></Link>
                        <Link className="quickActionsWidget" to="#"><h2>View Conflicts</h2></Link>
                    </div>
                </div>
            </div>

                {modalType && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div style={{
                            backgroundColor: '#fff', padding: '30px', borderRadius: '12px',
                            width: '600px', maxHeight: '80vh', overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2>{modalType === 'events' ? "Today's Schedule" : "Venues List"}</h2>
                                <button onClick={() => setModalType(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>&times;</button>
                            </div>
                            
                            {modalType === 'events' ? (
                                modalData.length === 0 ? <p>No events today.</p> :
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {modalData.map(ev => (
                                        <div key={ev._id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                            <strong>{ev.title}</strong>
                                            <p style={{ margin: '5px 0 0 0' }}>Time: {ev.startTime} - {ev.endTime}</p>
                                            <p style={{ margin: '5px 0 0 0' }}>Room: {ev.requestedRoom?.roomNumber || 'TBD'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {modalData.map(room => (
                                        <div key={room._id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                            <strong style={{ fontSize: '18px' }}>{room.roomNumber}</strong>
                                            <p style={{ margin: '5px 0 0 0', color: '#5e7590' }}>Capacity: {room.capacity}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
       </div>
    );
}

export default AdminHomePage;

