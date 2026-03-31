const cron = require("node-cron");
const express = require("express");
const axios = require("axios");

const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const TELEMEDICINE_URL = process.env.TELEMEDICINE_URL || "http://localhost:4005";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:4006";
const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";

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

    if (appt.patientPhone) {
      try {
        await axios.post(`${NOTIFICATION_URL}/notify/sms`, {
          to: appt.patientPhone,
          body: `Smart Healthcare: Appointment request created. ID: ${appt._id}`,
        });
      } catch (notifyErr) {
        console.error("Booking SMS failed:", notifyErr.message);
      }
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
        await axios.post(`${NOTIFICATION_URL}/notify/email`, {
          to: appt.patientEmail,
          subject: "Appointment Accepted - Telemedicine Link",
          text: `Your appointment is ACCEPTED.\nJoin: ${appt.telemedicineLink}\nAppointmentId: ${appt._id}`,
        });
      }

      if (appt.patientPhone) {
        try {
          await axios.post(`${NOTIFICATION_URL}/notify/sms`, {
            to: appt.patientPhone,
            body: `Smart Healthcare: Appointment accepted. Check email for details.`,
          });
        } catch (notifyErr) {
          console.error("Accepted SMS failed:", notifyErr.message);
        }
      }
    }

    await appt.save();
    res.json(appt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/confirm-payment", requireAuth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "PATIENT" && appt.patientId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

   if (appt.status === "CANCELLED" || appt.status === "REJECTED") {
  return res.status(400).json({
    message: "Cannot pay for cancelled or rejected appointment"
  });
}

    appt.paymentStatus = "PAID";
       await appt.save();

    res.json({ ok: true, appointment: appt ,message: "Payment confirmed"});
  } catch (e) {
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
      try {
        await axios.post(`${NOTIFICATION_URL}/notify/email`, {
          to: appt.patientEmail,
          subject: "Appointment Cancelled",
          text: `Your appointment ${appt._id} has been cancelled.`,
        });
      } catch (notifyErr) {
        console.error("Cancel email failed:", notifyErr.message);
      }
    }

    if (appt.patientPhone) {
      try {
        await axios.post(`${NOTIFICATION_URL}/notify/sms`, {
          to: appt.patientPhone,
          body: `Smart Healthcare: Appointment cancelled. ID: ${appt._id}`,
        });
      } catch (notifyErr) {
        console.error("Cancel SMS failed:", notifyErr.message);
      }
    }

    res.json({ message: "Appointment cancelled", appointment: appt });
  } catch (e) {
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
      try {
        await axios.post(`${NOTIFICATION_URL}/notify/email`, {
          to: appt.patientEmail,
          subject: "Appointment Rescheduled",
          text: `Your appointment ${appt._id} has been rescheduled to slot ${slotNumber}. Status reset to PENDING.`,
        });
      } catch (notifyErr) {
        console.error("Reschedule email failed:", notifyErr.message);
      }
    }

    if (appt.patientPhone) {
      try {
        await axios.post(`${NOTIFICATION_URL}/notify/sms`, {
          to: appt.patientPhone,
          body: `Smart Healthcare: Appointment rescheduled. ID: ${appt._id}`,
        });
      } catch (notifyErr) {
        console.error("Reschedule SMS failed:", notifyErr.message);
      }
    }

    res.json({ message: "Appointment rescheduled", appointment: appt });
  } catch (e) {
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

    if (appt.patientPhone) {
      try {
        await axios.post(`${NOTIFICATION_URL}/notify/sms`, {
          to: appt.patientPhone,
          body: `Smart Healthcare: Consultation completed. ID: ${appt._id}`,
        });
      } catch (notifyErr) {
        console.error("Completion SMS failed:", notifyErr.message);
      }
    }

    res.json({ message: "Appointment completed", appointment: appt });
  } catch (e) {
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

    const slots = takenSlots.map(s => s.slotNumber);

    res.json({
      doctorId,
      takenSlots: slots
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/reason", async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { reason },
      { new: true }
    );

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// Auto-cancel unpaid appointments after 5 minutes
cron.schedule("* * * * *", async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const result = await Appointment.updateMany(
      {
        status: "PENDING",
        paymentStatus: "UNPAID",
        createdAt: { $lte: fiveMinutesAgo },
      },
      { status: "CANCELLED" }
    );

    if (result.modifiedCount > 0) {
      console.log(`Auto-cancelled ${result.modifiedCount} unpaid appointments`);

      // Optional: send cancellation email for each appointment
      const cancelledAppointments = await Appointment.find({
        status: "CANCELLED",
        paymentStatus: "UNPAID",
        createdAt: { $lte: fiveMinutesAgo },
      });

      for (const appt of cancelledAppointments) {
        if (appt.patientEmail) {
          try {
            await axios.post(`${NOTIFICATION_URL}/notify/email`, {
              to: appt.patientEmail,
              subject: "Appointment Auto-Cancelled",
              text: `Your appointment ${appt._id} was automatically cancelled because payment was not received within 5 minutes.`,
            });
          } catch (notifyErr) {
            console.error("Auto-cancel email failed:", notifyErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error in auto-cancel cron:", err);
  }
});


module.exports = router;
