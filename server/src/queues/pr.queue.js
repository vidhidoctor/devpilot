import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const prQueue = new Queue("pull-request-analysis", {
  connection: redisConnection,
});