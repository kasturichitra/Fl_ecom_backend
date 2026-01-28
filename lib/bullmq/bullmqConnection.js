import IORedis from "ioredis";
import { redisConfig } from "../redis/redisConfig.js";

console.log("redisConfig", redisConfig);
export const bullConnection = new IORedis({
  host: redisConfig.host,
  port: redisConfig.port,
  username: redisConfig.username,
  password: redisConfig.password,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
});
