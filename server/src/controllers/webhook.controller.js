import { prQueue } from "../queues/pr.queue.js";

export const githubWebhook = async (req, res) => {
    try {
        console.log("========== GITHUB EVENT ==========");

        const event = req.headers["x-github-event"];

        console.log("Event:", event);

        // We only care about pull request events
        if (event !== "pull_request") {
            return res.sendStatus(200);
        }

        const { action, pull_request, repository } = req.body;

        console.log("Action:", action);
        console.log("PR Number:", pull_request.number);
        console.log("Repository:", repository.full_name);

        //I need only this specific piece of code to normalise the paylod to handover further to queue for processing. I will create a jobData object with the necessary information and add it to the prQueue.
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

        res.sendStatus(200);

    } catch (error) {
        console.error("❌ Webhook error:", error);

        res.sendStatus(500);
    }
};