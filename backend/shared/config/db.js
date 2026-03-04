const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) {
    console.error("MONGO_URI missing");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;