const express = require("express");
const axios = require("axios");
const DoctorProfile = require("../models/DoctorProfile");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();
const PATIENT_URL = process.env.PATIENT_URL || "http://localhost:4002";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:4001";

// helper: get auth user contact/info from auth-service
async function getUserContact(userId) {
  const res = await axios.get(`${AUTH_URL}/auth/users/${userId}/contact`);
  return res.data;
}

// List doctors (with optional specialty filter)
router.get("/", async (req, res) => {
  try {
    const { specialty } = req.query;
    const query = {};

    if (specialty) {
      query.specialty = { $regex: specialty, $options: "i" };
    }

    const profiles = await DoctorProfile.find(query).sort({ createdAt: -1 });

    const enrichedDoctors = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const user = await getUserContact(profile.userId);

          // show only actual doctors, ideally verified and enabled
          if (user.role !== "DOCTOR") return null;
          if (user.isDisabled) return null;
          if (!user.doctorVerified) return null;

          return {
            _id: profile._id,
            userId: profile.userId,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            doctorVerified: user.doctorVerified,
            specialty: profile.specialty || "",
            bio: profile.bio || "",
            availability: profile.availability || [],
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          };
        } catch (err) {
          console.error(`Failed to enrich doctor ${profile.userId}:`, err.message);
          return null;
        }
      })
    );

    res.json(enrichedDoctors.filter(Boolean));
  } catch (e) {
    console.error("List doctors error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get my doctor profile
router.get("/me", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const userId = req.user.userId;
    let profile = await DoctorProfile.findOne({ userId });

    if (!profile) profile = await DoctorProfile.create({ userId });

    let user = null;
    try {
      user = await getUserContact(userId);
    } catch (err) {
      console.error("Failed to fetch doctor contact:", err.message);
    }

    res.json({
      _id: profile._id,
      userId: profile.userId,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      doctorVerified: user?.doctorVerified || false,
      specialty: profile.specialty || "",
      bio: profile.bio || "",
      availability: profile.availability || [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (e) {
    console.error("Get /me doctor profile error:", e.message);
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

    let user = null;
    try {
      user = await getUserContact(userId);
    } catch (err) {
      console.error("Failed to fetch doctor contact after update:", err.message);
    }

    res.json({
      _id: profile._id,
      userId: profile.userId,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      doctorVerified: user?.doctorVerified || false,
      specialty: profile.specialty || "",
      bio: profile.bio || "",
      availability: profile.availability || [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (e) {
    console.error("Update /me doctor profile error:", e.message);
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

    let user = null;
    try {
      user = await getUserContact(userId);
    } catch (err) {
      console.error("Failed to fetch doctor contact after availability update:", err.message);
    }

    res.json({
      _id: profile._id,
      userId: profile.userId,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      doctorVerified: user?.doctorVerified || false,
      specialty: profile.specialty || "",
      bio: profile.bio || "",
      availability: profile.availability || [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (e) {
    console.error("Update availability error:", e.message);
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

// KEEP THIS LAST - dynamic route
router.get("/:doctorUserId", async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({
      userId: req.params.doctorUserId,
    });

    if (!profile) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    let user = null;
    try {
      user = await getUserContact(profile.userId);
    } catch (err) {
      console.error("Failed to fetch doctor contact by id:", err.message);
    }

    res.json({
      _id: profile._id,
      userId: profile.userId,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      doctorVerified: user?.doctorVerified || false,
      specialty: profile.specialty || "",
      bio: profile.bio || "",
      availability: profile.availability || [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (e) {
    console.error("Get doctor by id error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;