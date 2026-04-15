const express = require("express");
const Notice = require("../models/Notice");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

// ADMIN - create a new notice
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      postedBy: req.user.userId,
      postedByName: "Admin",
      isActive: true,
    });

    res.json(notice);
  } catch (e) {
    console.error("Create notice error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ALL LOGGED-IN USERS - get active notices
router.get("/", requireAuth, async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (e) {
    console.error("Get notices error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN - get all notices
router.get("/admin/all", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (e) {
    console.error("Get all notices error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN - deactivate / activate notice
router.patch("/:id/toggle", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    res.json({
      message: `Notice ${notice.isActive ? "activated" : "deactivated"} successfully`,
      notice,
    });
  } catch (e) {
    console.error("Toggle notice error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;