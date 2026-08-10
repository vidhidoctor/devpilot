import express from "express";

import {getAnalysisById, getAnalyses} from "../controllers/analysis.controller.js";

const router = express.Router();

router.get("/", getAnalyses);
router.get("/:id", getAnalysisById);

export default router;