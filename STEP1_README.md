# Patient Queue Management Platform - Step 1: Patient Registration

## Overview
Step 1 implements patient registration with automated priority assignment based on medical condition.

## What's Built

### Backend (Express.js + MongoDB)
✅ **Patient Model** - Stores patient data with priority and status tracking
✅ **Priority Assignment Logic** - Automatically assigns priority (1-3) based on condition:
  - Critical → Priority 1 (Highest)
  - High/Moderate → Priority 2
  - Mild → Priority 3

✅ **Patient Registration API** - `POST /api/patients/register`
✅ **Patient Retrieval APIs**:
  - `GET /api/patients` - Get all patients (sorted by priority & arrival time)
  - `GET /api/patients/:id` - Get specific patient
  - `PUT /api/patients/:id/status` - Update patient status

✅ **MongoDB Connection** - Configured with connection string from `.env`

### Frontend (React)
✅ **Patient Registration Form** - Beautiful UI with all required fields
✅ **Form Validation** - Client-side validation for all inputs
✅ **Priority Legend** - Visual guide showing priority levels
✅ **API Integration** - Axios service for backend communication
✅ **Success/Error Handling** - User feedback messages
✅ **Responsive Design** - Mobile-friendly layout

## Project Structure
```
patient queue management platform/
├── backend/
│   ├── config/
│   │   └── db.js (MongoDB connection)
│   ├── models/
│   │   └── Patient.js (Patient schema)
│   ├── routes/
│   │   └── patientRoutes.js (API endpoints)
│   ├── controllers/
│   │   └── patientController.js (Business logic)
│   ├── utils/
│   │   └── priorityAssignment.js (Priority logic)
│   ├── .env (Environment variables)
│   ├── server.js (Express server)
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── PatientRegistration.js (Registration form)
    │   ├── services/
    │   │   └── api.js (API calls)
    │   ├── styles/
    │   │   └── PatientRegistration.css
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env (Environment variables)
    └── package.json
```

## Setup Instructions

### 1. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `backend/.env`
- Example: `mongodb://localhost:27017/patient-queue-db`

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev  # or npm start for production
```
Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

## API Testing

### Register Patient
```bash
curl -X POST http://localhost:5000/api/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 35,
    "contact": "9876543210",
    "email": "john@example.com",
    "symptoms": "Severe chest pain",
    "condition": "critical",
    "medicalNotes": "Previous cardiac issues"
  }'
```

### Get All Patients
```bash
curl http://localhost:5000/api/patients
```

### Get Patient by ID
```bash
curl http://localhost:5000/api/patients/{patientId}
```

### Update Patient Status
```bash
curl -X PUT http://localhost:5000/api/patients/{patientId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

## Key Features Implemented

1. **Patient Registration Form**
   - Name, Age, Contact, Email, Symptoms, Condition, Medical Notes
   - Form validation with helpful error messages
   - Condition dropdown with priority legend

2. **Automatic Priority Assignment**
   - Critical condition → Priority 1
   - High/Moderate → Priority 2
   - Mild → Priority 3

3. **Arrival Time Tracking**
   - Automatically captured on registration
   - Used for queue sorting

4. **Queue Sorting**
   - Patients sorted by priority first (ascending)
   - Then by arrival time (earliest first)

5. **Status Management**
   - Status values: waiting, in-progress, completed, cancelled
   - Default status on registration: "waiting"

## Next Steps (Future Steps)
- Step 2: Doctor Management (add doctors, availability, specializations)
- Step 3: Queue Display Dashboard (show real-time queue)
- Step 4: Doctor-Patient Assignment (assign patients to doctors)
- Step 5: Queue Dynamics (move patients through states, update queue)
- Step 6: Notifications & Alerts

## Notes
- All endpoints return JSON with `success`, `message`, and `data` fields
- Contact must be 10 digits
- Age validation: 0-150 years
- MongoDB stores timestamps for tracking
