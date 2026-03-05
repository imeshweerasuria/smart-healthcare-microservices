const express = require("express");
const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../shared/middleware/auth");

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

module.exports = router;