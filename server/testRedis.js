import { redisConnection } from "./src/config/redis.js";

async function test() {
  try {
    await redisConnection.set("project", "DevPilot");

    const value = await redisConnection.get("project");

    console.log("Redis Value:", value);

    await redisConnection.quit();
  } catch (err) {
    console.error(err);
  }
}

test();