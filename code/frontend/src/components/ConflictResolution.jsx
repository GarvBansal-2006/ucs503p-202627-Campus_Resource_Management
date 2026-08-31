import { useNavigate, useLocation } from 'react-router-dom';

function ConflictResolution() {
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!location.state) {
    return <div style={{ padding: '50px' }}>No request data found. Please go back.</div>;
  }

  const { request, result } = location.state;

  // Determine the page headers based on the 3 possible states
  let eyebrowText = "SUCCESS";
  let pageTitle = "Venue Available!";
  let pageDescription = "Your requested room is vacant during this time slot.";

  if (!result.available) {
    if (result.capacityError) {
      eyebrowText = "CAPACITY EXCEEDED";
      pageTitle = "Room Too Small";
      pageDescription = "The requested venue cannot hold the number of students required.";
    } else {
      eyebrowText = "CONFLICT DETECTED";
      pageTitle = "Venue Occupied";
      pageDescription = "The requested room is already booked for another activity.";
    }
  }

  return (
    <main className="pageContainer">
      <section className="pageIntro">
        <div>
          <p className="eyebrow">{eyebrowText}</p>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </div>
      </section>

      {}
      {!result.available && result.capacityError && (
        <section className="conflictBanner">
          <div className="conflictIcon">!</div>
          <div className="conflictInformation">
            <div className="conflictTitle">
              <span>CAPACITY MISMATCH</span>
              <span className="conflictBadge">UNAVAILABLE</span>
            </div>
            <h2>{request.roomNumber} only holds {result.maxCapacity} students.</h2>
            <div className="requestDetails">
              <span>REQUESTED SEATS: {result.requestedCapacity}</span>
              <span>SHORTFALL: {result.requestedCapacity - result.maxCapacity} SEATS</span>
            </div>
          </div>
        </section>
      )}

      {}
      {!result.available && !result.capacityError && (
        <section className="conflictBanner">
          <div className="conflictIcon">!</div>
          <div className="conflictInformation">
            <div className="conflictTitle">
              <span>VENUE CONFLICT DETECTED</span>
              <span className="conflictBadge">UNAVAILABLE</span>
            </div>
            <h2>{request.roomNumber} is occupied by: {result.conflictActivity?.title}</h2>
            <div className="requestDetails">
              <span>{request.activityType.toUpperCase()}</span>
              <span>{request.startTime} — {request.endTime}</span>
            </div>
          </div>
        </section>
      )}

      {}
      {result.available && (
        <section className="conflictBanner" style={{ backgroundColor: '#e6fffa', borderColor: '#38b2ac', borderLeftColor: '#319795' }}>
          <div className="conflictIcon" style={{ backgroundColor: '#b2f5ea', color: '#2c7a7b' }}>✓</div>
          <div className="conflictInformation">
            <div className="conflictTitle" style={{ color: '#285e61' }}>
              <span>VENUE VACANT</span>
            </div>
            <h2 style={{ color: '#234e52' }}>{request.roomNumber} is available to book!</h2>
          </div>
        </section>
      )}

      <section className="summaryGrid" style={{ marginBottom: '0' }}>
        <div className="summaryCard">
          <p className="summaryLabel">REQUESTED VENUE</p>
          <h2>{request.roomNumber}</h2>
        </div>
        <div className="summaryCard">
          <p className="summaryLabel">REQUIRED CAPACITY</p>
          <h2>{request.capacity}</h2>
        </div>
        <div className="summaryCard">
          <p className="summaryLabel">DATE</p>
          <h2>{request.date}</h2>
        </div>
        <div className="summaryCard">
          <p className="summaryLabel">TIME SLOT</p>
          <h2>{request.startTime}</h2>
          <span className="summarySubtext">— {request.endTime}</span>
        </div>
      </section>

      <div style={{ marginTop: '40px' }}>
        <button className="primaryButton" onClick={() => navigate('/')}>
          ← BACK TO REQUEST FORM
        </button>
      </div>
    </main>
  );
}

export default ConflictResolution;