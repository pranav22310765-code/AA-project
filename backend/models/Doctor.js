const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: ['General', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'ENT'],
    },
    contact: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },
    email: {
      type: String,
      required: false,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    availability: {
      startTime: {
        type: String,
        required: true, // Format: "HH:MM" (e.g., "09:00")
        default: '09:00',
      },
      endTime: {
        type: String,
        required: true, // Format: "HH:MM" (e.g., "18:00")
        default: '18:00',
      },
      daysAvailable: {
        type: [String], // ["Monday", "Tuesday", "Wednesday", ...]
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    },
    assignedPatients: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Patient',
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'busy', 'on-break', 'offline'],
      default: 'available',
    },
    currentLoad: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      default: 10,
      min: 1,
    },
    department: {
      type: String,
      default: 'General',
    },
  },
  { timestamps: true }
);

// Index for quick lookup of doctors with least load
doctorSchema.index({ currentLoad: 1, status: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
