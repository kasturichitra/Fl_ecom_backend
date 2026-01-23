import { redisHost, redisPassword, redisPort } from "../../env.js";

export const redisConfig = {
  host: redisHost,
  port: redisPort,
  username: "default",
  password: redisPassword,
};
