import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api';

function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showOutdated, setShowOutdated] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      const response = await apiFetch(`/api/auth/notifications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications(current => current.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllOutdated = async () => {
    if (!window.confirm('Are you sure you want to remove all outdated notifications?')) {
      return;
    }
    setIsClearing(true);
    try {
      const response = await apiFetch(`/api/auth/notifications/user/${userId}/outdated`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications(current => current.filter(n => !n.isOutdated));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  const outdatedCount = notifications.filter(n => n.isOutdated).length;
  const visibleNotifications = showOutdated 
    ? notifications 
    : notifications.filter(n => !n.isOutdated);
  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  return (
    <div style={{ border: '1px solid #dce7ff', borderRadius: '14px', padding: '18px', backgroundColor: 'rgba(255,255,255,0.96)', marginBottom: '20px', boxShadow: '0 6px 18px rgba(20, 32, 92, 0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div>
          <p style={{ margin: 0, color: '#71859b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Updates</p>
          <h3 style={{ margin: '3px 0 0', color: '#1800ad' }}>
            Notifications
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {unreadCount > 0 && (
            <span style={{ backgroundColor: '#e53e3e', color: 'white', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {outdatedCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px', color: '#475569' }}>
          <span>
            {showOutdated ? 'Showing all notifications (including outdated)' : `Outdated notifications turned off (${outdatedCount} hidden)`}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => setShowOutdated(prev => !prev)}
              style={{ background: 'none', border: 'none', color: '#0066cc', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '12px' }}
            >
              {showOutdated ? 'Hide Outdated' : 'View Outdated'}
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={clearAllOutdated}
              disabled={isClearing}
              style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '12px' }}
            >
              {isClearing ? 'Clearing...' : 'Clear All Outdated'}
            </button>
          </div>
        </div>
      )}

      {visibleNotifications.length > 0 && (
        <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '13px' }}>
          New room bookings and schedule changes for you.
        </p>
      )}
      
      {visibleNotifications.length === 0 ? (
        <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px' }}>
          {outdatedCount > 0 
            ? 'All current notifications are caught up (outdated notifications are hidden).' 
            : 'You are all caught up. New announcements will appear here.'}
        </div>
      ) : (
        <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '3px' }}>
          {visibleNotifications.map(n => (
            <div 
              key={n._id} 
              onClick={() => !n.read && markAsRead(n._id)} 
              style={{ 
                position: 'relative',
                display: 'flex', 
                gap: '11px', 
                padding: '12px', 
                paddingRight: '36px',
                borderRadius: '10px', 
                border: `1px solid ${n.read ? '#e2e8f0' : '#fed7d7'}`, 
                backgroundColor: n.read ? '#f8fafc' : '#fff7f7', 
                opacity: n.isOutdated ? 0.7 : 1,
                cursor: n.read ? 'default' : 'pointer', 
                fontSize: '14px',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ 
                flex: '0 0 28px', 
                width: '28px', 
                height: '28px', 
                display: 'grid', 
                placeItems: 'center', 
                borderRadius: '50%', 
                backgroundColor: n.read ? '#e2e8f0' : '#fee2e2', 
                color: n.read ? '#64748b' : '#c53030', 
                fontWeight: '800' 
              }}>
                i
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: '0 0 5px', color: '#1e293b', lineHeight: 1.45 }}>{n.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <small style={{ color: '#64748b' }}>{new Date(n.date).toLocaleString()}</small>
                  {n.isOutdated && (
                    <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                      Outdated
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => deleteNotification(e, n._id)}
                title="Dismiss notification"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  lineHeight: '1',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#dc2626'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
