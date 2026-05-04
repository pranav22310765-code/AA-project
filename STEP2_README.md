# Step 2: Smart Queue Ordering - Complete

## Overview
Step 2 implements intelligent queue sorting that fetches waiting patients and orders them by priority (ascending) then arrival time (ascending), ensuring emergency patients are served first with fairness within same priority.

## What's Built

### Backend APIs

#### 1. Get Live Queue
**Endpoint:** `GET /api/queue/live`

**Logic:**
- Fetches all patients with `status = "waiting"`
- Sorts by:
  1. `priority` (ascending): 1 (critical) → 2 (high) → 3 (mild)
  2. `arrivalTime` (ascending): Earlier arrivals first within same priority
- Returns queue with patient position, waiting time, and all details

**Response:**
```json
{
  "success": true,
  "queueLength": 5,
  "queue": [
    {
      "position": 1,
      "patientId": "...",
      "name": "John Doe",
      "priority": 1,
      "waitingTime": 15,
      "arrivalTime": "2026-05-04T10:30:00Z",
      ...
    }
  ]
}
```

#### 2. Get Queue Statistics
**Endpoint:** `GET /api/queue/stats`

**Returns:**
- Total patients waiting
- Count by priority level (P1, P2, P3)
- Average waiting time
- Longest wait time in queue

### Frontend Components

#### 1. Queue Display Component
- **Real-time queue visualization**
- **Auto-refresh** every 3 seconds (toggle-able)
- **Statistics panel** showing:
  - Total waiting patients
  - Count for each priority level
  - Average wait time
  - Longest wait time

#### 2. Queue Item Display
Each queue item shows:
- **Position number** (1, 2, 3, ...)
- **Patient info** (name, age, contact, symptoms)
- **Priority badge** (color-coded: Red=P1, Yellow=P2, Green=P3)
- **Waiting time** (formatted: "15 min", "1h 23m")
- **Patient ID** (last 6 chars)

#### 3. Navigation Bar
- Toggle between "Live Queue" and "Register Patient" views
- Sticky navbar with gradient background
- Mobile-responsive

## Architecture

### Database Query (Smart Sorting)
```javascript
Patient.find({ status: 'waiting' })
  .sort({ priority: 1, arrivalTime: 1 })
  .select('_id name age priority arrivalTime symptoms condition contact')
```

### Waiting Time Calculation
```javascript
function calculateWaitingTime(arrivalTime) {
  const now = new Date();
  const diffMs = now - new Date(arrivalTime);
  return Math.floor(diffMs / 60000); // Convert to minutes
}
```

## Files Created/Modified

### Backend
- `controllers/queueController.js` (NEW) - Queue logic
- `routes/queueRoutes.js` (NEW) - Queue endpoints
- `server.js` (MODIFIED) - Added queue routes

### Frontend
- `components/QueueDisplay.js` (NEW) - Queue dashboard
- `styles/QueueDisplay.css` (NEW) - Queue styling
- `services/api.js` (MODIFIED) - Added queue API calls
- `App.js` (MODIFIED) - Added navigation & dual views
- `App.css` (MODIFIED) - Added navbar styling

## Queue Sorting Algorithm

### Example Queue Before Sorting
```
Patient A: Priority 2, Arrival 10:30
Patient B: Priority 1, Arrival 10:45
Patient C: Priority 2, Arrival 10:25
Patient D: Priority 1, Arrival 10:35
Patient E: Priority 3, Arrival 10:20
```

### Example Queue After Sorting
```
1. Patient B: Priority 1, Arrival 10:45  (P1 first)
2. Patient D: Priority 1, Arrival 10:35  (P1, but earlier than B)
3. Patient C: Priority 2, Arrival 10:25  (P2, earliest arrival)
4. Patient A: Priority 2, Arrival 10:30  (P2, later than C)
5. Patient E: Priority 3, Arrival 10:20  (P3 last)
```

**Result:** Critical patients served first, fair queue within same priority

## Features

✅ **Real-time queue display** with auto-refresh
✅ **Smart sorting** (priority + arrival time)
✅ **Queue statistics** (totals, averages, by priority)
✅ **Waiting time tracking** (formatted display)
✅ **Color-coded priority badges**
✅ **Empty queue detection** (displays message)
✅ **Responsive design** (mobile & desktop)
✅ **Performance optimized** (only fetches waiting patients)
✅ **Error handling** with user feedback

## API Testing

### Get Live Queue
```bash
curl http://localhost:5000/api/queue/live
```

### Get Queue Statistics
```bash
curl http://localhost:5000/api/queue/stats
```

## Next Steps (Step 3)
- Doctor Management System
  - Doctor model (name, specialization, availability)
  - Doctor availability/schedule
  - Doctor assignment logic
  - Update queue to show assigned doctor
