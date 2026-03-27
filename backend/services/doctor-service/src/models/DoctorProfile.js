const mongoose = require("../../../../shared/config/mongoose");

const DoctorProfileSchema = new mongoose.Schema(
 {
   userId: { type: String, required: true, unique: true },
   specialty: { type: String, default: "" },
   bio: { type: String, default: "" },
   availability: [
     {
       day: String,        // "MON", "TUE"...
       from: String,       // "09:00"
       to: String,         // "12:00"
     },
   ],
 },
 { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", DoctorProfileSchema);
