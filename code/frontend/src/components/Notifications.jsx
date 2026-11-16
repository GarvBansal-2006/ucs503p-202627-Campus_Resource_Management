import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';

function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiFetch(`/api/auth/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    fetchNotifications();
    const refreshTimer = window.setInterval(fetchNotifications, 15000);

    return () => window.clearInterval(refreshTimer);
  }, [userId, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/api/auth/notifications/${id}/read`, { method: 'POST' });
      setNotifications(current => current.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ border: '1px solid #dce7ff', borderRadius: '14px', padding: '18px', backgroundColor: 'rgba(255,255,255,0.96)', marginBottom: '20px', boxShadow: '0 6px 18px rgba(20, 32, 92, 0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div>
          <p style={{ margin: 0, color: '#71859b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Updates</p>
          <h3 style={{ margin: '3px 0 0', color: '#1800ad' }}>
            Notifications
          </h3>
        </div>
        {unreadCount > 0 && <span style={{ backgroundColor: '#e53e3e', color: 'white', padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>{unreadCount} new</span>}
      </div>
      {notifications.length > 0 && <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '13px' }}>New room bookings and schedule changes for you.</p>}
      
      {notifications.length === 0 ? (
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
          You are all caught up. New announcements will appear here.
        </div>
      ) : (
        <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '3px' }}>
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.read && markAsRead(n._id)} style={{ display: 'flex', gap: '11px', padding: '12px', borderRadius: '10px', border: `1px solid ${n.read ? '#e2e8f0' : '#fed7d7'}`, backgroundColor: n.read ? '#f8fafc' : '#fff7f7', cursor: n.read ? 'default' : 'pointer', fontSize: '14px' }}>
              <div style={{ flex: '0 0 28px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: n.read ? '#e2e8f0' : '#fee2e2', color: n.read ? '#64748b' : '#c53030', fontWeight: '800' }}>i</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 5px', color: '#1e293b', lineHeight: 1.45 }}>{n.message}</p>
                <small style={{ color: '#64748b' }}>{new Date(n.date).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
