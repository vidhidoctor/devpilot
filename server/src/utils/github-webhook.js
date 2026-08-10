import crypto from "crypto";

export const verifyGithubWebhook = (req) => {
  const signature = req.headers["x-hub-signature-256"];

  if (!signature || !req.rawBody) {
    return false;
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("GITHUB_WEBHOOK_SECRET is not configured");
  }

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

  const received = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (received.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(received, expected);
};