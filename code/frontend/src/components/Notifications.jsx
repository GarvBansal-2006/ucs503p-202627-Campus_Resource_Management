import React, { useState, useEffect } from 'react';

function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/auth/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const unique = [];
        const seen = new Set();
        for (const n of data) {
           if (!seen.has(n.message)) {
               seen.add(n.message);
               unique.push(n);
           }
        }
        setNotifications(unique);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/auth/notifications/${id}/read`, { method: 'POST' });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#1800ad' }}>
        Notifications {unreadCount > 0 && <span style={{ backgroundColor: 'red', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{unreadCount} New</span>}
      </h3>
      
      {notifications.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>No notifications.</p>
      ) : (
        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.read && markAsRead(n._id)} style={{ padding: '10px', borderRadius: '5px', borderLeft: n.read ? '4px solid #ccc' : '4px solid #dc3545', backgroundColor: n.read ? '#f9f9f9' : '#fff3f3', cursor: n.read ? 'default' : 'pointer', fontSize: '14px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#333' }}>{n.message}</p>
              <small style={{ color: '#888' }}>{new Date(n.date).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
