const express = require("express");

const router = express.Router();

router.post("/session", (req, res) => {
 const { appointmentId } = req.body;
 if (!appointmentId) return res.status(400).json({ message: "appointmentId required" });

 const room = `smartcare-${appointmentId}-${Date.now()}`;
 const meetingUrl = `https://meet.jit.si/${room}`;

 res.json({ ok: true, meetingUrl });
});

module.exports = router;
