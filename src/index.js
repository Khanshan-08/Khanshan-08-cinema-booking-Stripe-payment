import express from "express";
import cors from "cors";
import routes from "./routes/user-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import "./models/sync.js";
import { swaggerMiddleware, swaggerSetup } from "./config/swagger.js";
import Stripe from "stripe";
import dotenv from "dotenv";

// Import Redis client
import redisClient from "../src/redisClient.js"; // Make sure the path is correct

dotenv.config();

console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51Q3F4XHkb72MRGcsOvGZQGASRqtCBcmyHPl2MZRCkmOHTFgYkuPpCdirklykxWeoBg1XequtjnVPzen5CTFPF5qI00J6W07gU1"
);

const app = express();
app.use(express.json());
app.set("view engine", "ejs");

app.use(
  cors({
    origin: "http://localhost:4500",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use("/api-docs", swaggerMiddleware, swaggerSetup);

app.use("/movieshub/user", routes);
app.use("/movieshub/admin", adminRoutes);

// Example Redis usage (using async/await)
app.get("/redis-test", async (req, res) => {
  try {
    // Set a Redis key-value pair
    await redisClient.set("greeting", "Hello from Redis!");

    // Get the value from Redis
    const reply = await redisClient.get("greeting");
    res.send(`Stored Redis value: ${reply}`);
  } catch (err) {
    console.error("Redis error:", err);
    res.status(500).send("Redis error occurred.");
  }
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Success route
app.get("/success", (req, res) => {
  res.render("success.ejs");
});

// Cancel route
app.get("/cancel", (req, res) => {
  res.render("cancel.ejs");
});

// Start the server
const port = 4500;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});