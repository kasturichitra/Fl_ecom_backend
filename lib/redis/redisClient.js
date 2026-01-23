import { createClient } from "redis";
import { redisConfig } from "./redisConfig.js";

const redisClient = createClient({
  username: redisConfig.username,
  password: redisConfig.password,
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

redisClient.on("error", (err) =>
  console.error("Redis Client Error", err)
);

await redisClient.connect();

export default redisClient;
