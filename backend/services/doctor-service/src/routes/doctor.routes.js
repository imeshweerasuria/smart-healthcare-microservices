const express = require("express"); 
const axios = require("axios"); 
const DoctorProfile = require("../models/DoctorProfile"); 
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth"); 
const router = express.Router(); 
const PATIENT_URL = process.env.PATIENT_URL || "http://localhost:4002"; 
// List doctors (with optional specialty filter) 
router.get("/", async (req, res) => { 
try { 
const { specialty } = req.query; 
const query = {}; 
if (specialty) { 
query.specialty = { $regex: specialty, $options: "i" }; 
} 
const list = await DoctorProfile.find(query).sort({ createdAt: -1 }); 
res.json(list); 
} catch (e) { 
res.status(500).json({ message: "Server error" }); 
} 
}); 
// Get single doctor by doctor userId 
router.get("/:doctorUserId", async (req, res) => { 
 try { 
   const profile = await DoctorProfile.findOne({ userId: req.params.doctorUserId }); 
   if (!profile) return res.status(404).json({ message: "Doctor not found" }); 
   res.json(profile); 
 } catch (e) { 
   res.status(500).json({ message: "Server error" }); 
 } 
}); 
 
// Get my doctor profile 
router.get("/me", requireAuth, requireRole("DOCTOR"), async (req, res) => { 
 try { 
   const userId = req.user.userId; 
   let profile = await DoctorProfile.findOne({ userId }); 
   if (!profile) profile = await DoctorProfile.create({ userId }); 
   res.json(profile); 
 } catch (e) { 
   res.status(500).json({ message: "Server error" }); 
 } 
}); 
 
// Update my doctor profile 
router.put("/me", requireAuth, requireRole("DOCTOR"), async (req, res) => { 
 try { 
   const userId = req.user.userId; 
   const { specialty, bio } = req.body; 
 
   let profile = await DoctorProfile.findOne({ userId }); 
   if (!profile) profile = await DoctorProfile.create({ userId }); 
 
   profile.specialty = specialty ?? profile.specialty; 
   profile.bio = bio ?? profile.bio; 
   await profile.save(); 
 
   res.json(profile); 
 } catch (e) { 
   res.status(500).json({ message: "Server error" }); 
 } 
}); 
 
// Update availability 
router.put("/me/availability", requireAuth, requireRole("DOCTOR"), async (req, res) => { 
 try { 
   const userId = req.user.userId; 
   const { availability } = req.body; 
 
   if (!Array.isArray(availability)) { 
     return res.status(400).json({ message: "availability must be an array" }); 
   } 
 
   let profile = await DoctorProfile.findOne({ userId }); 
   if (!profile) profile = await DoctorProfile.create({ userId }); 
 
   profile.availability = availability; 
   await profile.save(); 
 
   res.json(profile); 
 } catch (e) { 
   res.status(500).json({ message: "Server error" }); 
 } 
}); 
 
// View patient full profile 
router.get( 
 "/patient/:patientId/profile", 
 requireAuth, 
 requireRole("DOCTOR", "ADMIN"), 
 async (req, res) => { 
   try { 
     const r = await axios.get( 
       `${PATIENT_URL}/patients/${req.params.patientId}/profile`, 
       { 
         headers: { Authorization: req.headers.authorization }, 
       } 
     ); 
 
     res.json(r.data); 
   } catch (e) { 
     console.error("Fetch patient profile error:", e.message); 
     res.status(500).json({ message: "Failed to fetch patient profile" }); 
   } 
 } 
); 
 
// View patient uploaded reports 
router.get( 
 "/patient/:patientId/reports", 
 requireAuth, 
 requireRole("DOCTOR", "ADMIN"), 
 async (req, res) => { 
   try { 
     const r = await axios.get( 
       `${PATIENT_URL}/patients/${req.params.patientId}/reports`, 
       { 
         headers: { Authorization: req.headers.authorization }, 
       } 
     ); 
 
     res.json(r.data); 
   } catch (e) { 
     console.error("Fetch patient reports error:", e.message); 
     res.status(500).json({ message: "Failed to fetch patient reports" }); 
   } 
 } 
); 
 
module.exports = router; 