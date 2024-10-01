// Your existing index.js code...
import express from "express";
import cors from "cors";
import routes from "./routes/user-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import "./models/sync.js";
import { swaggerMiddleware, swaggerSetup } from "./config/swagger.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { bookSeats } from "./controllers/user-controller.js"; // Import booking function
import { Showtime } from "./models/sync.js"; // Import necessary models

dotenv.config();

console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51Q3F4XHkb72MRGcsOvGZQGASRqtCBcmyHPl2MZRCkmOHTFgYkuPpCdirklykxWeoBg1XequtjnVPzen5CTFPF5qI00J6W07gU1"
);

const app = express();
app.use(express.json());
app.set("view engine", "ejs");

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:4500",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Use Swagger UI for API documentation
app.use("/api-docs", swaggerMiddleware, swaggerSetup);

// Define user and admin routes
app.use("/movieshub/user", routes);
app.use("/movieshub/admin", adminRoutes);

// Route for rendering the booking page
app.get("/", (req, res) => {
  res.render("index.ejs"); // Render the index.ejs file
});



// Success route
app.get("/success", (req, res) => {
  res.render("success.ejs"); 
});

// Cancel route
app.get("/cancel", (req, res) => {
  res.render("cancel.ejs"); // Render the cancel EJS view
});

// Additional routes and server setup...

// Start the server
const port = 4500;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});