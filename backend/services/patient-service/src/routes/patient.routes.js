const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const PatientProfile = require("../models/PatientProfile");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");
const axios = require("axios");

const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";
const PATIENT_PUBLIC_BASE =
 process.env.PATIENT_PUBLIC_BASE || "http://localhost:4002";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
 fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, uploadDir),
 filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
 const allowed = [
   "application/pdf",
   "image/png",
   "image/jpeg",
   "image/jpg",
 ];

 if (!allowed.includes(file.mimetype)) {
   return cb(new Error("Only PDF, PNG, JPG files are allowed"));
 }

 cb(null, true);
};

const upload = multer({
 storage,
 fileFilter,
 limits: { fileSize: 5 * 1024 * 1024 },
});

function serializeReport(report) {
 return {
   ...report.toObject?.() || report,
   downloadUrl: `${PATIENT_PUBLIC_BASE}/uploads/${report.filename}`,
 };
}

// Get my profile
router.get("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const userId = req.user.userId;
   let profile = await PatientProfile.findOne({ userId });
   if (!profile) profile = await PatientProfile.create({ userId });
   res.json(profile);
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Update my profile
router.put("/me", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const userId = req.user.userId;
   const {
     dateOfBirth,
     gender,
     phone,
     address,
     medicalHistory,
     allergies,
     chronicConditions,
   } = req.body;

   let profile = await PatientProfile.findOne({ userId });
   if (!profile) profile = await PatientProfile.create({ userId });

   profile.dateOfBirth = dateOfBirth ?? profile.dateOfBirth;
   profile.gender = gender ?? profile.gender;
   profile.phone = phone ?? profile.phone;
   profile.address = address ?? profile.address;
   profile.medicalHistory = medicalHistory ?? profile.medicalHistory;
   profile.allergies = Array.isArray(allergies) ? allergies : profile.allergies;
   profile.chronicConditions = Array.isArray(chronicConditions)
     ? chronicConditions
     : profile.chronicConditions;

   await profile.save();
   res.json(profile);
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Upload report
router.post(
 "/me/reports",
 requireAuth,
 requireRole("PATIENT"),
 upload.single("report"),
 async (req, res) => {
   try {
     const userId = req.user.userId;
     if (!req.file) {
       return res.status(400).json({ message: "No file uploaded" });
     }

     let profile = await PatientProfile.findOne({ userId });
     if (!profile) profile = await PatientProfile.create({ userId });

     profile.reports.push({
       filename: req.file.filename,
       originalName: req.file.originalname,
     });

     await profile.save();

     const lastReport = profile.reports[profile.reports.length - 1];

     res.json({
       message: "Uploaded",
       file: req.file.filename,
       report: serializeReport(lastReport),
     });
   } catch (e) {
     res.status(500).json({ message: "Upload failed" });
   }
 }
);

// Get my reports
router.get("/me/reports", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const userId = req.user.userId;
   let profile = await PatientProfile.findOne({ userId });
   if (!profile) profile = await PatientProfile.create({ userId });

   res.json((profile.reports || []).map(serializeReport));
 } catch (e) {
   res.status(500).json({ message: "Server error" });
 }
});

// Delete my report
router.delete(
 "/me/reports/:filename",
 requireAuth,
 requireRole("PATIENT"),
 async (req, res) => {
   try {
     const userId = req.user.userId;
     const { filename } = req.params;

     let profile = await PatientProfile.findOne({ userId });
     if (!profile) {
       return res.status(404).json({ message: "Patient profile not found" });
     }

     const exists = profile.reports.some((r) => r.filename === filename);
     if (!exists) {
       return res.status(404).json({ message: "Report not found" });
     }

     profile.reports = profile.reports.filter((r) => r.filename !== filename);
     await profile.save();

     const filePath = path.join(uploadDir, filename);
     if (fs.existsSync(filePath)) {
       fs.unlinkSync(filePath);
     }

     res.json({ message: "Report deleted successfully" });
   } catch (e) {
     res.status(500).json({ message: "Server error" });
   }
 }
);

// Get patient full profile (DOCTOR or ADMIN)
router.get(
 "/:patientId/profile",
 requireAuth,
 requireRole("DOCTOR", "ADMIN"),
 async (req, res) => {
   try {
     const profile = await PatientProfile.findOne({ userId: req.params.patientId });
     if (!profile) {
       return res.status(404).json({ message: "Patient profile not found" });
     }

     res.json(profile);
   } catch (e) {
     res.status(500).json({ message: "Server error" });
   }
 }
);

// Get reports of a patient (DOCTOR or ADMIN)
router.get(
 "/:patientId/reports",
 requireAuth,
 requireRole("DOCTOR", "ADMIN"),
 async (req, res) => {
   try {
     const profile = await PatientProfile.findOne({ userId: req.params.patientId });
     if (!profile) {
       return res.status(404).json({ message: "Patient profile not found" });
     }

     res.json((profile.reports || []).map(serializeReport));
   } catch (e) {
     res.status(500).json({ message: "Server error" });
   }
 }
);

// Get my prescriptions
router.get("/me/prescriptions", requireAuth, requireRole("PATIENT"), async (req, res) => {
 try {
   const r = await axios.get(`${DOCTOR_URL}/prescriptions/patient/me`, {
     headers: { Authorization: req.headers.authorization },
   });
   res.json(r.data);
 } catch (e) {
   res.status(500).json({ message: "Failed to fetch prescriptions" });
 }
});

module.exports = router;
