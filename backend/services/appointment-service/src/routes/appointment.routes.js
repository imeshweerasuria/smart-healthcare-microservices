const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const TELEMEDICINE_URL = process.env.TELEMEDICINE_URL || "http://localhost:4005";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:4006";
const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:4001";

// Queue constants
const QUEUE_ACTIVE_STATUSES = ["ACCEPTED", "CONFIRMED"];
const QUEUE_ALL_RELEVANT_STATUSES = ["ACCEPTED", "CONFIRMED", "COMPLETED"];

// ---------------- HELPERS ----------------

async function getUserContact(userId, authHeader = "") {
  const res = await axios.get(`${AUTH_URL}/auth/users/${userId}/contact`, {
    headers: authHeader ? { Authorization: authHeader } : {},
  });
  return res.data;
}

async function safeGetUserContact(userId, authHeader = "") {
  try {
    return await getUserContact(userId, authHeader);
  } catch (err) {
    console.error(
      `Failed to fetch user contact for ${userId}:`,
      err.response?.status,
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

async function loadAppointmentContacts(appt, authHeader = "") {
  const [patientContact, doctorContact] = await Promise.all([
    safeGetUserContact(appt.patientId, authHeader),
    safeGetUserContact(appt.doctorId, authHeader),
  ]);

  return {
    patientName: patientContact?.name || "Unknown Patient",
    patientEmail: patientContact?.email || appt.patientEmail || "",
    patientPhone: patientContact?.phone || appt.patientPhone || "",

    doctorName: doctorContact?.name || "Unknown Doctor",
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
Reason: ${appt.reason}
Telemedicine Link: ${appt.telemedicineLink || "Not available"}

Smart Healthcare`;

  const patientSmsText = `Smart Healthcare: Your appointment ${appt._id} is CONFIRMED. Slot ${appt.slotNumber}.`;

  const doctorEmailText = `Hello ${contacts.doctorName},

A patient appointment is now CONFIRMED.

Appointment ID: ${appt._id}
Patient ID: ${appt.patientId}
Slot Number: ${appt.slotNumber}
Payment Status: ${appt.paymentStatus}
Reason: ${appt.reason}
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
Reason: ${appt.reason}

Smart Healthcare`;

  const patientSmsText = `Smart Healthcare: Your appointment ${appt._id} has been marked COMPLETED.`;

  const doctorEmailText = `Hello ${contacts.doctorName},

This consultation has been marked as COMPLETED.

Appointment ID: ${appt._id}
Patient ID: ${appt.patientId}
Slot Number: ${appt.slotNumber}
Status: ${appt.status}
Reason: ${appt.reason}

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

function sortBySlotThenTime(a, b) {
  if ((a.slotNumber || 0) !== (b.slotNumber || 0)) {
    return (a.slotNumber || 0) - (b.slotNumber || 0);
  }
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

async function buildDoctorQueueMap(doctorIds) {
  if (!doctorIds.length) return new Map();

  const queueDocs = await Appointment.find({
    doctorId: { $in: doctorIds },
    status: { $in: QUEUE_ALL_RELEVANT_STATUSES },
  }).sort({ slotNumber: 1, createdAt: 1 });

  const map = new Map();

  doctorIds.forEach((doctorId) => {
    map.set(doctorId, []);
  });

  queueDocs.forEach((doc) => {
    if (!map.has(doc.doctorId)) {
      map.set(doc.doctorId, []);
    }
    map.get(doc.doctorId).push(doc);
  });

  return map;
}

function getQueueMetaForAppointment(appt, doctorQueue = []) {
  const activeQueue = doctorQueue
    .filter((item) => QUEUE_ACTIVE_STATUSES.includes(item.status))
    .sort(sortBySlotThenTime);

  const currentRunningSlot = activeQueue.length ? activeQueue[0].slotNumber : null;

  if (!QUEUE_ALL_RELEVANT_STATUSES.includes(appt.status)) {
    return {
      currentRunningSlot: null,
      patientsAhead: null,
      isCurrentTurn: false,
      isNextTurn: false,
      queueMessage: "Queue not active for this appointment",
    };
  }

  if (appt.status === "COMPLETED") {
    return {
      currentRunningSlot,
      patientsAhead: 0,
      isCurrentTurn: false,
      isNextTurn: false,
      queueMessage: "Appointment completed",
    };
  }

  if (currentRunningSlot === null) {
    return {
      currentRunningSlot: null,
      patientsAhead: 0,
      isCurrentTurn: false,
      isNextTurn: false,
      queueMessage: "Queue not started yet",
    };
  }

  const patientsAhead = activeQueue.filter(
    (item) => item.slotNumber < appt.slotNumber
  ).length;

  const isCurrentTurn = currentRunningSlot === appt.slotNumber;
  const isNextTurn = !isCurrentTurn && patientsAhead === 1;

  let queueMessage = "";
  if (isCurrentTurn) {
    queueMessage = `Slot ${appt.slotNumber} is running now`;
  } else if (isNextTurn) {
    queueMessage = `Current running slot is ${currentRunningSlot}. You are next`;
  } else {
    queueMessage = `Current running slot is ${currentRunningSlot}. Patients ahead: ${patientsAhead}`;
  }

  return {
    currentRunningSlot,
    patientsAhead,
    isCurrentTurn,
    isNextTurn,
    queueMessage,
  };
}

async function enrichAppointmentsWithQueue(list) {
  const doctorIds = [...new Set(list.map((item) => item.doctorId).filter(Boolean))];
  const queueMap = await buildDoctorQueueMap(doctorIds);

  return list.map((appt) => {
    const plain = appt.toObject ? appt.toObject() : appt;
    const doctorQueue = queueMap.get(appt.doctorId) || [];

    return {
      ...plain,
      queue: getQueueMetaForAppointment(appt, doctorQueue),
    };
  });
}

// ---------------- ROUTES ----------------

router.post("/", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const { doctorId, slotNumber, reason } = req.body;
    const trimmedReason = typeof reason === "string" ? reason.trim() : "";

    if (!doctorId || !slotNumber || !trimmedReason) {
      return res
        .status(400)
        .json({ message: "doctorId, slotNumber and reason are required" });
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
      reason: trimmedReason,
      status: "PENDING",
    });

    // Notify BOTH patient AND doctor on appointment creation
    const contacts = await loadAppointmentContacts(appt);

    await Promise.all([
      // Patient notifications
      sendEmailNotification(
        contacts.patientEmail,
        "Appointment Request Created",
        `Hello ${contacts.patientName},\n\nYour appointment request has been created and is currently PENDING.\n\nAppointment ID: ${appt._id}\nDoctor: ${contacts.doctorName}\nSlot Number: ${appt.slotNumber}\nReason: ${trimmedReason}\n\nSmart Healthcare`
      ),
      sendSmsNotification(
        contacts.patientPhone,
        `Smart Healthcare: Appointment request created. ID: ${appt._id}`
      ),
      
      // Doctor notifications (NEW)
      sendEmailNotification(
        contacts.doctorEmail,
        "New Appointment Request",
        `Hello ${contacts.doctorName},\n\nA new appointment request has been created.\n\nAppointment ID: ${appt._id}\nPatient: ${contacts.patientName}\nSlot Number: ${appt.slotNumber}\nReason: ${trimmedReason}\n\nSmart Healthcare`
      ),
      sendSmsNotification(
        contacts.doctorPhone,
        `Smart Healthcare: New appointment request from ${contacts.patientName}. ID: ${appt._id}`
      )
    ]);

    res.json(appt);
  } catch (e) {
    console.error("Create appointment error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const list = await Appointment.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
    const enriched = await enrichAppointmentsWithQueue(list);
    res.json(enriched);
  } catch (e) {
    console.error("Get patient appointments error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/doctor/me", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const list = await Appointment.find({ doctorId: req.user.userId }).sort({
      slotNumber: 1,
      createdAt: 1,
    });

    const authHeader = req.headers.authorization || "";

    const enrichedAppointments = await Promise.all(
      list.map(async (appt) => {
        const contacts = await loadAppointmentContacts(appt, authHeader);

        return {
          ...appt.toObject(),
          patientName: contacts.patientName || "Unknown Patient",
          doctorName: contacts.doctorName || "Unknown Doctor",
        };
      })
    );

    const enriched = await enrichAppointmentsWithQueue(enrichedAppointments);

    res.json(enriched);
  } catch (e) {
    console.error("Get doctor appointments error:", e.response?.data || e.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin route to get all appointments
router.get("/admin/all", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    const authHeader = req.headers.authorization || "";

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        const contacts = await loadAppointmentContacts(appt, authHeader);

        return {
          ...appt.toObject(),
          patientName: contacts.patientName,
          doctorName: contacts.doctorName,
        };
      })
    );

    const enrichedWithQueue = await enrichAppointmentsWithQueue(enrichedAppointments);

    res.json(enrichedWithQueue);
  } catch (e) {
    console.error("Error fetching all appointments:", e.response?.data || e.message);
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

      // Notify BOTH patient AND doctor on acceptance
      const authHeader = req.headers.authorization || "";
      const contacts = await loadAppointmentContacts(appt, authHeader);

      await Promise.all([
        // Patient notifications
        sendEmailNotification(
          contacts.patientEmail,
          "Appointment Accepted - Telemedicine Link",
          `Hello ${contacts.patientName},\n\nYour appointment has been ACCEPTED.\n\nJoin your telemedicine session: ${appt.telemedicineLink}\nAppointment ID: ${appt._id}\nDoctor: ${contacts.doctorName}\nSlot Number: ${appt.slotNumber}\nReason: ${appt.reason}\n\nSmart Healthcare`
        ),
        sendSmsNotification(
          contacts.patientPhone,
          `Smart Healthcare: Appointment accepted by Dr. ${contacts.doctorName}. Check email for telemedicine link.`
        ),
        
        // Doctor notifications (NEW)
        sendEmailNotification(
          contacts.doctorEmail,
          "Appointment Accepted",
          `Hello ${contacts.doctorName},\n\nYou have ACCEPTED an appointment.\n\nAppointment ID: ${appt._id}\nPatient: ${contacts.patientName}\nSlot Number: ${appt.slotNumber}\nReason: ${appt.reason}\nTelemedicine Link: ${appt.telemedicineLink}\n\nSmart Healthcare`
        ),
        sendSmsNotification(
          contacts.doctorPhone,
          `Smart Healthcare: You accepted appointment ${appt._id} for ${contacts.patientName}.`
        )
      ]);
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
      const authHeader = req.headers.authorization || "";
      const contacts = await loadAppointmentContacts(appt, authHeader);
      
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

    // Notify BOTH patient AND doctor on cancellation
    const authHeader = req.headers.authorization || "";
    const contacts = await loadAppointmentContacts(appt, authHeader);

    await Promise.all([
      // Patient notifications
      sendEmailNotification(
        contacts.patientEmail,
        "Appointment Cancelled",
        `Hello ${contacts.patientName},\n\nYour appointment has been CANCELLED.\n\nAppointment ID: ${appt._id}\nDoctor: ${contacts.doctorName}\nSlot Number: ${appt.slotNumber}\nReason: ${appt.reason}\n\nSmart Healthcare`
      ),
      sendSmsNotification(
        contacts.patientPhone,
        `Smart Healthcare: Appointment cancelled. ID: ${appt._id}`
      ),
      
      // Doctor notifications (NEW)
      sendEmailNotification(
        contacts.doctorEmail,
        "Appointment Cancelled by Patient",
        `Hello ${contacts.doctorName},\n\nAn appointment has been CANCELLED by the patient.\n\nAppointment ID: ${appt._id}\nPatient: ${contacts.patientName}\nSlot Number: ${appt.slotNumber}\nReason: ${appt.reason}\n\nSmart Healthcare`
      ),
      sendSmsNotification(
        contacts.doctorPhone,
        `Smart Healthcare: Patient ${contacts.patientName} cancelled appointment ${appt._id}.`
      )
    ]);

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

    const oldSlotNumber = appt.slotNumber;
    appt.slotNumber = slotNumber;
    appt.status = "PENDING";
    appt.paymentStatus = "UNPAID";
    appt.telemedicineLink = "";
    await appt.save();

    // Notify BOTH patient AND doctor on reschedule
    const authHeader = req.headers.authorization || "";
    const contacts = await loadAppointmentContacts(appt, authHeader);

    await Promise.all([
      // Patient notifications
      sendEmailNotification(
        contacts.patientEmail,
        "Appointment Rescheduled",
        `Hello ${contacts.patientName},\n\nYour appointment has been RESCHEDULED.\n\nAppointment ID: ${appt._id}\nDoctor: ${contacts.doctorName}\nOld Slot: ${oldSlotNumber}\nNew Slot: ${slotNumber}\nReason: ${appt.reason}\nStatus reset to PENDING\n\nSmart Healthcare`
      ),
      sendSmsNotification(
        contacts.patientPhone,
        `Smart Healthcare: Appointment rescheduled from slot ${oldSlotNumber} to ${slotNumber}. ID: ${appt._id}`
      ),
      
      // Doctor notifications (NEW)
      sendEmailNotification(
        contacts.doctorEmail,
        "Appointment Rescheduled by Patient",
        `Hello ${contacts.doctorName},\n\nAn appointment has been RESCHEDULED by the patient.\n\nAppointment ID: ${appt._id}\nPatient: ${contacts.patientName}\nOld Slot: ${oldSlotNumber}\nNew Slot: ${slotNumber}\nReason: ${appt.reason}\nStatus reset to PENDING\n\nSmart Healthcare`
      ),
      sendSmsNotification(
        contacts.doctorPhone,
        `Smart Healthcare: Patient ${contacts.patientName} rescheduled appointment ${appt._id} from slot ${oldSlotNumber} to ${slotNumber}.`
      )
    ]);

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
    const trimmedReason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";

    if (!trimmedReason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { reason: trimmedReason },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("Update reason error:", err.message);
    res.status(500).json({ message: "Update failed" });
  }
});

router.put("/:id/mark-refunded", async (req, res) => {
  try {
    console.log("➡️ Mark refunded called for:", req.params.id);

    // ✅ VALIDATE OBJECT ID FIRST
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ Invalid ObjectId");
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      console.log("❌ Appointment not found");
      return res.status(404).json({ message: "Appointment not found" });
    }

    appt.paymentStatus = "REFUNDED";
    await appt.save();

    console.log("✅ Appointment marked REFUNDED");

    res.json({
      ok: true,
      message: "Appointment marked as REFUNDED",
      appointment: appt
    });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;