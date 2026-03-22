const mongoose = require("mongoose"); 
const PrescriptionSchema = new mongoose.Schema( 
{ 
doctorId: { type: String, required: true }, 
patientId: { type: String, required: true }, 
appointmentId: { type: String, default: "" }, 
meds: { type: String, required: true }, 
notes: { type: String, default: "" }, 
}, 
{ timestamps: true } 
); 
module.exports = mongoose.model("Prescription", PrescriptionSchema); 