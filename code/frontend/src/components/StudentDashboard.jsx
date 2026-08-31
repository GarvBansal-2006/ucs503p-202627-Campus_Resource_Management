import { useState, useEffect } from 'react';

function StudentDashboard() {
  const [currentDay, setCurrentDay] = useState('');
  const [todaySchedule, setTodaySchedule] = useState([]);

  const weeklySchedule = {
    Monday: [
      { id: 1, title: 'Image Processing', room: 'IS2(L409)', time: '08:00 - 09:40', type: 'Practical' },
      { id: 2, title: 'Enterprise Web Application', room: 'LT303', time: '09:40 - 10:30', type: 'Lecture' },
      { id: 3, title: 'Ethics And Risk Mitigation In AI', room: 'LT303', time: '10:30 - 11:20', type: 'Lecture' }
    ],
    Tuesday: [
      { id: 4, title: 'Software Engineering', room: 'SE2(L105)', time: '08:00 - 09:40', type: 'Practical' },
      { id: 5, title: 'Image Processing', room: 'LT302', time: '09:40 - 10:30', type: 'Lecture' },
      { id: 6, title: 'Computer Architecture', room: 'LT302', time: '10:30 - 11:20', type: 'Lecture' },
      { id: 7, title: 'Machine Learning', room: 'LT302', time: '11:20 - 12:10', type: 'Lecture' },
      { id: 8, title: 'Enterprise Web Application', room: 'LT302', time: '12:10 - 13:00', type: 'Lecture' },
      { id: 9, title: 'Ethics And Risk Mitigation In AI', room: 'LT401', time: '15:30 - 16:20', type: 'Lecture' },
      { id: 10, title: 'Software Engineering', room: 'LT302', time: '16:20 - 17:10', type: 'Lecture' }
    ],
    Wednesday: [
      { id: 11, title: 'Machine Learning', room: 'LT403', time: '13:00 - 13:50', type: 'Lecture' },
      { id: 12, title: 'Software Engineering', room: 'LT403', time: '13:50 - 14:40', type: 'Lecture' },
      { id: 13, title: 'Computer Architecture', room: 'LT403', time: '14:40 - 15:30', type: 'Lecture' },
      { id: 14, title: 'Machine Learning', room: 'AI(L307)', time: '15:30 - 17:10', type: 'Practical' }
    ],
    Thursday: [
      { id: 15, title: 'Computer Architecture', room: 'LT302', time: '10:30 - 11:20', type: 'Lecture' },
      { id: 16, title: 'Conversational AI', room: 'LT101', time: '11:20 - 13:00', type: 'Lecture' },
      { id: 17, title: 'Software Engineering', room: 'LP104', time: '13:50 - 14:40', type: 'Lecture' },
      { id: 18, title: 'Image Processing', room: 'LP104', time: '14:40 - 15:30', type: 'Lecture' }
    ],
    Friday: [
      { id: 19, title: 'Enterprise Web Application', room: 'NS1(L102)', time: '08:00 - 09:40', type: 'Practical' },
      { id: 20, title: 'Ethics And Risk Mitigation In AI', room: 'LT402', time: '11:20 - 12:10', type: 'Lecture' },
      { id: 21, title: 'Machine Learning', room: 'LT402', time: '12:10 - 13:00', type: 'Lecture' },
      { id: 22, title: 'Conversational AI', room: 'LP108', time: '13:50 - 15:30', type: 'Practical' },
      { id: 23, title: 'Image Processing', room: 'LT401', time: '15:30 - 16:20', type: 'Lecture' },
      { id: 24, title: 'Enterprise Web Application', room: 'LT402', time: '16:20 - 17:10', type: 'Lecture' }
    ]
  };

  useEffect(() => {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setCurrentDay(dayOfWeek);
    setTodaySchedule(weeklySchedule[dayOfWeek] || []);
  }, []);

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
    header: { borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' },
    card: { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tag: { padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#e6f2ff', color: '#0066cc' },
    practicalTag: { backgroundColor: '#e6ffe6', color: '#008000' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px' }
  };

  const getTagStyle = (type) => {
    if (type === 'Practical') return { ...styles.tag, ...styles.practicalTag };
    return styles.tag;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Thapar Institute - Student Portal</h2>
        <p style={{ color: '#666' }}>Academic Schedule for Batch 3C54</p>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '15px' }}>{currentDay}'s Activities</h3>
        
        {todaySchedule.length > 0 ? (
          todaySchedule.map(item => (
            <div key={item.id} style={styles.card}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{item.title}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  {item.time} | Venue: {item.room}
                </p>
              </div>
              <span style={getTagStyle(item.type)}>{item.type.toUpperCase()}</span>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <h4>No classes scheduled today!</h4>
            <p>Enjoy your weekend or free day.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;