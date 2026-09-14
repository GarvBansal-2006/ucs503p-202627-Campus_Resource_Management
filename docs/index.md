![Tiet Logo](assets/tiet-logo.svg){ .tiet-logo }

**UCS503: Software Engineering (Project)**  
**Thapar Institute of Engineering & Technology, Patiala**

# **Campus Resource Management: Conflict Resolution System**
### ***An Automated Venue Booking, Conflict Detection & Resolution Platform***

<div class="badges" markdown>
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2F%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Documentation](https://img.shields.io/badge/Docs-MkDocs%20%2F%20LaTeX-008080?style=flat-square)](https://www.mkdocs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/GarvBansal-2006/ucs503p-202627-Campus_Resource_Management)
</div>

---

## Academic & Team Profile

| Role | Team Member | Roll Number | Email | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Architect & UI/UX Lead** | **Arhana Mor** | `1024030773` | [`amor_be24@thapar.edu`](mailto:amor_be24@thapar.edu) | Computer Science & Engineering |
| **Project Lead, Backend Architect, & Git Coordinator** | **Garv Bansal** | `1024030988` | [`gbansal_be24@thapar.edu`](mailto:gbansal_be24@thapar.edu) | Computer Science & Engineering |

* **Academic Supervisor & Lab Instructor:** **Dr. Jeelani Asif** (Department of Computer Science & Engineering, TIET Patiala)
* **Course Code:** UCS503P — Software Engineering Project (Academic Year 2026–27)

---

## Executive Overview

Campus lecture halls and laboratories are often reallocated for placement activities, orientations, and other institutional events without timely notification to the affected batches and faculty. This results in last-minute class cancellations and inefficient venue reassignment due to the lack of readily available alternatives.

!!! abstract "The Conflict Resolution Problem"
    There is a fundamental communication gap between **when campus resources are preempted** and **when students and faculty are notified**. Manual venue reallocation is slow, unstructured, and often fails to identify suitable alternative rooms.

**Campus Resource Management** solves this through an automated venue booking platform:
1. **Venue Booking Portal:** Timetable coordinators submit booking requests specifying required capacity, facilities, and time slot.
2. **Automated Conflict Detection:** Dynamically validates requests against existing bookings to generate instant conflict alerts.
3. **Rule-Based Venue Recommender:** Cross-examines available rooms to rank suitable alternative venues, ensuring graceful conflict resolution and immediate notifications to all affected users.

---

## Key Platform Capabilities

<div class="grid cards" markdown>

-   :material-calendar-plus: **Venue Booking Interface**

    ---

    Timetable coordinators submit booking requests specifying required capacity, facilities (projectors, computers, etc.), time slot, and activity type (lecture, placement examination, orientation).

-   :material-alert-circle-outline: **Automated Conflict Detection**

    ---

    The system dynamically validates requests against existing bookings and generates alerts when resource conflicts or double bookings are detected on campus.

-   :material-map-marker-distance: **Alternative Venue Recommendation**

    ---

    For conflicting requests, the system automatically identifies and recommends unoccupied venues that satisfy capacity, resource, and scheduling requirements using proximity constraints.

-   :material-scale-balance: **Conflict Resolution Workflow**

    ---

    Coordinators can review conflicting activities, view expected occupancy and responsible faculty, and select an appropriate action such as relocating or rescheduling a lower-priority activity.

-   :material-bell-ring-outline: **Automated Notifications**

    ---

    Affected students and faculty are notified immediately when a scheduled activity is relocated, suspended, or modified, ensuring transparent communication.

</div>

---

## System Architecture & Layered Decomposition

The platform decouples frontend interaction, backend logic, and database storage across 3 modular layers:

<div class="grid cards" markdown>

-   :material-monitor-dashboard: **Frontend Dashboard (React / Vite)**

    ---

    - Interactive Venue Booking Interface
    - Conflict Review & Resolution Panel
    - Real-Time Student/Faculty Notifications

-   :material-server-network: **Backend API Gateway (Express / Node.js)**

    ---

    - RESTful Endpoints & Role-Based Access Control
    - Automated Conflict Detection Service
    - Rule-Based Venue Recommender

-   :material-database: **Data Layer (MongoDB / Mongoose)**

    ---

    - Users, Roles, and Permissions
    - Rooms & Resource Specifications
    - Booking, Allocations, and Conflict History

</div>

---

## Interactive Prototype Demonstration

To test the live frontend and backend integration locally, launch the development servers. The prototype includes conflict detection capabilities for overlapping venue requests.

**Terminal 1: Start Backend API**
```bash
cd code/backend
npm install
npm run dev
```

**Terminal 2: Start Frontend Application**
```bash
cd code/frontend
npm install
npm run dev
```

---

## Formal Software Engineering & Architectural Deliverables

| Deliverable | Description | Format & Access Link |
| :--- | :--- | :--- |
| **Project Proposal Report** | Formal LaTeX project proposal document detailing problem formulation, scope, and technical roadmap | [View Proposal PDF](project-proposal/CampusResourceManagement.pdf) |
| **Evaluation Presentation Deck** | Evaluation deck with architecture diagrams and workflow proposals | [View Slide Deck PDF](Project_Presentation.pdf) |
| **Entity-Relationship Diagram** | Database architecture schema | [View ERD PDF](ERDiagram.pdf) |
| **Data Flow Diagram (DFD)** | System process decomposition and data verification flow | [View DFD PDF](DataFlowDiagram.pdf) |
| **UML Use Case Diagram** | Actor boundaries and dependencies for coordinators, faculty, and students | [View Use Case PDF](UseCase.pdf) |
| **UML Activity Diagram** | Workflow modeling for the automated conflict detection engine | [View Activity PDF](activityDiagram.pdf) |
| **Prototype Evaluation Report** | Detailed evaluation report of the MVP and backend logic | [View Prototype Report PDF](project-report-prototype-stage/CampusResourceAllocatorPrototypeDocument.pdf) |
| **Project Gantt Chart** | Automated project schedule and tracking timeline | [View Gantt Chart PDF](GanttChart.pdf) |

---

<p align="center">
  <b>Campus Resource Management</b> • Automated Venue Booking & Conflict Resolution • Academic Year 2026-27
</p>
