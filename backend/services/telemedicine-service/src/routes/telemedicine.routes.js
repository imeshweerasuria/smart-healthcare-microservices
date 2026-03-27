const express = require("express"); 
const crypto = require("crypto"); 
const router = express.Router(); 
router.post("/session", async (req, res) => { 
const { appointmentId } = req.body; 
if (!appointmentId) { 
return res.status(400).json({ message: "appointmentId required" }); 
} 
const rand = crypto.randomBytes(4).toString("hex"); 
const room = `smarthealth-${appointmentId}-${rand}`; 
const meetingUrl = `https://meet.jit.si/${room}`; 
res.json({ ok: true, meetingUrl }); 
}); 
module.exports = router; 