const express = require("express"); 
const Prescription = require("../models/Prescription"); 
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth"); 
const router = express.Router();

// Doctor issues prescription 
router.post("/", requireAuth, requireRole("DOCTOR"), async (req, res) => { 
const { patientId, appointmentId, meds, notes } = req.body; 
if (!patientId || !meds) return res.status(400).json({ message: "patientId and meds required" }); 
const p = await Prescription.create({ 
doctorId: req.user.userId, 
patientId, 
appointmentId: appointmentId || "", 
meds, 
notes: notes || "", 
});

res.json(p); 
}); 

// Patient fetch their prescriptions 
router.get("/patient/me", requireAuth, requireRole("PATIENT"), async (req, res) => { 
const list = await Prescription.find({ patientId: req.user.userId }).sort({ createdAt: -1 }); 
res.json(list); 
});

module.exports = router;