const express = require("express");
const axios = require("axios");
const Prescription = require("../models/Prescription");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const AUTH_URL = process.env.AUTH_URL || "http://localhost:4001";

// helper: get auth user contact/info from auth-service
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

// Doctor issues prescription
router.post("/", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const { patientId, appointmentId, meds, notes } = req.body;

    if (!patientId || !meds) {
      return res.status(400).json({ message: "patientId and meds required" });
    }

    const authHeader = req.headers.authorization || "";
    const patientContact = await safeGetUserContact(patientId, authHeader);

    const p = await Prescription.create({
      doctorId: req.user.userId,
      patientId,
      patientName: patientContact?.name || "",
      appointmentId: appointmentId || "",
      meds,
      notes: notes || "",
    });

    res.json({
      ...p.toObject(),
      patientName: patientContact?.name || "Unknown Patient",
    });
  } catch (e) {
    console.error("Create prescription error:", e.response?.data || e.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Patient fetch their prescriptions
router.get("/patient/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
  try {
    const list = await Prescription.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error("Get patient prescriptions error:", e.response?.data || e.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Doctor fetch own issued prescriptions
router.get("/doctor/me", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const list = await Prescription.find({ doctorId: req.user.userId }).sort({ createdAt: -1 });
    const authHeader = req.headers.authorization || "";

    const enriched = await Promise.all(
      list.map(async (p) => {
        const patientContact = await safeGetUserContact(p.patientId, authHeader);

        return {
          ...p.toObject(),
          patientName:
            patientContact?.name ||
            p.patientName ||
            "Unknown Patient",
        };
      })
    );

    res.json(enriched);
  } catch (e) {
    console.error("Get doctor prescriptions error:", e.response?.data || e.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;