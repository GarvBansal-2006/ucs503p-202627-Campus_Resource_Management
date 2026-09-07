Weekly Progress Journal — Garv Bansal (Roll No: 1024030988)

Project Name: Campus Resource Management
Role: Project Lead, Backend Architect, & Git Coordinator

Week 1 (Aug 3 - Aug 9): Project Inception & Architecture
* Formed the team for the UCS503 Software Engineering project.
* Brainstormed and finalized the Campus Resource Management project to solve university venue collision issues.
* Researched the backend MERN stack (Node.js, Express, MongoDB) to plan the core scheduling logic, RESTful APIs, and database relationships.

Week 2 (Aug 10 - Aug 16): Git Setup & Database Configuration
* Initialized the GitHub repository (ucs503p-202627-Campus_Resource_Management) and established local development environments.
* Configured the Express.js server and established the connection to the MongoDB database using Mongoose.
* Verified backend connectivity and drafted the initial server routing structure.

Week 3 (Aug 17 - Aug 23): Schema Design & Pitch Presentation
* Defined the database architecture and created Mongoose schemas for the `Room` and `Activity` models to track capacities and time slots.
* Contributed to the project pitch presentation outlining our collision-detection MVP and system workflow.
* Configured the MkDocs environment and set up the GitHub Actions pipeline to compile the documentation site to the gh-pages branch.

Week 4 (Aug 24 - Aug 30): REST API & Capacity Engine
* Built the initial REST API architecture and implemented the `/check` availability route.
* Engineered the capacity checker logic to verify if a requested venue can physically accommodate the submitted student batch size.
* Managed remote repository operations, including strict `.gitignore` configurations for `node_modules` and `.env` files.

Week 5 (Aug 31 - Sep 6): Collision Algorithm & Deployment Alignment
* Developed the core Collision Detection algorithm using complex MongoDB operators (`$and`, `$or`, `$lt`, `$gt`) to prevent double-booking.
* Finalized the admin approval routes (`/api/approve/:id`) and formatted robust JSON conflict responses (404s, 409s) for the frontend.
* Diagnosed and fixed repository conflicts.
