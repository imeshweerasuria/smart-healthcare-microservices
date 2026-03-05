const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "7d" }
  );

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing fields" });

    if (!["PATIENT", "DOCTOR", "ADMIN"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already used" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      doctorVerified: role === "DOCTOR" ? false : true,
    });

    const token = signToken(user);
    res.json({ token, role: user.role, userId: user._id });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // if doctor and not verified -> optional block
    // if (user.role === "DOCTOR" && !user.doctorVerified) return res.status(403).json({ message: "Doctor not verified" });

    const token = signToken(user);
    res.json({ token, role: user.role, userId: user._id });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;