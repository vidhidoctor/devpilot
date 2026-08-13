import express from "express";

import {
    getRepositories,
    getRepositoryById,
    getPullRequestsByRepository
} from "../controllers/repository.controller.js";


const router = express.Router();


router.get("/", getRepositories);
router.get("/:id", getRepositoryById);
router.get("/:id/pull-requests",getPullRequestsByRepository);


export default router;