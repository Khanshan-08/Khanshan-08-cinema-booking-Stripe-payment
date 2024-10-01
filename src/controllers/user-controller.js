import express from "express";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import bcrypt from "bcryptjs";
import User from "../models/users.js";
import Movie from "../models/movies.js";
import Showtime from "../models/showtimes.js";
import Booking from "../models/booking.js";
import { Op } from "sequelize";
import Stripe from "stripe"; 
import dotenv from "dotenv";
import dayjs from "dayjs"; 
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51Q3F4XHkb72MRGcsOvGZQGASRqtCBcmyHPl2MZRCkmOHTFgYkuPpCdirklykxWeoBg1XequtjnVPzen5CTFPF5qI00J6W07gU1"
);
dotenv.config();

const app = express();
app.use(express.json());

// Signup route
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let rules = {
      name: "required|alpha|between:5,30",
      email: "required|email",
      password: [
        "required",
        "string",
        "min:8",
        "max:15",
        "regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,15}$/",
      ],
    };

    let validation = new Validator({ name, email, password }, rules);

    if (validation.fails()) {
      return res
        .status(400)
        .send({ success: false, errors: validation.errors.all() });
    }
    // Check if email already exists
    const checkemail = await User.findOne({ where: { email } });
    if (checkemail) {
      return res.status(400).send({
        success: false,
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object with an ID
    const newUser = await User.create({
      role: "user",
      name,
      email,
      password: hashedPassword,
    });
    // Generate JWT token
    const token = jwt.sign(
      { email: newUser.email, role: newUser.role, id: newUser.id },
      "secretkey",
      {
        expiresIn: "24h",
      }
    );

    return res.status(201).send({
      success: true,
      message: `SignUp Successfully!, Wellcome ${name}`,
      data: {
        id: newUser.id,
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        token: token,
      }
    });
  } catch (errors) {
    console.error(errors);
    return res.status(500).send({
      success: false,
      message: "Server error",
      error: errors.message || errors.toString(),
    });
  }
};
///login route
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let rules = {
      email: "required|email",
      password: [
        "required",
        "string",
        "min:8",
        "max:15",
        "regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,15}$/",
      ],
    };

    let validation = new Validator({ email, password }, rules);
    if (validation.fails()) {
      return res
        .status(400)
        .send({ success: false, errors: validation.errors.all() });
    }

    // Ensure that you await the query to get the user data
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found with this Email!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { email: user.email, role: user.role, id: user.id },
        "secretkey",
        {
          expiresIn: "24hr",
        }
      );

      return res.status(200).send({
        success: true,
        message: "Login successful!",
        data: { email: user.email, role: user.role, token: token }
      });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "Invalid password" });
    }
  } catch (errors) {
    console.log(errors);
    return res.status(500).send({
      success: false,
      message: "Server Error",
      errors: errors.message || errors.toString(),
    });
  }
};
//movies list
export const getmovieslist = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, "secretkey");
    const email = decoded.email;
    console.log(email);

    const movies = await Movie.findAll();

    if (movies.length == 0) {
      return res
        .status(404)
        .send({ success: false, message: "Movies not Available!" });
    }
    return res
      .status(200)
      .send({ success: true, message: "List of All Movies", data: movies });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ success: false, error: error.message || error.toString() });
  }
};
//get movie by id
export const getmoviebyid = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  try {
    const decoded = jwt.verify(token, "secretkey");
    const email = decoded.email;
    const checkemail = User.findOne({ where: { email } });
    if (!checkemail) {
      return res.status(401).send({ success: false, error: "Unauthorized" });
    }
    const id = Number(req.params.id);
    const picture = await Movie.findOne({ where: { id } });
    if (picture) {
      return res.status(200).send({
        success: true,
        message: "Movie Selected by ID!",
        data: picture,
      });
    }
    return res.status(404).send({ success: false, message: "Not Found!" });
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .send({ success: false, error: error.message || error.toString() });
  }
};
// Show movie showtimes by movie ID
export const getshowtime = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ success: false, message: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const email = decoded.email;

    const checkemail = await User.findOne({ where: { email } });
    if (!checkemail) {
      return res.status(403).send({ success: false, error: "Unauthorized" });
    }

    const movieId = Number(req.params.id);

    const movie = await Movie.findOne({ where: { id: movieId } });
    if (!movie) {
      return res
        .status(404)
        .send({ success: false, message: "No,movie found on this ID" });
    }

    const showtimes = await Showtime.findAll({ where: { movie_id: movieId } }); 

    if (!showtimes || showtimes.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No,showtimes available for this movie!",
      });
    }
    return res.status(200).send({
      success: true,
      message: `Showtimes for the movie: ${movie.name}`,
      data: showtimes,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ success: false, error: error.message || error.toString() });
  }
};
//displaying all shows for specific movie
export const getshowtimebyid = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ success: false, message: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const email = decoded.email;

    const checkemail = await User.findOne({ where: { email } });
    if (!checkemail) {
      return res.status(401).send({ success: false, error: "Unauthorized" });
    }

    const movieId = parseInt(req.params.id, 10); 
    const showtimeId = parseInt(req.params.showtimeId, 10); 

    const movie = await Movie.findOne({ where: { id: movieId } });
    if (!movie) {
      return res
        .status(404)
        .send({ success: false, message: "No,movie found!"});
    }

    const showtime = await Showtime.findOne({
      where: {
        id: showtimeId,
        movie_id: movieId,
      }
    });

    if (!showtime) {
      return res
        .status(404)
        .send({ success: false, message: "No,showtime found on this movie" });
    }

    // Return the showtime details
    return res.status(200).send({
      success: true,
      message: "Available showtime",
      data: showtime,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};
///movies showtimes by id to check his available seats
export const getavailableseats = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ success: false, message: "Invalid Token" });
  }
  try {
    const decoded = jwt.verify(token, "secretkey");
    const email = decoded.email;
    console.log(email);
    const movieId = Number(req.params.id);
    const showtimeId = Number(req.params.showtimeId);

    // Find the movie by ID
    const movie = await Movie.findOne({ where: { id: movieId } });
    if (!movie) {
      return res
        .status(404)
        .send({ success: false, message: "Movie not found!" });
    }

    // Find the specific showtime by ID
    const showtime = await Showtime.findOne({
      where: { id: showtimeId, movie_id: movieId },
    });
    if (!showtime) {
      return res
        .status(404)
        .send({ success: false, message: "Showtime not found!" });
    }
    return res.status(200).send({
      success: true,
      message: "Available Seats of Selected Movie showtime!",
      data: { availableseats: showtime.availableSeats },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ success: false, error: error.message || error.toString() });
  }
};

