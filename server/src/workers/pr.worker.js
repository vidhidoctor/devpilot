import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { AnalysisService } from "../services/analysis.service.js";

const prWorker = new Worker(

    "pull-request-analysis",

    async (job) => {

        try {

            console.log(`🚀 Processing Job ${job.id}`);

            await AnalysisService.analyze(job.data);

            console.log("✅ Job Completed");

        }

        catch(error){

            console.error(error);

            throw error;

        }

    },

    {

        connection: redisConnection

    }

);

console.log("✅ PR Worker Started...");