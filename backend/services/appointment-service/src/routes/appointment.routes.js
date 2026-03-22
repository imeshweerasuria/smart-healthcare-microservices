const express = require("express");
const axios = require("axios");

const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

// ENV URLs
const TELEMEDICINE_URL = process.env.TELEMEDICINE_URL || "http://localhost:4005";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:4006";

// Create appointment (PATIENT)
router.post("/", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const { doctorId, datetime, reason } = req.body;

    if (!doctorId || !datetime) {
      return res.status(400).json({ message: "doctorId and datetime required" });
    }

    const appt = await Appointment.create({
      patientId: req.user.userId,
      patientEmail: req.user.email || "", // ✅ 1B added
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

    // ✅ 1C: If ACCEPTED → generate telemedicine link + notify email
    if (status === "ACCEPTED") {
      // 1) Generate telemedicine link
      const tele = await axios.post(`${TELEMEDICINE_URL}/telemedicine/session`, {
        appointmentId: appt._id.toString(),
      });

      appt.telemedicineLink = tele.data.meetingUrl || "";

      // 2) Notify patient via email
      if (appt.patientEmail) {
        await axios.post(`${NOTIFICATION_URL}/notify/email`, {
          to: appt.patientEmail,
          subject: "Appointment Accepted - Telemedicine Link",
          text: `Your appointment is ACCEPTED.\nJoin: ${appt.telemedicineLink}\nAppointmentId: ${appt._id}`,
        });
      }
    }

    await appt.save();

    res.json(appt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 1D: Confirm payment (PATIENT or service)
router.put("/:id/confirm-payment", requireAuth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    // patient can only confirm their own appointment
    if (req.user.role === "PATIENT" && appt.patientId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (appt.status !== "ACCEPTED") {
      return res.status(400).json({ message: "Appointment must be ACCEPTED first" });
    }

    appt.paymentStatus = "PAID";
    appt.status = "CONFIRMED"; // 🔥 new state after payment
    await appt.save();

    res.json({ ok: true, appointment: appt });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;