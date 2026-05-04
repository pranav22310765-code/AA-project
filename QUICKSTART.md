# Quick Start Guide - Patient Queue Management Platform

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
- `controllers/patientController.js` - Business logic
- `routes/patientRoutes.js` - API endpoints
- `utils/priorityAssignment.js` - Priority assignment logic

### Frontend Files Created
- `src/components/PatientRegistration.js` - Registration form component
- `src/services/api.js` - API integration
- `src/App.js` - Main app component
- `src/styles/PatientRegistration.css` - Styling

## Database Collections Created
- **patients** - Stores all registered patients with fields:
  - name, age, contact, email
  - symptoms, condition
  - priority (auto-assigned: 1, 2, 3)
  - status (default: "waiting")
  - arrivalTime
  - assignedDoctor (null initially)
  - medicalNotes
  - timestamps

## Ready for Next Step?
Once testing is complete, let me know and I'll build Step 2: Doctor Management!
