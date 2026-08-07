import express from "express";
import dotenv from "dotenv";

import webhookRoutes from "./routes/webhook.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/webhooks", webhookRoutes);

app.get("/", (req, res) => {
    res.send("DevPilot API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});