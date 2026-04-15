const mongoose = require("../../../../shared/config/mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    postedBy: {
      type: String,
      required: true,
    },
    postedByName: {
      type: String,
      default: "Admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);