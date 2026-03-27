const express = require("express");
const axios = require("axios");

const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const TELEMEDICINE_URL = process.env.TELEMEDICINE_URL || "http://localhost:4005";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:4006";
const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";

// Create appointment (PATIENT)
router.post("/", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const { doctorId, datetime, reason } = req.body;

   if (!doctorId || !datetime) {
     return res.status(400).json({ message: "doctorId and datetime required" });
   }

   const parsedDate = new Date(datetime);
   if (Number.isNaN(parsedDate.getTime())) {
     return res.status(400).json({ message: "Invalid datetime" });
   }

   if (parsedDate <= new Date()) {
     return res.status(400).json({ message: "Appointment must be in the future" });
   }

   const doctorCheck = await axios.get(`${DOCTOR_URL}/doctors`);
   const doctorExists = doctorCheck.data.some((d) => d.userId === doctorId);
   if (!doctorExists) {
     return res.status(404).json({ message: "Doctor not found" });
   }

   const overlapping = await Appointment.findOne({
     doctorId,
     datetime: parsedDate,
     status: { $in: ["PENDING", "ACCEPTED", "CONFIRMED"] },
   });

   if (overlapping) {
     return res.status(409).json({ message: "This slot is already taken" });
   }

   const appt = await Appointment.create({
     patientId: req.user.userId,
     patientEmail: req.user.email || "",
     doctorId,
     datetime: parsedDate,
     reason: reason || "",
     status: "PENDING",
   });

   if (appt.patientEmail) {
     try {
       await axios.post(`${NOTIFICATION_URL}/notify/email`, {
         to: appt.patientEmail,
         subject: "Appointment Request Created",
         text: `Your appointment request has been created and is currently PENDING.\nAppointment ID: ${appt._id}`,
       });
     } catch (notifyErr) {
       console.error("Booking email failed:", notifyErr.message);
     }
   }

   res.json(appt);
 } catch (e) {
   console.error("Create appointment error:", e.message);
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

// Get single appointment
router.get("/:id", requireAuth, async (req, res) => {
 try {
   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Appointment not found" });

   const isPatientOwner = req.user.role === "PATIENT" && appt.patientId === req.user.userId;
   const isDoctorOwner = req.user.role === "DOCTOR" && appt.doctorId === req.user.userId;
   const isAdmin = req.user.role === "ADMIN";

   if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
     return res.status(403).json({ message: "Forbidden" });
   }

   res.json(appt);
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Doctor accept/reject
router.put("/:id/status", requireAuth, requireRole("DOCTOR"), async (req, res) => {
 try {
   const { status } = req.body;

   if (!["ACCEPTED", "REJECTED"].includes(status)) {
     return res.status(400).json({ message: "status must be ACCEPTED or REJECTED" });
   }

   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Appointment not found" });

   if (appt.doctorId !== req.user.userId) {
     return res.status(403).json({ message: "Forbidden" });
   }

   if (appt.status !== "PENDING") {
     return res.status(400).json({ message: "Only PENDING appointments can be updated" });
   }

   appt.status = status;

   if (status === "ACCEPTED") {
     const tele = await axios.post(`${TELEMEDICINE_URL}/telemedicine/session`, {
       appointmentId: appt._id.toString(),
     });

     appt.telemedicineLink = tele.data.meetingUrl || "";

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

// Confirm payment
router.put("/:id/confirm-payment", requireAuth, async (req, res) => {
 try {
   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Not found" });

   if (req.user.role === "PATIENT" && appt.patientId !== req.user.userId) {
     return res.status(403).json({ message: "Forbidden" });
   }

   if (appt.status !== "ACCEPTED") {
     return res.status(400).json({ message: "Appointment must be ACCEPTED first" });
   }

   appt.paymentStatus = "PAID";
   appt.status = "CONFIRMED";
   await appt.save();

   res.json({ ok: true, appointment: appt });
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Cancel appointment (PATIENT)
router.patch("/:id/cancel", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Appointment not found" });

   if (appt.patientId !== req.user.userId) {
     return res.status(403).json({ message: "Forbidden" });
   }

   if (["COMPLETED", "CANCELLED", "REJECTED"].includes(appt.status)) {
     return res.status(400).json({ message: "Appointment cannot be cancelled now" });
   }

   appt.status = "CANCELLED";
   await appt.save();

   res.json({ message: "Appointment cancelled", appointment: appt });
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Reschedule appointment (PATIENT)
router.patch("/:id/reschedule", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const { datetime } = req.body;

   if (!datetime) {
     return res.status(400).json({ message: "New datetime required" });
   }

   const parsedDate = new Date(datetime);
   if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
     return res.status(400).json({ message: "Invalid datetime" });
   }

   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Appointment not found" });

   if (appt.patientId !== req.user.userId) {
     return res.status(403).json({ message: "Forbidden" });
   }

   if (!["PENDING", "ACCEPTED"].includes(appt.status)) {
     return res.status(400).json({ message: "Appointment cannot be rescheduled now" });
   }

   appt.datetime = parsedDate;
   appt.status = "PENDING";
   appt.paymentStatus = "UNPAID";
   appt.telemedicineLink = "";
   await appt.save();

   res.json({ message: "Appointment rescheduled", appointment: appt });
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Complete appointment (DOCTOR or ADMIN)
router.patch("/:id/complete", requireAuth, requireRole("DOCTOR", "ADMIN"), async (req, res) => {
 try {
   const appt = await Appointment.findById(req.params.id);
   if (!appt) return res.status(404).json({ message: "Appointment not found" });

   if (req.user.role === "DOCTOR" && appt.doctorId !== req.user.userId) {
     return res.status(403).json({ message: "Forbidden" });
   }

   appt.status = "COMPLETED";
   await appt.save();

   if (appt.patientEmail) {
     try {
       await axios.post(`${NOTIFICATION_URL}/notify/email`, {
         to: appt.patientEmail,
         subject: "Consultation Completed",
         text: `Your consultation for appointment ${appt._id} has been marked as COMPLETED.`,
       });
     } catch (notifyErr) {
       console.error("Completion email failed:", notifyErr.message);
     }
   }

   res.json({ message: "Appointment completed", appointment: appt });
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

module.exports = router;
