import dotenv from "dotenv";
import { Worker } from "bullmq";

import { redisConnection } from "../config/redis.js";
import { AnalysisService } from "../services/analysis.service.js";

dotenv.config();

const worker = new Worker(
    "pull-request-analysis",

    async (job) => {
        console.log("=================================");
        console.log("🚀 Processing PR job");
        console.log("Job ID:", job.id);
        console.log("Job data:", job.data);

        await AnalysisService.analyze(job.data);

        console.log("✅ PR analysis completed");
    },

    {
        connection: redisConnection
    }
);

worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(`❌ Job ${job?.id} failed`);
    console.error(error);
});

console.log("👷 PR Worker started");