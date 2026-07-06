# Quick Start Guide - Patient Queue Management Platform

## Project Overview
This project is a full-stack patient queue management platform for clinics and hospitals. It helps staff register patients, automatically prioritize them based on condition severity, assign them to doctors, and monitor live queue and workload status in real time.

### What the system does
- Registers patients with symptoms, condition, and contact details.
- Converts condition severity into a numeric priority level.
- Orders the live queue by priority and arrival time.
- Assigns patients to the least-loaded available doctor.
- Tracks doctor capacity, queue length, wait time, and assignment status.
- Provides separate frontend views for patient registration, queue display, live queue monitoring, doctor management, and load balancing.

### Main modules
- Backend API: Express server, MongoDB connection, REST routes, and controller logic.
- Patient management: registration, status updates, and queue insertion.
- Doctor management: registration, status tracking, and workload monitoring.
- Assignment engine: automatic and manual patient-to-doctor assignment.
- Queue analytics: live queue list, statistics, and wait-time calculations.
- Frontend dashboard: React UI for interacting with all core workflows.

## Algorithms Used

### 1. Priority-Based Triage
Patients are assigned a priority from 1 to 4 based on condition severity.
- Critical = 1
- High = 2
- Moderate = 3
- Mild = 4

This is the core triage algorithm used to decide which patient should be handled first.

### 2. Priority Queue Ordering
The waiting queue is sorted by:
1. Priority in ascending order
2. Arrival time in ascending order

This acts like a priority queue with FIFO behavior for patients who have the same priority.

### 3. Greedy Load Balancing
When assigning a patient to a doctor, the system selects the available doctor with the smallest current load.

This is a greedy scheduling strategy designed to keep doctor workloads as evenly distributed as possible.

### 4. Capacity-Constrained Assignment
Before assignment, the system checks whether the selected doctor has remaining capacity.

If the doctor is at max capacity, the assignment is skipped or rejected.

### 5. Bulk Assignment Loop
For bulk assignment, the system iterates through the sorted waiting list and assigns each patient one by one.

Each iteration re-checks patient status and doctor capacity, which helps prevent stale updates from causing incorrect assignments.

### 6. Wait-Time Calculation
Wait time is calculated by subtracting the arrival timestamp from the current time and converting the result to minutes.

This is used in the live queue dashboard and queue statistics.

### 7. Average Wait-Time Aggregation
Average wait time is computed by summing the wait time of all waiting patients and dividing by the total number of waiting patients.

This gives a simple operational metric for queue health.

### 8. Workload Rebalancing on Status Change
When a patient is marked completed or cancelled, the assigned doctor’s load is reduced and the patient is removed from the doctor’s assigned list.

This keeps the doctor workload data consistent with the patient lifecycle.

### 9. Count and Distribution Statistics
The assignment statistics endpoint uses counting and mapping logic to compute:
- Number of waiting, assigned, in-progress, and completed patients
- Total doctor capacity
- Total assigned load
- Available slots
- Doctor load distribution

This is used for dashboard-style reporting rather than decision-making.

## Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)

## 1. Install MongoDB

### Option A: Local MongoDB
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Or use chocolatey: choco install mongodb-community
```

### Option B: MongoDB Atlas (Cloud)
- Go to https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Update in `backend/.env`

## 2. Clone/Navigate to Project
```bash
cd "d:\AA project\patient queue management platform"
```

## 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create/Update .env file (already created)
# MONGODB_URI=mongodb://localhost:27017/patient-queue-db
# PORT=5000

# Start backend
npm run dev
```

✅ Backend ready at: `http://localhost:5000`

## 4. Setup Frontend (in another terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

✅ Frontend ready at: `http://localhost:3000`

## 5. Test the Application

1. Open `http://localhost:3000` in browser
2. Fill patient registration form
3. Submit - patient gets priority automatically assigned
4. Check backend console for registration confirmation

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB service is running
- Check connection string in `backend/.env`
- Test: `mongosh` in terminal

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Change port in React start script

### CORS Error
- CORS is already enabled in backend
- Check that frontend API_BASE_URL matches backend address

### Dependencies Error
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## File Structure Review

### Backend Files Created
- `server.js` - Main Express server
- `config/db.js` - MongoDB connection
- `models/Patient.js` - Patient data schema
- `models/Doctor.js` - Doctor data schema
- `controllers/patientController.js` - Business logic
- `controllers/doctorController.js` - Doctor registration and workload logic
- `controllers/queueController.js` - Live queue and queue statistics
- `controllers/assignmentController.js` - Auto-assignment and bulk assignment
- `routes/patientRoutes.js` - API endpoints
- `routes/doctorRoutes.js` - Doctor endpoints
- `routes/queueRoutes.js` - Queue endpoints
- `routes/assignmentRoutes.js` - Assignment endpoints
- `utils/priorityAssignment.js` - Priority assignment logic

### Frontend Files Created
- `src/components/PatientRegistration.js` - Registration form component
- `src/components/DoctorManagement.js` - Doctor management dashboard
- `src/components/LiveQueueDashboard.js` - Live queue view
- `src/components/LoadBalancingDashboard.js` - Doctor load balancing view
- `src/components/QueueDisplay.js` - Queue display component
- `src/services/api.js` - API integration
- `src/App.js` - Main app component
- `src/App.css` - Global app styling
- `src/index.js` - React entry point
- `src/styles/DoctorManagement.css` - Doctor management styles
- `src/styles/LiveQueueDashboard.css` - Live queue styles
- `src/styles/LoadBalancing.css` - Load balancing styles
- `src/styles/QueueDisplay.css` - Queue display styles
- `src/styles/PatientRegistration.css` - Styling

## Database Collections Created
- **patients** - Stores all registered patients with fields:
  - name, age, contact, email
  - symptoms, condition
  - priority (auto-assigned: 1, 2, 3, 4)
  - status (default: "waiting")
  - arrivalTime
  - assignedDoctor (null initially)
  - medicalNotes
  - timestamps

## Ready for Next Step?
Once testing is complete, let me know and I'll build Step 2: Doctor Management!