export const bookSeats = async (req, res) => {
  const { cinema, seats } = req.body; // Get cinema name and number of seats from the request body
  console.log("Booking request received:", req.body);

  // Check for user authentication first
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Fetch showtime details based on the cinema name
    const showtimeDetails = await Showtime.findOne({
      where: { cinema }, // Query using the cinema name
    });
    console.log(showtimeDetails);

    if (!showtimeDetails) {
      return res.status(404).json({ message: "Showtime not found." });
    }

    let availableSeats = JSON.parse(showtimeDetails.availableSeats);

    if (seats > availableSeats.length) {
      return res.status(400).json({ message: "Not enough seats available." });
    }

    // Parse and convert the price from string to integer
    const perSeatPriceStr = showtimeDetails.perSeat_Price; // e.g., "50$"
    const perSeatPrice = parseInt(perSeatPriceStr.replace(/[$,]/g, ""), 10); // Remove $ and convert to integer
    console.log("Parsed per seat price:", perSeatPrice);

    // Calculate total price in cents
    const price = seats * perSeatPrice * 100; // Price in cents for Stripe
    console.log("Calculated price in cents:", price);

    // Check if the calculated price is a valid number
    if (isNaN(price) || price <= 0) {
      console.error("Invalid price calculated:", price);
      return res.status(400).json({ message: "Invalid price calculated." });
    }

    // Create a Stripe payment session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking for ${showtimeDetails.cinema} at ${showtimeDetails.time}`,
            },
            unit_amount: price, // Price in cents
          },
          quantity: 1, // Adjust if selling multiple items
        },
      ],
      mode: "payment",
      success_url: `http://localhost:4500/success`,
      cancel_url: `http://localhost:4500/cancel`,
    });

    // Save booking to the database
    const newBooking = await Booking.create({
      user_id: userId, // Assign user ID (real)
      showtime_id: showtimeDetails.id, // Ensure this is filled with valid showtime ID
      seats: seats.toString(), // Store seats as string if needed
      booking_date: dayjs().toDate(), // Set current date and time for booking_date
      createdAt: dayjs().toDate(), // Set createdAt to current date and time
      updatedAt: dayjs().toDate(), // Set updatedAt to current date and time
    });

    // Reduce the available seats by the number of seats booked
    availableSeats = availableSeats.slice(seats); // Remove booked seats
    await Showtime.update(
      { availableSeats: JSON.stringify(availableSeats) },
      { where: { id: showtimeDetails.id } }
    );

    // Return the session ID and price
    res
      .status(200)
      .json({ sessionId: session.id, url: session.url, price: price / 100 }); // Return the session ID and price
  } catch (error) {
    console.error("Error processing booking request:", error);
    res.status(500).json({ message: "Error processing booking." });
  }
};


