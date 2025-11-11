import "module-alias/register";
import "dotenv/config";
import app from "./app";
import redisClient from "./utils/redis";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
  console.log(`Server running on port ${PORT}`);
});
