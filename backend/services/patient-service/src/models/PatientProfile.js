const mongoose = require("../../../../shared/config/mongoose");

const PatientProfileSchema = new mongoose.Schema(
 {
   userId: { type: String, required: true, unique: true },
   dateOfBirth: { type: String, default: "" },
   gender: { type: String, default: "" },
   phone: { type: String, default: "" },
   address: { type: String, default: "" },
   medicalHistory: { type: String, default: "" },
   allergies: [{ type: String }],
   chronicConditions: [{ type: String }],
   reports: [
     {
       filename: String,
       originalName: String,
       uploadedAt: { type: Date, default: Date.now },
     },
   ],
 },
 { timestamps: true }
);

module.exports = mongoose.model("PatientProfile", PatientProfileSchema);