//allbookinglist
export const getbookinglist = async (req, res) => {
  try {
    // Extract searchDate from request body
    const { searchDate } = req.body;

    if (!searchDate) {
      return res
        .status(400)
        .send({ success: false, message: "Date is required" });
    }

    // Parse the searchDate
    const searchDateStart = new Date(searchDate);

    // Check if the date is valid
    if (isNaN(searchDateStart.getTime())) {
      return res
        .status(400)
        .send({
          success: false,
          message: "Invalid date format. Please use YYYY-MM-DD",
        });
    }

    // Create the end date for the query (next day)
    const searchDateEnd = new Date(searchDateStart);
    searchDateEnd.setDate(searchDateEnd.getDate() + 1);

    // Query bookings for the specific date
    const bookings = await Booking.findAll({
      where: {
        booking_date: {
          [Op.between]: [searchDateStart, searchDateEnd],
        },
      },
    });

    if (bookings.length === 0) {
      return res.status(404).send({ message: "No booking found on this date" });
    }

    return res.status(200).send({ success: true, bookings });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};
//cancel booking by booking id
export const deletebooking = async (req, res) => {
   const { bookingId } = req.params;
   console.log("Extracted bookingId:", bookingId);
   try {
     const id = parseInt(bookingId, 10);

     if (isNaN(id)) {
       return res.status(401).send({
         success: false,
         message: "Invalid booking ID",
       });
     }

     // Find the booking by ID
     const booking = await Booking.findOne({ where: { id } });

     if (!booking) {
       return res.status(404).send({
         success: false,
         message: "Booking not found",
       });
     }

     // Delete the booking
     await Booking.destroy({ where: { id } });

     return res.status(200).send({
       success: true,
       message: "Booking successfully deleted",
     });
   } catch (error) {
     console.error("Error deleting booking:", error);
     return res.status(500).send({
       success: false,
       message: "An error occurred while deleting the booking",
       error: error.message,
     });
   }
};
//authroute
export const authroute = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized Access" });
    }
    const decoded = jwt.verify(token, "secretkey");
    const name = decoded.name;
    return res.status(200).send({ success: true, message: `wellcome ${name}` });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "internal server error!",
      error: error.message || error.toString(),
    });
  }
};

// import Stripe from "stripe";
// import Log from "../utils/logger.js";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

