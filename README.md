# Patient Queue Management Platform

Full-stack patient queue management system for clinics and hospitals. The platform helps staff register patients, automatically prioritize them by condition severity, assign them to doctors based on workload, and monitor the live queue in real time.

## What It Does

- Registers patients with contact details, symptoms, condition, and notes.
- Automatically assigns a triage priority based on condition.
- Sorts the waiting queue by priority and arrival time.
- Assigns patients to the least-loaded available doctor.
- Tracks doctor workload, availability, and capacity.
- Displays live queue, doctor management, and load balancing dashboards in the frontend.

## Core Features

### Patient Management

- Patient registration form with validation.
- Automatic priority assignment from condition:
  - Critical -> priority 1
  - High -> priority 2
  - Moderate -> priority 3
  - Mild -> priority 4
- Patient status lifecycle:
  - waiting
  - assigned
  - in-progress
  - completed
  - cancelled

### Live Queue

- Shows all waiting patients in queue order.
- Orders patients by priority first, then arrival time.
- Calculates waiting time in minutes.
- Provides queue statistics such as total waiting patients and average wait time.

### Doctor Management

- Register doctors with specialization, contact, license number, availability, and capacity.
- View all doctors and their current workload.
- Update doctor status:
  - available
  - busy
  - on-break
  - offline
- Sorts doctors by current load so the least-loaded doctor is easy to identify.

### Assignment and Load Balancing

- Automatically assigns the next waiting patient to the least-loaded available doctor.
- Supports bulk assignment for multiple patients.
- Supports manual assignment of a specific patient to a specific doctor.
- Prevents assignment when a doctor is at capacity.
- Decreases doctor load when a patient is completed or cancelled.
- Provides assignment statistics and doctor load distribution.

### Frontend Dashboard

- React-based interface with four main views:
  - Live Queue
  - Register Patient
  - Doctors
  - Load Balancing
- Uses API calls to keep the dashboard synchronized with the backend.
- Includes responsive layouts for desktop and mobile usage.

## Technology Stack

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- CORS
- dotenv

### Frontend

- React
- Axios
- React Scripts

## Project Structure

```text
patient queue management platform/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── assignmentController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   └── queueController.js
│   ├── models/
│   │   ├── Doctor.js
│   │   └── Patient.js
│   ├── routes/
│   │   ├── assignmentRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   └── queueRoutes.js
│   ├── utils/
│   │   └── priorityAssignment.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── DoctorManagement.js
│   │   │   ├── LiveQueueDashboard.js
│   │   │   ├── LoadBalancingDashboard.js
│   │   │   ├── PatientRegistration.js
│   │   │   └── QueueDisplay.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── DoctorManagement.css
│   │   │   ├── LiveQueueDashboard.css
│   │   │   ├── LoadBalancing.css
│   │   │   ├── PatientRegistration.css
│   │   │   └── QueueDisplay.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── QUICKSTART.md
├── STEP1_README.md
├── STEP2_README.md
├── STEP3_README.md
├── STEP5_README.md
└── README.md
```

## Data Model

### Patient

Stored fields include:

- name
- age
- contact
- email
- symptoms
- condition
- priority
- status
- arrivalTime
- assignedDoctor
- medicalNotes

### Doctor

Stored fields include:

- name
- specialization
- contact
- email
- licenseNumber
- availability
- assignedPatients
- status
- currentLoad
- maxCapacity
- department

## API Endpoints

### Health Check

- `GET /api/health`

### Patients

- `POST /api/patients/register` - Register a new patient.
- `GET /api/patients` - Get all patients sorted by priority and arrival time.
- `GET /api/patients/:id` - Get a patient by ID.
- `PUT /api/patients/:id/status` - Update patient status.

### Queue

- `GET /api/queue/live` - Get the live waiting queue.
- `GET /api/queue/stats` - Get queue statistics.

### Doctors

- `POST /api/doctors/register` - Register a new doctor.
- `GET /api/doctors` - Get all doctors.
- `GET /api/doctors/by-load` - Get doctors sorted by current load.
- `GET /api/doctors/:id` - Get doctor details.
- `PUT /api/doctors/:id/status` - Update doctor status.

### Assignment

- `POST /api/assignment/auto-assign` - Assign the next patient to the least-loaded doctor.
- `POST /api/assignment/bulk-assign` - Assign multiple waiting patients.
- `POST /api/assignment/manual-assign` - Manually assign a patient to a doctor.
- `GET /api/assignment/stats` - Get assignment and capacity statistics.

## How The Logic Works

### 1. Patient Priority Assignment

When a patient is registered, the backend converts the selected condition into a numeric priority. That priority is stored with the patient record and used throughout the queue.

### 2. Queue Ordering

Waiting patients are sorted using two rules:

1. Lower priority value first.
2. Earlier arrival time first when priority is the same.

This keeps emergency patients first while preserving fairness within each severity group.

### 3. Doctor Load Balancing

When assigning a patient, the system picks the available doctor with the smallest current load. The assignment is skipped if the doctor is already at capacity or offline.

### 4. Status Updates

When a patient is marked completed or cancelled, the assigned doctor’s load is reduced and the patient is removed from that doctor’s assigned list.

## Environment Variables

### Backend

Create or update `backend/.env` with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/patientQueuedb
NODE_ENV=development
```

### Frontend

Create or update `frontend/.env` with:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Setup Instructions

### 1. Install Dependencies

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Start MongoDB

Use either a local MongoDB instance or MongoDB Atlas, then update `backend/.env` with the correct connection string.

### 3. Run the Backend

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### 4. Run the Frontend

In a second terminal:

```bash
cd frontend
npm start
```

The frontend runs on `http://localhost:3000` by default.

## Typical Workflow

1. Register one or more doctors.
2. Register patients with their symptoms and condition.
3. Review the live queue to see priority ordering.
4. Use auto-assignment or manual assignment to match patients to doctors.
5. Update patient status as treatment progresses.
6. Monitor workload and queue health from the dashboards.

## Notes

- Contact numbers are validated as 10 digits.
- Patient age is constrained to the range 0 to 150.
- Doctor license numbers must be unique.
- The backend exposes JSON responses with `success`, `message`, and `data` fields where applicable.
- The step-by-step markdown files in the repository document the implementation history, while this README summarizes the full project in one place.

## Related Documentation

- [QUICKSTART.md](QUICKSTART.md)
- [STEP1_README.md](STEP1_README.md)
- [STEP2_README.md](STEP2_README.md)
- [STEP3_README.md](STEP3_README.md)
- [STEP5_README.md](STEP5_README.md)
