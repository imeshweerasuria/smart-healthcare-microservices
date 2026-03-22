const express = require("express");
const axios = require("axios");
const Payment = require("../models/Payment");
const { requireAuth } = require("../../../../shared/middleware/auth");

const router = express.Router();

// Appointment service URL
const APPOINTMENT_URL = process.env.APPOINTMENT_URL || "http://localhost:4004";

/**
 * Create payment for an appointment (acts like "intent")
 */
router.post("/for-appointment", requireAuth, async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const payment = await Payment.create({
      appointmentId,
      userId: req.user.userId,
      amount,
      status: "PENDING",
      provider: "STRIPE_TEST",
    });

    res.json({
      ok: true,
      paymentId: payment._id,
      payment,
      message: "Payment intent created (merged)",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Optional alias (same logic)
 */
router.post("/create-intent", requireAuth, async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const payment = await Payment.create({
      appointmentId,
      userId: req.user.userId,
      amount,
      status: "PENDING",
      provider: "STRIPE_TEST",
    });

    res.json({
      ok: true,
      paymentId: payment._id,
      payment,
      message: "Intent created (stub)",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Mark payment as PAID + notify appointment service
 */
router.post("/mark-paid", requireAuth, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID required" });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status
    payment.status = "PAID";
    await payment.save();

    // 🔥 Notify Appointment Service
    await axios.put(
      `${APPOINTMENT_URL}/appointments/${payment.appointmentId}/confirm-payment`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    res.json({
      ok: true,
      payment,
      message: "Payment marked as PAID & appointment updated",
    });

  } catch (err) {
    console.error("Error in mark-paid:", err.message);

    res.status(500).json({
      message: "Payment updated but appointment sync failed",
      error: err.message,
    });
  }
});

module.exports = router;