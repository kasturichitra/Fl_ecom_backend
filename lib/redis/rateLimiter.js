import redisClient from "./redisClient.js";

const rateLimiter = ({ windowSizeInSeconds, maxRequests, keyPrefix = "rate-limit" }) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user?.id || req.ip; // token user > IP fallback

      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowSizeInSeconds * 1000;

      const pipeline = redisClient.multi();

      // 1️⃣ Remove old requests
      pipeline.zRemRangeByScore(key, 0, windowStart);

      // 2️⃣ Add current request timestamp
      pipeline.zAdd(key, [{ score: now, value: now.toString() }]);

      // 3️⃣ Count requests in window
      pipeline.zCard(key);

      // 4️⃣ Set expiry (important!)
      pipeline.expire(key, windowSizeInSeconds);

      const results = await pipeline.exec();
      const requestCount = results[2];

      if (requestCount > maxRequests) {
        return res.status(429).json({
          status: "failed",
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      next(); // fail-open (important for prod)
    }
  };
};

export default rateLimiter;
