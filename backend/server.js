require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const patientRoutes = require('./routes/patientRoutes');
const queueRoutes = require('./routes/queueRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/assignment', assignmentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
