const mongoose = require("../../../../shared/config/mongoose");
const PrescriptionSchema = new mongoose.Schema( 
{ 
doctorId: { type: String, required: true }, 
patientId: { type: String, required: true }, 
patientName: { type: String, default: "" },
appointmentId: { type: String, default: "" }, 
meds: { type: String, required: true }, 
notes: { type: String, default: "" }, 
}, 
{ timestamps: true } 
); 
module.exports = mongoose.model("Prescription", PrescriptionSchema); 