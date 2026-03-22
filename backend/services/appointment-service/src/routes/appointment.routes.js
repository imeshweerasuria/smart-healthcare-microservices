const express = require("express");
const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

// Create appointment (PATIENT)
router.post("/", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const { doctorId, datetime, reason } = req.body;
   if (!doctorId || !datetime)
     return res.status(400).json({ message: "doctorId and datetime required" });

   const appt = await Appointment.create({
     patientId: req.user.userId,
     doctorId,
     datetime: new Date(datetime),
     reason: reason || "",
     status: "PENDING",
   });

   res.json(appt);
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// My appointments (PATIENT)
router.get("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
 const list = await Appointment.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
 res.json(list);
});

// Doctor appointments (DOCTOR)
router.get("/doctor/me", requireAuth, requireRole("DOCTOR"), async (req, res) => {
 const list = await Appointment.find({ doctorId: req.user.userId }).sort({ createdAt: -1 });
 res.json(list);
});

// Doctor accept/reject (DOCTOR)
router.put("/:id/status", requireAuth, requireRole("DOCTOR"), async (req, res) => {
 try {
   const { status } = req.body; // ACCEPTED or REJECTED
   if (!["ACCEPTED", "REJECTED"].includes(status)) {
     return res.status(400).json({ message: "status must be ACCEPTED or REJECTED" });
   }

   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Appointment not found" });

   // doctor can only update their own appointment
   if (appt.doctorId !== req.user.userId) {
     return res.status(403).json({ message: "Forbidden" });
   }

   // only allow changing when pending
   if (appt.status !== "PENDING") {
     return res.status(400).json({ message: "Only PENDING appointments can be updated" });
   }

   appt.status = status;
   await appt.save();

   res.json(appt);
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

module.exports = router;
