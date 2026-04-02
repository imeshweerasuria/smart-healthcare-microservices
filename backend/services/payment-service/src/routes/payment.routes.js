const express = require("express");
const axios = require("axios");
const Stripe = require("stripe");
const Payment = require("../models/Payment");

const { requireAuth, requireRole } = require("../../../../shared/middleware/auth");

const router = express.Router();

const doctorFees = {
  "Cardiology": 9000,
  "Dermatology": 10000,
  "Neurology": 7000,
  "Pediatrics": 8000,
  "Psychiatry": 5000,
  "Orthopedics": 7000,
  "Ophthalmology": 9000,
  "Gynecology": 7000,
  "Urology": 8000,
  "General Medicine": 8000,
  "Family Medicine": 5000,
  "Emergency Medicine": 7000,
  "Radiology": 7000,
  "Anesthesiology": 8000,
  "Surgery": 9000,
};

const APPOINTMENT_URL = process.env.APPOINTMENT_URL || "http://localhost:4004";
const DOCTOR_URL = process.env.DOCTOR_URL || "http://localhost:4003";
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

async function getDoctorProfile(doctorId, authHeader) {
  const res = await axios.get(`${DOCTOR_URL}/doctors/${doctorId}`, {
    headers: { Authorization: authHeader },
  });
  return res.data; // should include specialty
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
      currency: "lkr",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Real Stripe Checkout session
router.post("/checkout-session", requireAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe key missing" });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Missing appointmentId" });
    }

    const appointment = await getAppointment(appointmentId, req.headers.authorization);

    if (req.user.role === "PATIENT" && appointment.patientId !== req.user.userId) {
      return res.status(403).json({ message: "You can only pay for your own appointment" });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ message: "Cannot pay for cancelled appointment" });
    }

    const existingOpen = await Payment.findOne({
      appointmentId,
      userId: req.user.userId,
      status: { $in: ["PENDING", "PAID"] },
    });

    if (existingOpen) {
      return res.status(409).json({ message: "Payment already exists" });
    }

    // Fetch doctor profile via API to get specialty
    const doctorProfile = await getDoctorProfile(appointment.doctorId, req.headers.authorization);
    
    // Get profession from doctor profile
    const professionKey = (doctorProfile.specialty || "General Medicine").trim();
    
    // Normalize capitalization to match your fee map keys
    const profession = professionKey
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    
    // Pick amount from fee map
    const baseAmount = doctorFees[profession] ?? doctorFees["General Medicine"];
const amountInLKR = baseAmount * 100;

    console.log("Amount sent to Stripe:", amountInLKR);
console.log("Actual LKR amount:", amountInLKR / 100);
    console.log("Doctor profession used for calculation:", profession);

    const payment = await Payment.create({
      appointmentId,
      userId: req.user.userId,
      amount: amountInLKR,
      status: "PENDING",
      provider: "STRIPE_TEST",
      currency: "lkr",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `Appointment Payment (${profession})`,
            },
            unit_amount: amountInLKR,
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

    res.json({ ok: true, paymentId: payment._id, checkoutUrl: session.url });
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
    
    // Fetch doctor profile for email notification
    const doctorProfile = await getDoctorProfile(appointment.doctorId, req.headers.authorization);
    const profession = doctorProfile.specialty || "General Medicine";

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
          text: `Your payment for ${profession} appointment was successful.`,
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
    console.error(
      "Confirm stripe success error:",
      err.response?.data || err.message
    );
    res.status(500).json({ message: err.message });
  }
});

// Demo endpoint for creating pending payment (fallback)
router.post("/for-appointment", requireAuth, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Missing appointmentId" });
    }

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

    // Fetch doctor profile to calculate amount
    const doctorProfile = await getDoctorProfile(appointment.doctorId, req.headers.authorization);
    const professionKey = (doctorProfile.specialty || "General Medicine").trim();
    const profession = professionKey
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const baseAmount = doctorFees[profession] ?? doctorFees["General Medicine"];
const amountInLKR = baseAmount * 100;

    const payment = await Payment.create({
      appointmentId,
      userId: req.user.userId,
      amount: amountInLKR,
      status: "PENDING",
      provider: "STRIPE_TEST",
      currency: "lkr",
    });

    res.json({ ok: true, paymentId: payment._id, payment });
  } catch (err) {
    console.error("Error in for-appointment:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Mark payment as paid (manual/alternative flow)
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


// Refund endpoint
router.post("/refund", requireAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe secret key missing" });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID required" });
    }

    const payment = await Payment.findOne({ appointmentId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "REFUNDED") {
      return res.status(400).json({ message: "Payment already refunded" });
    }

    if (payment.status !== "PAID") {
      return res.status(400).json({ message: "Only PAID payments can be refunded" });
    }

    if (!payment.stripePaymentIntentId) {
      return res.status(400).json({ message: "No Stripe payment intent found for this payment" });
    }

    // Refund in Stripe
    const refund = await stripe.refunds.create({ 
      payment_intent: payment.stripePaymentIntentId 
    });

    payment.status = "REFUNDED";
    await payment.save();

    // Fetch appointment for email notification
    const appointment = await getAppointment(payment.appointmentId, req.headers.authorization);
    
    // Send email async (don't block response)
    if (appointment.patientEmail) {
      axios.post(`${NOTIFICATION_URL}/notify/email`, {
        to: appointment.patientEmail,
        subject: "Payment Refunded",
        text: `Your payment for appointment ${payment.appointmentId} has been refunded successfully.`,
      })
      .then(resp => console.log("Refund email sent:", resp.data))
      .catch(err => console.error("Refund email failed:", err.response?.data || err.message));
    }

    return res.json({ ok: true, message: "Refund successful", refund });
  } catch (err) {
    console.error("Refund error:", err.response?.data || err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

