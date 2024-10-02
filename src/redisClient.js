import { createClient } from "redis";

// Create a Redis client
const client = createClient({
  url: "redis://localhost:6379",
});

// Handle connection events
client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

// Connect to Redis
await client.connect();

export default client;