import express from "express";

import webhookRoutes from "./webhook.routes.js";
import analysisRoutes from "./analysis.routes.js";

const router = express.Router();

router.use("/webhooks", webhookRoutes);

router.use("/analyses", analysisRoutes);

export default router;