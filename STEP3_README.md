# Step 3: Doctor Load Balancing - Complete

## Overview
Step 3 implements intelligent load-balancing for patient-doctor assignments. The system takes the sorted patient queue from Step 2, finds the doctor with the least assigned patients, and automatically assigns the next patient to that doctor.

## What's Built

### Backend - Doctor Management

#### 1. Doctor Model
**Fields:**
- name, specialization (General, Cardiology, Neurology, etc.)
- contact, email, licenseNumber
- availability (startTime, endTime, daysAvailable)
- assignedPatients (array of patient IDs)
- status (available, busy, on-break, offline)
- currentLoad (number of assigned patients)
- maxCapacity (maximum patients per doctor, default: 10)

#### 2. Doctor Endpoints
- `POST /api/doctors/register` - Register new doctor
- `GET /api/doctors` - Get all doctors (sorted by load)
- `GET /api/doctors/:id` - Get doctor details with assigned patients
- `GET /api/doctors/by-load` - Get doctors sorted by current load (ascending)
- `PUT /api/doctors/:id/status` - Update doctor status

### Backend - Load Balancing & Assignment

#### 1. Auto-Assignment Endpoint
**`POST /api/assignment/auto-assign`**

**Algorithm:**
```
1. GET next waiting patient (sorted by priority, then arrivalTime)
2. FIND doctor with least currentLoad (not offline)
3. CHECK doctor's currentLoad < maxCapacity
4. UPDATE patient: status = "assigned", assignedDoctor = doctor._id
5. UPDATE doctor: push patient to assignedPatients, increment currentLoad
6. RETURN assignment confirmation
```

#### 2. Bulk Assignment Endpoint
**`POST /api/assignment/bulk-assign`** (with count parameter)
- Assigns multiple patients in one request
- Uses same load-balancing algorithm
- Returns all assignments made

#### 3. Manual Assignment Endpoint
**`POST /api/assignment/manual-assign`**
- Manually assign specific patient to specific doctor
- Validates doctor capacity
- Updates both patient and doctor records

#### 4. Assignment Statistics Endpoint
**`GET /api/assignment/stats`**
- Total patients by status (waiting, assigned, in-progress, completed)
- Doctor capacity overview (total, used, available)
- Individual doctor workload distribution with utilization %
- Identifies least-loaded doctor

### Load Balancing Algorithm

```javascript
// Find doctor with minimum load
const leastLoadedDoctor = await Doctor.findOne({
  status: { $ne: 'offline' },
  currentLoad: { $lt: maxCapacity }
})
  .sort({ currentLoad: 1 });  // Sort ascending (least first)

// Assign patient to this doctor
patient.assignedDoctor = leastLoadedDoctor._id;
patient.status = 'assigned';

// Update doctor's workload
doctor.assignedPatients.push(patient._id);
doctor.currentLoad += 1;
```

**Key Features:**
- ✅ Prevents assignment to offline doctors
- ✅ Respects doctor capacity limits
- ✅ Distributes load evenly among available doctors
- ✅ Database indexed on currentLoad for fast queries

### Frontend Components

#### 1. Doctor Management Component
**Features:**
- Register new doctors with specialization, contact, license
- View all doctors with their specialization and load
- Visual load bar showing patient count vs capacity
- Change doctor status (available, busy, on-break, offline)
- Auto-refresh every 5 seconds
- Color-coded status badges

**Form Fields:**
- Name, specialization (enum), contact, email
- License number (unique), max capacity, department
- Availability times (start/end)

#### 2. Load Balancing Dashboard
**Features:**
- **Auto-Assign Button** - Assign single next waiting patient
- **Bulk Assign Button** - Assign 5 patients at once
- **Queue Status** - Shows waiting, assigned, in-progress, completed counts
- **Overall Capacity** - Doctor capacity utilization bar and percentage
- **Individual Doctor Loads** - Grid showing each doctor's workload
- **Least-Loaded Indicator** - ⭐ Marks which doctor will receive next assignment
- **Algorithm Explanation** - Shows the 4-step assignment process
- **Auto-refresh** - Updates every 3 seconds