// async function createCustomer(user) {
//   try {
//     let customer;
//     if (user.email) {
//       customer = await stripe.customers.create({
//         email: user.email,
//         name: `${user.first_name} ${user.last_name}`,
//       });
//     } else {
//       customer = await stripe.customers.create({
//         phone: user.phone_number,
//         name: `${user.first_name} ${user.last_name}`,
//       });
//     }

//     const message = "STRIPE_CUSTOMER_CREATED_SUCCESSFULLY";
//     Log.info(message);
//     return { data: customer.id, message, error: false };
//   } catch (ex) {
//     Log.error(`Unable to create customer ${JSON.stringify(ex)}`);
//   }
//   return {
//     data: null,
//     message: "UNABLE_TO_CREATE_STRIPE_CUSTOMER",
//     error: true,
//   };
// }

// async function addPaymentMethod(id, customer_id) {
//   try {
//     const paymentMethod = await stripe.paymentMethods.retrieve(id);

//     if (!paymentMethod) {
//       return {
//         data: null,
//         message: "PROVIDE_VALID_PAYMENT_METHOD",
//         error: true,
//       };
//     }

//     if (paymentMethod.customer) {
//       return {
//         data: null,
//         message: "PAYMENT_METHOD_ALREADY_ATTACHED",
//         error: true,
//       };
//     }

//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: customer_id,
//       type: "card",
//     });

//     const isDuplicateCard = paymentMethods.data.some((pm) => {
//       return pm.card.fingerprint === paymentMethod.card.fingerprint;
//     });

//     if (isDuplicateCard) {
//       return {
//         data: null,
//         message: "DUPLICATE_CARDS_NOT_ALLOWED",
//         error: true,
//       };
//     }
//     await stripe.paymentMethods.attach(id, {
//       customer: customer_id,
//     });
//     Log.info("Payment method added successfully.");
//     return {
//       data: id,
//       message: "PAYMENT_METHOD_ADDED_SUCCESSFULLY",
//       error: false,
//     };
//   } catch (ex) {
//     Log.error(`Unable to add payment method ${JSON.stringify(ex)}`);
//     return { data: null, message: ex.raw.message, error: true };
//   }
// }

// async function updateDefaultPaymentMethod(customer_id, paymentMethodId) {
//   try {
//     await stripe.customers.update(customer_id, {
//       invoice_settings: {
//         default_payment_method: paymentMethodId,
//       },
//     });
//     Log.info("Default Payment method updated successfully.");
//     return {
//       data: paymentMethodId,
//       message: "DEFAULT_PAYMENT_METHOD_UPDATED_SUCCESSFULLY",
//       error: false,
//     };
//   } catch (ex) {
//     Log.error(`Unable to update default payment method ${JSON.stringify(ex)}`);
//   }
//   return {
//     data: null,
//     message: "UNABLE_TO_UPDATE_DEFAULT_PAYMENT_METHOD",
//     error: true,
//   };
// }

// async function getPaymentMethods(customer_id) {
//   try {
//     const {
//       data: defaultPaymentMethodId,
//       message,
//       error,
//     } = await getDefaultPaymentMethod(customer_id);

//     if (error) {
//       return { data: null, message, error };
//     }

//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: customer_id,
//       type: "card",
//     });
//     return {
//       data: {
//         paymentMethods: paymentMethods.data,
//         default: defaultPaymentMethodId,
//       },
//       message: "PAYMENT_METHODS_FETCHED_SUCCESSFULLY",
//     };
//   } catch (ex) {
//     Log.error(`Unable to retrieve payment methods ${JSON.stringify(ex)}`);
//   }

//   return { data: null, message: "UNABLE_TO_RETRIEVE_PAYMENT_METHODS" };
// }

