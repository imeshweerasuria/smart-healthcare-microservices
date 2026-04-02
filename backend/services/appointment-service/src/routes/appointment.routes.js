const express = require("express");
const axios = require("axios");

const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const TELEMEDICINE_URL = process.env.TELEMEDICINE_URL || "http://localhost:4005";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:4006";
const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:4001";

// ---------------- HELPERS ----------------

async function getUserContact(userId) {
  // IMPORTANT:
  // This assumes auth-service server uses: app.use("/auth", authRoutes)
  // If your auth-service mount path is different, only change this one URL.
  const res = await axios.get(`${AUTH_URL}/auth/users/${userId}/contact`);
  return res.data;
}

async function safeGetUserContact(userId) {
  try {
    return await getUserContact(userId);
  } catch (err) {
    console.error(
      `Failed to fetch user contact for ${userId}:`,
      err.response?.data || err.message
    );
    return null;
  }
}

async function sendEmailNotification(to, subject, text) {
  if (!to) return;

  try {
    await axios.post(`${NOTIFICATION_URL}/notify/email`, {
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error(
      `Email notify failed for ${to}:`,
      err.response?.data || err.message
    );
  }
}

async function sendSmsNotification(to, body) {
  if (!to) return;

  try {
    await axios.post(`${NOTIFICATION_URL}/notify/sms`, {
      to,
      body,
    });
  } catch (err) {
    console.error(
      `SMS notify failed for ${to}:`,
      err.response?.data || err.message
    );
  }
}

async function loadAppointmentContacts(appt) {
  const [patientContact, doctorContact] = await Promise.all([
    safeGetUserContact(appt.patientId),
    safeGetUserContact(appt.doctorId),
  ]);

  return {
    patientName: patientContact?.name || "Patient",
    patientEmail: patientContact?.email || appt.patientEmail || "",
    patientPhone: patientContact?.phone || appt.patientPhone || "",

    doctorName: doctorContact?.name || "Doctor",
    doctorEmail: doctorContact?.email || "",
    doctorPhone: doctorContact?.phone || "",
  };
}

async function notifyConfirmedToBoth(appt) {
  const contacts = await loadAppointmentContacts(appt);

  const patientEmailText = `Hello ${contacts.patientName},

Your appointment has been CONFIRMED.

Appointment ID: ${appt._id}
Doctor ID: ${appt.doctorId}
Slot Number: ${appt.slotNumber}
Payment Status: ${appt.paymentStatus}
Telemedicine Link: ${appt.telemedicineLink || "Not available"}

Smart Healthcare`;

  const patientSmsText = `Smart Healthcare: Your appointment ${appt._id} is CONFIRMED. Slot ${appt.slotNumber}.`;

  const doctorEmailText = `Hello ${contacts.doctorName},

A patient appointment is now CONFIRMED.

Appointment ID: ${appt._id}
Patient ID: ${appt.patientId}
Slot Number: ${appt.slotNumber}
Payment Status: ${appt.paymentStatus}
Telemedicine Link: ${appt.telemedicineLink || "Not available"}

Smart Healthcare`;

  const doctorSmsText = `Smart Healthcare: Appointment ${appt._id} is CONFIRMED for slot ${appt.slotNumber}.`;

  await Promise.all([
    sendEmailNotification(
      contacts.patientEmail,
      "Appointment Confirmed",
      patientEmailText
    ),
    sendSmsNotification(contacts.patientPhone, patientSmsText),

    sendEmailNotification(
      contacts.doctorEmail,
      "Appointment Confirmed",
      doctorEmailText
    ),
    sendSmsNotification(contacts.doctorPhone, doctorSmsText),
  ]);
}

async function notifyCompletedToBoth(appt) {
  const contacts = await loadAppointmentContacts(appt);

  const patientEmailText = `Hello ${contacts.patientName},

Your consultation has been marked as COMPLETED.

Appointment ID: ${appt._id}
Doctor ID: ${appt.doctorId}
Slot Number: ${appt.slotNumber}
Status: ${appt.status}

Smart Healthcare`;

  const patientSmsText = `Smart Healthcare: Your appointment ${appt._id} has been marked COMPLETED.`;

  const doctorEmailText = `Hello ${contacts.doctorName},

This consultation has been marked as COMPLETED.

Appointment ID: ${appt._id}
Patient ID: ${appt.patientId}
Slot Number: ${appt.slotNumber}
Status: ${appt.status}

Smart Healthcare`;

  const doctorSmsText = `Smart Healthcare: Appointment ${appt._id} has been marked COMPLETED.`;

  await Promise.all([
    sendEmailNotification(
      contacts.patientEmail,
      "Consultation Completed",
      patientEmailText
    ),
    sendSmsNotification(contacts.patientPhone, patientSmsText),

    sendEmailNotification(
      contacts.doctorEmail,
      "Consultation Completed",
      doctorEmailText
    ),
    sendSmsNotification(contacts.doctorPhone, doctorSmsText),
  ]);
}

// ---------------- ROUTES ----------------

router.post("/", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const { doctorId, slotNumber, reason } = req.body;

    if (!doctorId || !slotNumber) {
      return res.status(400).json({ message: "doctorId and slotNumber required" });
    }

    if (slotNumber < 1 || slotNumber > 10) {
      return res.status(400).json({ message: "slotNumber must be between 1 and 10" });
    }

    // Check doctor exists
    const doctorCheck = await axios.get(`${DOCTOR_URL}/doctors`);
    const doctorExists = doctorCheck.data.some((d) => d.userId === doctorId);
    if (!doctorExists) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if slot is already taken
    const taken = await Appointment.findOne({
      doctorId,
      slotNumber,
      status: { $in: ["PENDING", "ACCEPTED", "CONFIRMED"] },
    });

    if (taken) {
      return res.status(409).json({ message: "This slot is already taken" });
    }

    const appt = await Appointment.create({
      patientId: req.user.userId,
      patientEmail: req.user.email || "",
      patientPhone: req.user.phone || "",
      doctorId,
      slotNumber,
      reason: reason || "",
      status: "PENDING",
    });

    if (appt.patientEmail) {
      await sendEmailNotification(
        appt.patientEmail,
        "Appointment Request Created",
        `Your appointment request has been created and is currently PENDING.\nAppointment ID: ${appt._id}`
      );
    }

    if (appt.patientPhone) {
      await sendSmsNotification(
        appt.patientPhone,
        `Smart Healthcare: Appointment request created. ID: ${appt._id}`
      );
    }

    res.json(appt);
  } catch (e) {
    console.error("Create appointment error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
  const list = await Appointment.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
  res.json(list);
});

router.get("/doctor/me", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  const list = await Appointment.find({ doctorId: req.user.userId }).sort({ createdAt: -1 });
  res.json(list);
});

// Admin route to get all appointments
router.get("/admin/all", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (e) {
    console.error("Error fetching all appointments:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

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
        await sendEmailNotification(
          appt.patientEmail,
          "Appointment Accepted - Telemedicine Link",
          `Your appointment is ACCEPTED.\nJoin: ${appt.telemedicineLink}\nAppointment ID: ${appt._id}`
        );
      }

      if (appt.patientPhone) {
        await sendSmsNotification(
          appt.patientPhone,
          `Smart Healthcare: Appointment accepted. Check email for details.`
        );
      }
    }

    await appt.save();
    res.json(appt);
  } catch (e) {
    console.error("Update status error:", e.response?.data || e.message || e);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/confirm-payment", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    if (appt.patientId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Mark as paid
    appt.paymentStatus = "PAID";

    // Only CONFIRM if doctor already accepted
    if (appt.status === "ACCEPTED") {
      appt.status = "CONFIRMED";

      // Notify both patient & doctor
      await notifyConfirmedToBoth(appt);
    }

    await appt.save();

    res.json({ ok: true, appointment: appt });
  } catch (e) {
    console.error("Confirm payment error:", e.response?.data || e.message || e);
    res.status(500).json({ message: "Server error" });
  }
});


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

    if (appt.patientEmail) {
      await sendEmailNotification(
        appt.patientEmail,
        "Appointment Cancelled",
        `Your appointment ${appt._id} has been cancelled.`
      );
    }

    if (appt.patientPhone) {
      await sendSmsNotification(
        appt.patientPhone,
        `Smart Healthcare: Appointment cancelled. ID: ${appt._id}`
      );
    }

    res.json({ message: "Appointment cancelled", appointment: appt });
  } catch (e) {
    console.error("Cancel appointment error:", e.response?.data || e.message || e);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/reschedule", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const { slotNumber } = req.body;

    if (!slotNumber || slotNumber < 1 || slotNumber > 10) {
      return res.status(400).json({ message: "slotNumber must be between 1 and 10" });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (appt.patientId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["PENDING", "ACCEPTED"].includes(appt.status)) {
      return res.status(400).json({ message: "Appointment cannot be rescheduled now" });
    }

    const overlapping = await Appointment.findOne({
      _id: { $ne: appt._id },
      doctorId: appt.doctorId,
      slotNumber,
      status: { $in: ["PENDING", "ACCEPTED", "CONFIRMED"] },
    });

    if (overlapping) {
      return res.status(409).json({ message: "This slot is already taken" });
    }

    appt.slotNumber = slotNumber;
    appt.status = "PENDING";
    appt.paymentStatus = "UNPAID";
    appt.telemedicineLink = "";
    await appt.save();

    if (appt.patientEmail) {
      await sendEmailNotification(
        appt.patientEmail,
        "Appointment Rescheduled",
        `Your appointment ${appt._id} has been rescheduled to slot ${slotNumber}. Status reset to PENDING.`
      );
    }

    if (appt.patientPhone) {
      await sendSmsNotification(
        appt.patientPhone,
        `Smart Healthcare: Appointment rescheduled. ID: ${appt._id}`
      );
    }

    res.json({ message: "Appointment rescheduled", appointment: appt });
  } catch (e) {
    console.error("Reschedule appointment error:", e.response?.data || e.message || e);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/complete", requireAuth, requireRole("DOCTOR", "ADMIN"), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role === "DOCTOR" && appt.doctorId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    appt.status = "COMPLETED";
    await appt.save();

    // REQUIRED CASE 2:
    // On COMPLETED -> send SMS + Email to BOTH patient and doctor
    await notifyCompletedToBoth(appt);

    res.json({ message: "Appointment completed", appointment: appt });
  } catch (e) {
    console.error("Complete appointment error:", e.response?.data || e.message || e);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/doctor/:doctorId/slots", requireAuth, async (req, res) => {
  try {
    const { doctorId } = req.params;

    const takenSlots = await Appointment.find({
      doctorId,
      status: { $in: ["PENDING", "ACCEPTED", "CONFIRMED"] }
    }).select("slotNumber");

    const slots = takenSlots.map((s) => s.slotNumber);

    res.json({
      doctorId,
      takenSlots: slots
    });
  } catch (e) {
    console.error("Get doctor slots error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/reason", requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { reason },
      { new: true }
    );

    res.json(appointment);
  } catch (err) {
    console.error("Update reason error:", err.message);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;