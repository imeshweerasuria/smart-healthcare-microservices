const express = require("express");
const axios = require("axios");
const Payment = require("../models/Payment");
const { requireAuth } = require("../../../../shared/middleware/auth");

const router = express.Router();

const APPOINTMENT_URL = process.env.APPOINTMENT_URL || "http://localhost:4004";

async function getAppointment(appointmentId, authHeader) {
 const res = await axios.get(`${APPOINTMENT_URL}/appointments/${appointmentId}`, {
   headers: { Authorization: authHeader },
 });
 return res.data;
}

/**
* Get my payments
*/
router.get("/me", requireAuth, async (req, res) => {
 try {
   const list = await Payment.find({ userId: req.user.userId }).sort({ createdAt: -1 });
   res.json(list);
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});

/**
* Create payment for appointment
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

   const appointment = await getAppointment(appointmentId, req.headers.authorization);

   if (req.user.role === "PATIENT" && appointment.patientId !== req.user.userId) {
     return res.status(403).json({ message: "You can only pay for your own appointment" });
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
     message: "Payment intent created",
   });
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});

/**
* Optional alias
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

   const appointment = await getAppointment(appointmentId, req.headers.authorization);

   if (req.user.role === "PATIENT" && appointment.patientId !== req.user.userId) {
     return res.status(403).json({ message: "You can only pay for your own appointment" });
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
     message: "Intent created",
   });
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});

/**
* Mark payment paid
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

   if (payment.userId !== req.user.userId && req.user.role !== "ADMIN") {
     return res.status(403).json({ message: "Forbidden" });
   }

   payment.status = "PAID";
   await payment.save();

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
     message: "Payment marked as PAID and appointment updated",
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
