const mongoose = require("mongoose");

const PatientProfileSchema = new mongoose.Schema(
 {
   userId: { type: String, required: true, unique: true },
   phone: { type: String, default: "" },
   address: { type: String, default: "" },
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
