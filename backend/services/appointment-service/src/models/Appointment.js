const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    datetime: { type: Date, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);