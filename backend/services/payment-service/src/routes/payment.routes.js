const express = require("express");
const Payment = require("../models/Payment");
const { requireAuth } = require("../../../../shared/middleware/auth");

const router = express.Router();

// Create "payment intent" (stub)
router.post("/create-intent", requireAuth, async (req, res) => {
 const { appointmentId, amount } = req.body;
 if (!appointmentId || !amount) return res.status(400).json({ message: "Missing fields" });

 const record = await Payment.create({
   appointmentId,
   userId: req.user.userId,
   amount,
   status: "PENDING",
 });

 // Later: call Stripe and return clientSecret. For now return recordId.
 res.json({ ok: true, paymentId: record._id, message: "Intent created (stub)" });
});

// Mark paid (TEMP for Day2 demo)
router.post("/mark-paid", requireAuth, async (req, res) => {
 const { paymentId } = req.body;
 const p = await Payment.findById(paymentId);
 if (!p) return res.status(404).json({ message: "Not found" });
 p.status = "PAID";
 await p.save();
 res.json({ ok: true, payment: p });
});

module.exports = router;
