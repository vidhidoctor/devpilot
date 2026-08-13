import express from "express";

import {
    getPullRequestById,
    getPullRequestAnalyses
} from "../controllers/pull-request.controller.js";

const router = express.Router();

router.get("/:id",getPullRequestById);
router.get("/:id/analyses",getPullRequestAnalyses);


export default router;