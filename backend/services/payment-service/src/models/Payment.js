const mongoose = require("../../../../shared/config/mongoose");

const PaymentSchema = new mongoose.Schema(
 {
   appointmentId: { type: String, required: true },
   userId: { type: String, required: true },
   amount: { type: Number, required: true },
   currency: { type: String, default: "LKR" },
   status: {
     type: String,
     enum: ["PENDING", "PAID", "FAILED"],
     default: "PENDING",
   },
   provider: { type: String, default: "STRIPE_TEST" },
 },
 { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
