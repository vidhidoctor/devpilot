import express from "express";
import dotenv from "dotenv";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = Buffer.from(buf);
    }
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DevPilot API Running 🚀"
  });
});

app.use("/", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 DevPilot API running on port ${PORT}`);
});