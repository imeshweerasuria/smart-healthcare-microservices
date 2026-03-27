const mongoose = require("../../../../shared/config/mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN"],
      required: true,
    },
    doctorVerified: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);