#### 3. Navigation Bar Update
Added two new buttons to main navbar:
- 👨‍⚕️ **Doctors** - Doctor management view
- ⚖️ **Load Balancing** - Assignment dashboard

### Example Load Balancing Flow

**Scenario:**
```
Doctor A: currentLoad = 3/10 (30% utilized)
Doctor B: currentLoad = 5/10 (50% utilized)
Doctor C: currentLoad = 2/10 (20% utilized)  ← LEAST LOADED
Patient waiting in queue with P1 priority

ASSIGNMENT:
1. Find patient: Patient X (P1, arrived 10:35)
2. Find doctors not offline: A, B, C all available
3. Get least loaded: Doctor C (load 2)
4. Check capacity: 2 < 10 ✓
5. Assign patient X to Doctor C
6. Result:
   - Patient X: status="assigned", assignedDoctor=C
   - Doctor C: currentLoad=3, assignedPatients=[..., X]
```

## Files Created/Modified

### Backend
- `models/Doctor.js` (NEW)
- `controllers/doctorController.js` (NEW)
- `routes/doctorRoutes.js` (NEW)
- `controllers/assignmentController.js` (NEW)
- `routes/assignmentRoutes.js` (NEW)
- `server.js` (MODIFIED)

### Frontend
- `components/DoctorManagement.js` (NEW)
- `styles/DoctorManagement.css` (NEW)
- `components/LoadBalancingDashboard.js` (NEW)
- `styles/LoadBalancing.css` (NEW)
- `services/api.js` (MODIFIED)
- `App.js` (MODIFIED)

## API Testing

### Register Doctor
```bash
curl -X POST http://localhost:5000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology",
    "contact": "9876543210",
    "email": "sarah@hospital.com",
    "licenseNumber": "LIC-12345",
    "maxCapacity": 10
  }'
```

### Auto-Assign Patient to Least-Loaded Doctor
```bash
curl -X POST http://localhost:5000/api/assignment/auto-assign
```

### Bulk Assign 5 Patients
```bash
curl -X POST http://localhost:5000/api/assignment/bulk-assign \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### Get Assignment Statistics
```bash
curl http://localhost:5000/api/assignment/stats
```

## Database Queries

### Get Least-Loaded Doctor
```javascript
Doctor.findOne({
  status: { $ne: 'offline' },
  currentLoad: { $lt: '$maxCapacity' }
}).sort({ currentLoad: 1 });
```

### Get Doctor Workload Report
```javascript
db.doctors.aggregate([
  {
    $project: {
      name: 1,
      currentLoad: 1,
      maxCapacity: 1,
      utilization: {
        $multiply: [
          { $divide: ['$currentLoad', '$maxCapacity'] },
          100
        ]
      }
    }
  },
  { $sort: { currentLoad: 1 } }
]);
```

## Key Concepts

### Load Balancing
- Ensures equitable distribution of patients across doctors
- Prevents overload on any single doctor
- Automatically finds doctor with minimum workload

### Capacity Management
- Each doctor has `maxCapacity` (default: 10)
- `currentLoad` tracks assigned patients
- Prevents assigning when at capacity

### Status Management
- **Available** - Can receive new patients
- **Busy** - Still accepts assignments (used while seeing patient)
- **On-break** - Still accepts but indicates unavailable
- **Offline** - Does not receive new assignments

### Waiting Time Consideration
- Patients assigned from sorted queue
- Priority-based (critical patients get doctors first)
- Fair ordering (first-come-first-served within priority)

## Next Steps (Step 4)
- Doctor-Patient Consultation
  - Move patient from "assigned" to "in-progress"
  - Track consultation start/end time
  - Update queue to show which doctor is seeing patient
  - Move patient to "completed" after consultation
