import { prQueue } from "../queues/pr.queue.js";

export const githubWebhook = (req, res) => {

    console.log("========== GITHUB EVENT ==========");

    console.log("Headers:");
    console.log(req.headers["x-github-event"]);

    console.log("Body:");
    console.log(req.body);

    res.sendStatus(200);
};