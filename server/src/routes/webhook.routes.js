import express from "express";
import { githubWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/github", githubWebhook);

export default router;