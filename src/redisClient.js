import redis from "redis";

// Create a Redis client
const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

// Handle connection events
client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

export default client;