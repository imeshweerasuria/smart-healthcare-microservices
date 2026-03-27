const mongoose = require("../../../../shared/config/mongoose");

const AppointmentSchema = new mongoose.Schema(
 {
   patientId: { type: String, required: true },
   doctorId: { type: String, required: true },
   datetime: { type: Date, required: true },
   reason: { type: String, default: "" },

   status: {
     type: String,
     enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "CONFIRMED", "COMPLETED"],
     default: "PENDING",
   },

   telemedicineLink: { type: String, default: "" },

   paymentStatus: {
     type: String,
     enum: ["UNPAID", "PAID"],
     default: "UNPAID",
   },

   patientEmail: { type: String, default: "" },
 },
 { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
