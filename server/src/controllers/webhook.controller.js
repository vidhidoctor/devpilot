import { prQueue } from "../queues/pr.queue.js";

import {
  successResponse,
  errorResponse
} from "../utils/response.js";

import {
  verifyGithubWebhook
} from "../utils/github-webhook.js";

export const githubWebhook = async (req, res) => {
  try {
    console.log("========== GITHUB EVENT ==========");

    const isValid = verifyGithubWebhook(req);

    if (!isValid) {
      console.error("❌ Invalid GitHub webhook signature");

      return errorResponse(
        res,
        "Invalid webhook signature",
        401
      );
    }

    console.log("✅ GitHub webhook signature verified");

    const event = req.headers["x-github-event"];

    console.log("Event:", event);

    if (event !== "pull_request") {
      return successResponse(res, {
        message: "Event ignored"
      });
    }

    const {
      action,
      pull_request,
      repository
    } = req.body;

    console.log("Action:", action);
    console.log("PR Number:", pull_request.number);
    console.log("Repository:", repository.full_name);

    // Only analyze relevant PR actions
    const allowedActions = [
      "opened",
      "synchronize",
      "reopened"
    ];

    if (!allowedActions.includes(action)) {
      console.log(
        `⏭️ Ignoring pull_request action: ${action}`
      );

      return successResponse(res, {
        message: `Pull request action '${action}' ignored`
      });
    }

    const jobData = {
      provider: "github",
      owner: repository.owner.login,
      repo: repository.name,
      prNumber: pull_request.number,
      commitSha: pull_request.head.sha
    };

    const jobId =
      `${jobData.provider}-${jobData.owner}-${jobData.repo}-${jobData.prNumber}-${jobData.commitSha}`;

    await prQueue.add(
      "analyze-pull-request",
      jobData,
      {
        jobId,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000
        }
      }
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