// async function getDefaultPaymentMethod(customer_id) {
//   try {
//     const customer = await stripe.customers.retrieve(customer_id);
//     const defaultPaymentMethodId =
//       customer.invoice_settings.default_payment_method;
//     return {
//       data: defaultPaymentMethodId,
//       message: "DEFAULT_PAYMENT_METHOD_FETCHED_SUCCESSFULLY",
//       error: false,
//     };
//   } catch (ex) {
//     Log.error(
//       `Unable to retrieve default payment method ${JSON.stringify(ex)}`
//     );
//   }
//   return {
//     data: null,
//     message: "UNABLE_TO_RETRIEVE_DEFAULT_PAYMENT_METHOD",
//     error: true,
//   };
// }

// async function deletePaymentMethod(id) {
//   try {
//     await stripe.paymentMethods.detach(id);

//     return {
//       data: id,
//       message: "PAYMENT_METHOD_REMOVED_SUCCESSFULLY",
//       error: false,
//     };
//   } catch (ex) {
//     Log.error(`Unable to delete payment method ${JSON.stringify(ex)}`);
//   }
//   return {
//     data: null,
//     message: "UNABLE_TO_DELETE_PAYMENT_METHOD",
//     error: true,
//   };
// }

// async function getPaymentMethodsCount(customer_id) {
//   try {
//     const paymentMethods = await stripe.paymentMethods.list({
//       customer: customer_id,
//       type: "card",
//     });
//     return {
//       data: paymentMethods.length,
//       message: "PAYMENT_METHOD_RETRIEVED_SUCCESSFULLY",
//       error: false,
//     };
//   } catch (ex) {
//     Log.error(`Unable to retrieve payment methods ${JSON.stringify(ex)}`);
//   }
//   return {
//     data: null,
//     message: "UNABLE_TO_RETRIEVE_PAYMENT_METHODS",
//     error: true,
//   };
// }

// async function makePayment(customerId, paymentMethodId, amount, currency) {
//   try {
//     const charge = await stripe.paymentIntents.create({
//       customer: customerId,
//       payment_method: paymentMethodId,
//       amount,
//       currency: currency.toLowerCase(),
//       payment_method_types: ["card"],
//       setup_future_usage: "off_session",
//       confirm: true,
//     });

//     return { data: charge, message: "PURCHASED_SUCCESSFULLY", error: false };
//   } catch (ex) {
//     Log.error(`Unable to make payment ${JSON.stringify(ex)}`);
//     return {
//       data: { payment_method: paymentMethodId, amount },
//       message: "UNABLE_TO_MAKE_PAYMENT",
//       error: true,
//     };
//   }
// }

// async function validatePayment(payment_intent_id) {
//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(
//       payment_intent_id
//     );

//     if (paymentIntent.status == "succeeded") {
//       return {
//         data: paymentIntent,
//         message: "PAYMENT_CONFIRMED_SUCCESSFULLY",
//         error: false,
//       };
//     } else {
//       return {
//         data: paymentIntent,
//         message: "UNABLE_TO_CONFIRM_PAYMENT",
//         error: false,
//       };
//     }
//   } catch (ex) {
//     Log.error(`Unable to confirm payment ${JSON.stringify(ex)}`);
//     return {
//       data: null,
//       message: "UNABLE_TO_CONFIRM_PAYMENT",
//       error: true,
//     };
//   }
// }

// async function getPaymentMethodDetails(payment_method_id) {
//   try {
//     const paymentMethod = await stripe.paymentMethods.retrieve(
//       payment_method_id
//     );

//     return {
//       data: paymentMethod,
//       message: "PAYMENT_METHOD_RETRIEVED_SUCCESSFULLY",
//       error: false,
//     };
//   } catch (ex) {
//     Log.error(`Unable to retrieve payment method ${JSON.stringify(ex)}`);
//     return {
//       data: null,
//       message: "UNABLE_TO_CONFIRM_PAYMENT",
//       error: true,
//     };
//   }
// }

// export default {
//   createCustomer,
//   addPaymentMethod,
//   updateDefaultPaymentMethod,
//   getPaymentMethods,
//   getDefaultPaymentMethod,
//   deletePaymentMethod,
//   getPaymentMethodsCount,
//   makePayment,
//   validatePayment,
//   getPaymentMethodDetails,
// };