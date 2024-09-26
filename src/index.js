import express from "express";
import cors from "cors"; 
import routes from "./routes/user-routes.js";
import adminroutes from "./routes/admin-routes.js";
import "./models/sync.js";
import { swaggerMiddleware, swaggerSetup } from "./config/swagger.js";
import Stripe from "stripe";
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51Q3F4XHkb72MRGcsOvGZQGASRqtCBcmyHPl2MZRCkmOHTFgYkuPpCdirklykxWeoBg1XequtjnVPzen5CTFPF5qI00J6W07gU1"
);

// Use require to import dotenv
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

///view
app.set('view engine','ejs');

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:8080", 
    methods: ["GET", "POST"], 
    allowedHeaders: ["Content-Type"], 
  })
);  

// Use Swagger UI
app.use("/api-docs", swaggerMiddleware, swaggerSetup);

// Define routes
app.use("/movieshub/user", routes);
app.use("/movieshub/admin", adminroutes);

// Route for payments
app.get("/", (req, res) => {
  const price = 50; // Replace with dynamic seat price
  const seats = 1; // Replace with dynamic seat count
  const totalPrice = price * seats;

  res.render("index", { price, seats, totalPrice }); // Ensure you pass the right variables
});
app.post("/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Seat Booking" },
            unit_amount: 50 * 100, // Replace with dynamic amount if needed
          },
          quantity: 1, // Replace with dynamic quantity if needed
        },
      ],
      mode: "payment",
      success_url: "http://localhost:4500/complete",
      cancel_url: "http://localhost:4500/cancel",
    });

    res.redirect(session.url); // Redirect to Stripe checkout page
  } catch (error) {
    res.status(500).send("Something went wrong!");
  }
});
app.get('/complete',(req,res) =>{
  res.send({message:"Your Payment Was Successful"})
})
app.get('/cancel',(req,res) =>{
  res.send({message:"Payment Cancel"})
})
// Catch-all route for undefined paths
app.use("*", (req, res) => {
  return res
    .status(404)
    .send({ success: false, error: { message: "Page 404 not found!" } });
});

const port = 4500;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(
    `Swagger docs are available on http://localhost:${port}/api-docs for local system`
  );
});