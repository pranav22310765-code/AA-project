const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
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
    symptoms: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ['critical', 'high', 'moderate', 'mild'],
      required: true,
    },
    priority: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
      default: 'waiting',
    },
    arrivalTime: {
      type: Date,
      default: Date.now,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    medicalNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
