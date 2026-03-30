const express = require("express");
const nodemailer = require("nodemailer");
const axios = require("axios");

const router = express.Router();

// ---------------- EMAIL SETUP ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function normalizeNotifyLkPhone(phone) {
  if (!phone) return "";

  let normalized = String(phone).trim();
  normalized = normalized.replace(/[\s\-()]/g, "");

  // +9477xxxxxxx -> 9477xxxxxxx
  if (normalized.startsWith("+94")) {
    return normalized.slice(1);
  }

  // 077xxxxxxx -> 9477xxxxxxx
  if (normalized.startsWith("0")) {
    return `94${normalized.slice(1)}`;
  }

  // already like 9477xxxxxxx
  if (normalized.startsWith("94")) {
    return normalized;
  }

  return normalized;
}

// ---------------- EMAIL ROUTE ----------------
router.post("/email", async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Missing to" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message: "EMAIL_USER or EMAIL_PASS is missing in .env",
      });
    }

    const info = await transporter.sendMail({
      from: `"Smart Healthcare" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || "Notification",
      text: text || "",
    });

    res.json({
      ok: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (e) {
    console.error("Email failed:", e.response?.data || e.message || e);
    res.status(500).json({
      message: "Email failed",
      error: e.response?.data || e.message,
    });
  }
});

// ---------------- SMS ROUTE (Notify.lk) ----------------
router.post("/sms", async (req, res) => {
  try {
    const { to, body } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Missing to" });
    }

    if (!body) {
      return res.status(400).json({ message: "Missing body" });
    }

    if (
      !process.env.NOTIFY_LK_USER_ID ||
      !process.env.NOTIFY_LK_API_KEY ||
      !process.env.NOTIFY_LK_SENDER_ID
    ) {
      return res.status(500).json({
        message:
          "NOTIFY_LK_USER_ID, NOTIFY_LK_API_KEY, or NOTIFY_LK_SENDER_ID is missing in .env",
      });
    }

    const normalizedTo = normalizeNotifyLkPhone(to);

    console.log("NOTIFY LK DEBUG", {
      userId: process.env.NOTIFY_LK_USER_ID,
      senderId: process.env.NOTIFY_LK_SENDER_ID,
      to: normalizedTo,
    });

    const params = {
      user_id: process.env.NOTIFY_LK_USER_ID,
      api_key: process.env.NOTIFY_LK_API_KEY,
      sender_id: process.env.NOTIFY_LK_SENDER_ID,
      to: normalizedTo,
      message: body,
    };

    const response = await axios.post(
      "https://app.notify.lk/api/v1/send",
      null,
      { params }
    );

    console.log("Notify.lk SMS response:", response.data);

    if (response.data?.status !== "success") {
      return res.status(500).json({
        message: "SMS failed",
        error: response.data,
      });
    }

    res.json({
      ok: true,
      message: "SMS sent successfully",
      provider: "notify.lk",
      to: normalizedTo,
      notifylk: response.data,
    });
  } catch (e) {
    console.error("SMS failed:", e.response?.data || e.message || e);
    res.status(500).json({
      message: "SMS failed",
      error: e.response?.data || e.message,
    });
  }
});

module.exports = router;