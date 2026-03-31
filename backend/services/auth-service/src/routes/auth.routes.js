const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      phone: user.phone || "",
    },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "7d" }
  );

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!["PATIENT", "DOCTOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already used" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      passwordHash,
      role,
      doctorVerified: role === "DOCTOR" ? false : true,
      isDisabled: false,
    });

    const token = signToken(user);

    res.json({
      token,
      role: user.role,
      userId: user._id,
      email: user.email,
      phone: user.phone || "",
      name: user.name,
      doctorVerified: user.doctorVerified,
      isDisabled: user.isDisabled,
    });
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    if (user.role === "DOCTOR" && !user.doctorVerified) {
      return res.status(403).json({ message: "Doctor not verified yet" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      token,
      role: user.role,
      userId: user._id,
      email: user.email,
      phone: user.phone || "",
      name: user.name,
      doctorVerified: user.doctorVerified,
      isDisabled: user.isDisabled,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET CURRENT USER
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) {
    console.error("Auth /me error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// INTERNAL CONTACT LOOKUP FOR OTHER MICROSERVICES
// NOTE: This is left open so appointment-service can call it directly.
// In production, protect this with an internal secret/header.
router.get("/users/:id/contact", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "_id name email phone role doctorVerified isDisabled"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
      doctorVerified: user.doctorVerified,
      isDisabled: user.isDisabled,
    });
  } catch (e) {
    console.error("Get user contact error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN - list all users
router.get("/users", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    console.error("List users error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN - list pending doctors
router.get("/doctors/pending", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const doctors = await User.find({
      role: "DOCTOR",
      doctorVerified: false,
    }).select("-passwordHash").sort({ createdAt: -1 });

    res.json(doctors);
  } catch (e) {
    console.error("Pending doctors error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN - verify doctor
router.patch("/doctors/:id/verify", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (doctor.role !== "DOCTOR") {
      return res.status(400).json({ message: "User is not a doctor" });
    }

    doctor.doctorVerified = true;
    await doctor.save();

    res.json({
      message: "Doctor verified successfully",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone || "",
        role: doctor.role,
        doctorVerified: doctor.doctorVerified,
        isDisabled: doctor.isDisabled,
      },
    });
  } catch (e) {
    console.error("Verify doctor error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN - toggle disable user
router.patch("/users/:id/toggle-disable", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDisabled = !user.isDisabled;
    await user.save();

    res.json({
      message: `User ${user.isDisabled ? "disabled" : "enabled"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        doctorVerified: user.doctorVerified,
        isDisabled: user.isDisabled,
      },
    });
  } catch (e) {
    console.error("Toggle disable error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;