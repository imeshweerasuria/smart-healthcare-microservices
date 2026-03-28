const express = require("express");
const axios = require("axios");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const APPOINTMENT_URL = process.env.APPOINTMENT_URL || "http://localhost:4004";
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || "http://localhost:4006";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const stripe = process.env.STRIPE_SECRET_KEY
 ? new Stripe(process.env.STRIPE_SECRET_KEY)
 : null;

async function getAppointment(appointmentId, authHeader) {
 const res = await axios.get(`${APPOINTMENT_URL}/appointments/${appointmentId}`, {
   headers: { Authorization: authHeader },
 });
 return res.data;
}

router.get("/me", requireAuth, async (req, res) => {
 try {
   const list = await Payment.find({ userId: req.user.userId }).sort({ createdAt: -1 });
   res.json(list);
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});

router.get("/summary", requireAuth, requireRole("ADMIN"), async (req, res) => {
 try {
   const payments = await Payment.find();

   const totalCount = payments.length;
   const paidCount = payments.filter((p) => p.status === "PAID").length;
   const pendingCount = payments.filter((p) => p.status === "PENDING").length;
   const failedCount = payments.filter((p) => p.status === "FAILED").length;
   const totalRevenue = payments
     .filter((p) => p.status === "PAID")
     .reduce((sum, p) => sum + p.amount, 0);

   res.json({
     totalCount,
     paidCount,
     pendingCount,
     failedCount,
     totalRevenue,
     currency: "usd",
   });
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});

// Real Stripe Checkout session
router.post("/checkout-session", requireAuth, async (req, res) => {
 try {
   if (!stripe) {
     return res.status(500).json({ message: "Stripe secret key missing" });
   }

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

   if (appointment.status !== "ACCEPTED") {
     return res.status(400).json({ message: "Appointment must be ACCEPTED before checkout" });
   }

   const existingOpen = await Payment.findOne({
     appointmentId,
     userId: req.user.userId,
     status: { $in: ["PENDING", "PAID"] },
   });

   if (existingOpen) {
     return res.status(409).json({ message: "Payment already exists for this appointment" });
   }

   const payment = await Payment.create({
     appointmentId,
     userId: req.user.userId,
     amount,
     status: "PENDING",
     provider: "STRIPE_TEST",
     currency: "usd",
   });

   const session = await stripe.checkout.sessions.create({
     mode: "payment",
     payment_method_types: ["card"],
     line_items: [
       {
         price_data: {
           currency: "usd",
           product_data: {
             name: "Healthcare Appointment Payment",
           },
           unit_amount: amount,
         },
         quantity: 1,
       },
     ],
     success_url: `${FRONTEND_URL}/patient/payment/success?paymentId=${payment._id}&session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${FRONTEND_URL}/patient/appointments`,
     metadata: {
       paymentId: payment._id.toString(),
       appointmentId,
       userId: req.user.userId,
     },
   });

   payment.stripeSessionId = session.id;
   await payment.save();

   res.json({
     ok: true,
     paymentId: payment._id,
     checkoutUrl: session.url,
     stripeSessionId: session.id,
   });
 } catch (err) {
   console.error("Checkout session error:", err.message);
   res.status(500).json({ message: err.message });
 }
});

// Confirm Stripe success after redirect
router.post("/confirm-stripe-success", requireAuth, async (req, res) => {
 try {
   if (!stripe) {
     return res.status(500).json({ message: "Stripe secret key missing" });
   }

   const { paymentId, sessionId } = req.body;

   if (!paymentId || !sessionId) {
     return res.status(400).json({ message: "paymentId and sessionId required" });
   }

   const payment = await Payment.findById(paymentId);
   if (!payment) {
     return res.status(404).json({ message: "Payment not found" });
   }

   if (payment.userId !== req.user.userId && req.user.role !== "ADMIN") {
     return res.status(403).json({ message: "Forbidden" });
   }

   if (payment.status === "PAID") {
     return res.json({ ok: true, payment, message: "Payment already confirmed" });
   }

   const session = await stripe.checkout.sessions.retrieve(sessionId);

   if (session.payment_status !== "paid") {
     return res.status(400).json({ message: "Stripe session is not paid yet" });
   }

   payment.status = "PAID";
   payment.stripeSessionId = session.id;
   payment.stripePaymentIntentId = session.payment_intent || "";
   await payment.save();

   const appointment = await getAppointment(payment.appointmentId, req.headers.authorization);

   await axios.put(
     `${APPOINTMENT_URL}/appointments/${payment.appointmentId}/confirm-payment`,
     {},
     {
       headers: { Authorization: req.headers.authorization },
     }
   );

   if (appointment.patientEmail) {
     try {
       await axios.post(`${NOTIFICATION_URL}/notify/email`, {
         to: appointment.patientEmail,
         subject: "Stripe Payment Successful",
         text: `Your payment for appointment ${payment.appointmentId} was successful.`,
       });
     } catch (notifyErr) {
       console.error("Stripe success email failed:", notifyErr.message);
     }
   }

   res.json({
     ok: true,
     payment,
     message: "Stripe payment confirmed and appointment updated",
   });
 } catch (err) {
   console.error("Confirm stripe success error:", err.message);
   res.status(500).json({ message: err.message });
 }
});

// Keep old demo endpoints as fallback
router.post("/for-appointment", requireAuth, async (req, res) => {
 try {
   const { appointmentId, amount } = req.body;
   if (!appointmentId || !amount) return res.status(400).json({ message: "Missing fields" });

   const appointment = await getAppointment(appointmentId, req.headers.authorization);
   if (req.user.role === "PATIENT" && appointment.patientId !== req.user.userId) {
     return res.status(403).json({ message: "You can only pay for your own appointment" });
   }

   const existingOpen = await Payment.findOne({
     appointmentId,
     userId: req.user.userId,
     status: { $in: ["PENDING", "PAID"] },
   });

   if (existingOpen) {
     return res.status(409).json({ message: "Payment already exists for this appointment" });
   }

   const payment = await Payment.create({
     appointmentId,
     userId: req.user.userId,
     amount,
     status: "PENDING",
     provider: "STRIPE_TEST",
     currency: "usd",
   });

   res.json({ ok: true, paymentId: payment._id, payment });
 } catch (err) {
   res.status(500).json({ message: err.message });
 }
});

router.post("/mark-paid", requireAuth, async (req, res) => {
 try {
   const { paymentId } = req.body;
   if (!paymentId) return res.status(400).json({ message: "Payment ID required" });

   const payment = await Payment.findById(paymentId);
   if (!payment) return res.status(404).json({ message: "Payment not found" });

   if (payment.userId !== req.user.userId && req.user.role !== "ADMIN") {
     return res.status(403).json({ message: "Forbidden" });
   }

   if (payment.status === "PAID") {
     return res.status(400).json({ message: "Payment is already marked as PAID" });
   }

   payment.status = "PAID";
   await payment.save();

   await axios.put(
     `${APPOINTMENT_URL}/appointments/${payment.appointmentId}/confirm-payment`,
     {},
     { headers: { Authorization: req.headers.authorization } }
   );

   res.json({ ok: true, payment, message: "Payment marked as PAID and appointment updated" });
 } catch (err) {
   console.error("Error in mark-paid:", err.message);
   res.status(500).json({
     message: "Payment updated but appointment sync failed",
     error: err.message,
   });
 }
});

module.exports = router;
