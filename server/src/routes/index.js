import express from "express";

import webhookRoutes from "./webhook.routes.js";
import analysisRoutes from "./analysis.routes.js";
import repositoryRoutes from "./repository.routes.js";
import pullRequestRoutes from "./pull-request.routes.js";

const router = express.Router();

router.use("/webhooks", webhookRoutes);
router.use("/analyses", analysisRoutes);
router.use("/repositories", repositoryRoutes);
router.use("/pull-requests", pullRequestRoutes);

export default router;