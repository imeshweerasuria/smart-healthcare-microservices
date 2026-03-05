const express = require("express");
const DoctorProfile = require("../models/DoctorProfile");
const { requireAuth, requireRole } = require("../../../shared/middleware/auth");

const router = express.Router();

// List doctors (public for Day2, later can be protected)
router.get("/", async (req, res) => {
 const list = await DoctorProfile.find().sort({ createdAt: -1 });
 res.json(list);
});

// Update my doctor profile
router.put("/me", requireAuth, requireRole("DOCTOR"), async (req, res) => {
 const userId = req.user.userId;
 const { specialty, bio } = req.body;

 let profile = await DoctorProfile.findOne({ userId });
 if (!profile) profile = await DoctorProfile.create({ userId });

 profile.specialty = specialty ?? profile.specialty;
 profile.bio = bio ?? profile.bio;
 await profile.save();

 res.json(profile);
});

module.exports = router;
