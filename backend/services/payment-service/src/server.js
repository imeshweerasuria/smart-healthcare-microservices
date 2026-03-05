const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");
const payRoutes = require("./routes/payment.routes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB(process.env.MONGO_URI);

app.get("/health", (req, res) => res.json({ service: "payment-service", ok: true }));
app.use("/payments", payRoutes);

const PORT = process.env.PORT || 4007;
app.listen(PORT, () => console.log(`payment-service running on :${PORT}`));