const express = require("express");
const multer = require("multer");
const PatientProfile = require("../models/PatientProfile");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");
const axios = require("axios");
const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";

const router = express.Router();

const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, "uploads"),
 filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Get my profile
router.get("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
 const userId = req.user.userId;
 let profile = await PatientProfile.findOne({ userId });
 if (!profile) profile = await PatientProfile.create({ userId });
 res.json(profile);
});

// Update my profile
router.put("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
 const userId = req.user.userId;
 const { phone, address } = req.body;

 let profile = await PatientProfile.findOne({ userId });
 if (!profile) profile = await PatientProfile.create({ userId });

 profile.phone = phone ?? profile.phone;
 profile.address = address ?? profile.address;
 await profile.save();

 res.json(profile);
});

// Upload report
router.post(
 "/me/reports",
 requireAuth,
 requireRole("PATIENT"),
 upload.single("report"),
 async (req, res) => {
   const userId = req.user.userId;
   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

   let profile = await PatientProfile.findOne({ userId });
   if (!profile) profile = await PatientProfile.create({ userId });

   profile.reports.push({
     filename: req.file.filename,
     originalName: req.file.originalname,
   });
   await profile.save();

   res.json({ message: "Uploaded", file: req.file.filename });
 }
);

// Get my prescriptions
router.get("/me/prescriptions", requireAuth, requireRole("PATIENT"), async (req, res) => {
 const r = await axios.get(`${DOCTOR_URL}/prescriptions/patient/me`, {
   headers: { Authorization: req.headers.authorization },
 });
 res.json(r.data);
});

module.exports = router;