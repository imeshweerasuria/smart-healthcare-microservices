const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// Ethereal test mail (no password needed)
async function getTransporter() {
 const testAccount = await nodemailer.createTestAccount();
 return {
   transporter: nodemailer.createTransport({
     host: testAccount.smtp.host,
     port: testAccount.smtp.port,
     secure: testAccount.smtp.secure,
     auth: { user: testAccount.user, pass: testAccount.pass },
   }),
   testAccount,
 };
}

router.post("/email", async (req, res) => {
 try {
   const { to, subject, text } = req.body;
   if (!to) return res.status(400).json({ message: "Missing to" });

   const { transporter } = await getTransporter();

   const info = await transporter.sendMail({
     from: '"Smart Healthcare" <no-reply@smarthealth.local>',
     to,
     subject: subject || "Notification",
     text: text || "",
   });

   // Preview URL appears here (super useful in demo)
   const previewUrl = nodemailer.getTestMessageUrl(info);

   res.json({ ok: true, previewUrl });
 } catch (e) {
   console.log(e);
   res.status(500).json({ message: "Email failed" });
 }
});

module.exports = router;
