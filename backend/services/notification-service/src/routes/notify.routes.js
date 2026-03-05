const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/email", async (req, res) => {
 try {
   const { to, subject, text } = req.body;
   if (!to || !subject || !text) return res.status(400).json({ message: "Missing fields" });

   const transporter = nodemailer.createTransport({
     service: "gmail",
     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
   });

   await transporter.sendMail({
     from: process.env.EMAIL_USER,
     to,
     subject,
     text,
   });

   res.json({ ok: true, message: "Email sent" });
 } catch (e) {
   res.status(500).json({ ok: false, message: "Email failed" });
 }
});

module.exports = router;
