const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB(process.env.MONGO_URI);

app.get("/health", (req, res) => res.json({ service: "doctor-service", ok: true }));

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => console.log(`doctor-service running on :${PORT}`));