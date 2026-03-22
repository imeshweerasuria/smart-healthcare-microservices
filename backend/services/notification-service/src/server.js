const express = require("express");
const cors = require("cors");
require("dotenv").config();

const notifyRoutes = require("./routes/notify.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ service: "notification-service", ok: true }));

// Notification routes
app.use("/notify", notifyRoutes);

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => console.log(`notification-service running on :${PORT}`));

const notifyRoutes = require("./routes/notify.routes");
app.use("/notify", notifyRoutes);
