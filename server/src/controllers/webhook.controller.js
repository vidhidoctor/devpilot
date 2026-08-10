import { prQueue } from "../queues/pr.queue.js";

import {
  successResponse,
  errorResponse
} from "../utils/response.js";


export const githubWebhook = async (req, res) => {
  try {
    console.log("========== GITHUB EVENT ==========");

    const event = req.headers["x-github-event"];

    console.log("Event:", event);

    if (event !== "pull_request") {
      return successResponse(res, {
        message: "Event ignored"
      });
    }

    const { action, pull_request, repository } = req.body;

    console.log("Action:", action);
    console.log("PR Number:", pull_request.number);
    console.log("Repository:", repository.full_name);


    // Normalize GitHub payload
    // into the format required by the queue.
    const jobData = {
      provider: "github",
      owner: repository.owner.login,
      repo: repository.name,
      prNumber: pull_request.number
    };


    await prQueue.add(
      "analyze-pull-request",
      jobData
    );

    console.log("✅ PR job added to queue");


    return successResponse(res, {
      message: "PR analysis job queued"
    });

  } catch (error) {
    console.error("❌ Webhook error:", error);

    return errorResponse(
      res,
      "Failed to process GitHub webhook",
      500
    );
  }
};