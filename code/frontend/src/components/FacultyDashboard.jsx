import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FacultyDashboard() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roomNumber: '',
    activityType: '',
    requirements: '',
    capacity: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

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
    <main className="pageContainer">
      <section className="intro">
        <div>
          <p className="eyebrow">VENUE MANAGEMENT</p>
          <h1>Book a Room</h1>
          <p className="introText">
            Submit your venue requirements and check availability for your activity.
          </p>
        </div>
      </section>

      <div className="bookingLayout">
        <form className="bookingCard" onSubmit={handleSubmit}>
          <div className="cardHeader">
            <div>
              <p className="cardEyebrow">NEW REQUEST</p>
              <h2>Venue Requirements</h2>
            </div>
            <span className="stepNumber">01</span>
          </div>

          <div className="formBody">
            <div className="formGroup">
              <label htmlFor="roomNumber">ROOM / VENUE</label>
              <input type="text" id="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="Enter room number" required />
            </div>

            <div className="formGroup">
              <label htmlFor="activityType">ACTIVITY TYPE</label>
              <input type="text" id="activityType" value={formData.activityType} onChange={handleChange} placeholder="Lecture, placement examination..." required />
            </div>

            <div className="formGroup">
              <label htmlFor="requirements">REQUIRED FACILITIES</label>
              <input type="text" id="requirements" value={formData.requirements} onChange={handleChange} placeholder="Projector, computers, microphones..." />
            </div>

            <div className="formGroup">
              <label htmlFor="capacity">REQUIRED CAPACITY</label>
              <input type="number" id="capacity" value={formData.capacity} onChange={handleChange} placeholder="Number of students" required />
            </div>

            <div className="formGroup">
              <label htmlFor="date">DATE</label>
              <input type="date" id="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="timeRow">
              <div className="formGroup">
                <label htmlFor="startTime">START TIME</label>
                <input type="time" id="startTime" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div className="formGroup">
                <label htmlFor="endTime">END TIME</label>
                <input type="time" id="endTime" value={formData.endTime} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="formFooter">
            <p>Your request will be checked against existing venue allocations.</p>
            <button type="submit" className="primaryButton">
              CHECK AVAILABILITY <span>→</span>
            </button>
          </div>
        </form>

        <aside className="infoPanel">
          <div className="infoHeading">
            <span className="infoIcon">i</span>
            <h2>How it works</h2>
          </div>
          <div className="workflow">
            <div className="workflowItem">
              <span className="workflowNumber">01</span>
              <div>
                <h3>Submit requirements</h3>
                <p>Tell us the capacity, facilities and time required.</p>
              </div>
            </div>
            <div className="workflowLine"></div>
            <div className="workflowItem">
              <span className="workflowNumber">02</span>
              <div>
                <h3>Detect conflicts</h3>
                <p>Existing venue allocations are checked for conflicts.</p>
              </div>
            </div>
            <div className="workflowLine"></div>
            <div className="workflowItem">
              <span className="workflowNumber">03</span>
              <div>
                <h3>Find alternatives</h3>
                <p>Suitable available venues are recommended.</p>
              </div>
            </div>
          </div>
          <div className="infoFooter">
            <span className="statusDot"></span>
            <span>SYSTEM READY</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default FacultyDashboard;