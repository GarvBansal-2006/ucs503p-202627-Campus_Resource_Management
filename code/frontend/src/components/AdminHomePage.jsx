import React from 'react';
import {countVenues,countConflicts, countPending,countEvents} from './Functions';

function AdminHomePage(){
    const styles = {
   container:{
    marginLeft:'20%'
},
   button:{
   transform: 'translate(80vw,40vh)',
   cursor: 'pointer',
   width: '170px',
   height: '70px',
   borderRadius: '20px',
   backgroundColor: 'white',   
   fontSize: '16px',
   color: '#0f2541',
   borderColor:  'rgba(134, 176, 211, 0.55)'
   },
  

};

const availableVenues =  countVenues(); 
const ongoingConflicts = countConflicts();
const pendingRequests =  countPending();
const todaysEvents    =  countEvents();
    return(
       <div>
       <div style={styles.container}> <h2>Welcome, Admin</h2>
        <p>Here's what's happening across Campus.</p>
        </div>
        <div className ="widgets">
        <div className ="widgetOne"> <h2>  Available Venues </h2> 
        <h2 className = "widgetContent">{availableVenues}</h2></div>
        <div className ="widgetOne"> <h2> Ongoing Conflicts</h2>
        <h2 className = "widgetContent">{ongoingConflicts}</h2> </div>
        <div className ="widgetOne">  <h2>Pending requests</h2> 
        <h2 className = "widgetContent">{pendingRequests}</h2> </div>
        <div className ="widgetOne"> <h2>Today's events</h2>
         <h2  className = "widgetContent">{todaysEvents}</h2>  </div>
         

      </div>
      <button style={styles.button} onClick={() => {
          window.location.href = '/admin';
        }}><b>Go to dashboard</b></button>

    <div className="sideBar">
       <a href="/admin">Dashboard</a>
        <a href="/">Venue Booking</a>
         <a href="#">Exam Scheduling</a>
          <a href="#">Calendar</a>
           <a href="#">Settings</a>
    </div> 
    
        <div className ="quickActions"> 
        <div id = "header"> <h2>Quick Actions</h2></div>
        <a className ="quickActionsWidget" href ="#" > <h2>See pending requests</h2></a>
         <a className ="quickActionsWidget" href ="#"> <h2>See today's schedule</h2></a>
         <a className ="quickActionsWidget" href ="#"> <h2>Find a Venue</h2></a>
         <a className ="quickActionsWidget" href ="#"><h2>View Conflicts</h2> </a>

     </div>
     </div>
    );

    
}

export default AdminHomePage;

