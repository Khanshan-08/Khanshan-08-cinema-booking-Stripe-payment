import express from "express";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.js";
import Movie from "../models/movies.js";
import Showtime from "../models/showtimes.js";

const app = express();
app.use(express.json());

// Admin sign-up
export const adminsignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation rules
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
    const checkemail = await Admin.findOne({ where: { email } });
    if (checkemail) {
      return res.status(409).send({
        success: false,
        message: "Email already exists,Try another Email.",
      });
    }

    // Hash the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin", // Assigning role as 'admin'
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: newAdmin.email, role: newAdmin.role },
      "secretkey",
      { expiresIn: "24h" }
    );

    return res.status(201).send({
      success: true,
      message: `Welcome ${name}, you are now an Admin`,
      data: {
        role: newAdmin.role,
        name: newAdmin.name,
        email: newAdmin.email,
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
// Admin login
export const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation rules
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

    // Validate input
    let validation = new Validator({ email, password }, rules);
    if (validation.fails()) {
      return res
        .status(400)
        .send({ success: false, errors: validation.errors.all() });
    }

    // Find admin by email
    const checkmail = await Admin.findOne({where:{email}});
    if (!checkmail) {
      return res
        .status(404)
        .send({ success: false, message: "No,Admin found with this email!" });
    }

    // Compare password
    const ismatch = await bcrypt.compare(password, checkmail.password);
    if (ismatch) {
      // Check if the role is admin
      if (checkmail.role !== "admin") {
        return res
          .status(403)
          .send({ success: false, message: "Access denied Not an admin." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { email: checkmail.email, role: checkmail.role },
        "secretkey",
        {
          expiresIn: "24h",
        }
      );

      return res.status(200).send({
        success: true,
        message: "Login successful",
        data: {
          email: checkmail.email,
          role: checkmail.role,
          token: token,
        }
      });
    } else {
      return res
        .status(401)
        .send({ success: false, message: "Invalid password" });
    }
  } catch (errors) {
    console.error(errors);

    return res.status(401).send({
      success: false,
      message: "Error",
      error: errors.message || errors.toString(),
    });
  }
};
// Add movies
export const addmovies = async (req, res) => {
  try {
    const { name, genre, duration, description, synopsis, cast, trailer } =
      req.body;

    // Define validation rules
    let rules = {
      name: "required|string",
      genre: "required|string",
      duration: "required|string",
      description: "required|string",
      synopsis: "required|string",
      cast: "required|array|min:1",
      "cast.*": "string",
      trailer: "required|url",
    };

    // Create a new Validator instance
    const validation = new Validator(
      {
        name,
        genre,
        duration,
        description,
        synopsis,
        cast,
        trailer,
      },
      rules
    );

    // Check if validation fails
    if (validation.fails()) {
      return res
        .status(400)
        .send({ success: false, errors: validation.errors.all() });
    }

    // Check if movie already exists
    const moviecheck = await Movie.findOne({ where: { name } });
    if (moviecheck) {
      return res
        .status(400)
        .send({ success: false, message: "Movie already available!" });
    }

    // Create a new movie entry in the database
    const newMovie = await Movie.create({
      name,
      genre,
      duration,
      description,
      synopsis,
      cast: JSON.stringify(cast), // Serialize cast array if needed
      trailer,
    });

    // Send success response
    return res
      .status(201)
      .send({
        success: true,
        message: "Movie added successfully!",
        data: newMovie,
      });
  } catch (error) {
    console.error("Error adding movie:", error);
    return res.status(500).send({ success: false, errors: error.message });
  }
};
//addshowtimes route
export const addshowtimesbymovieId = async (req, res) => {
  try {
    const { movie_id } = req.params;
    const { date, time, cinema, availableSeats, perSeat_Price } = req.body;

    // Validation rules
    let rules = {
      date: "required|string",
      time: "required|string",
      cinema: "required|string",
      availableSeats: "required|array",
      perSeat_Price: "required|string", // Validate perSeat_Price as a string
    };

    // Create validation instance
    const validation = new Validator(
      { date, time, cinema, availableSeats, perSeat_Price },
      rules
    );

    // Check if validation fails
    if (validation.fails()) {
      return res
        .status(400)
        .send({ success: false, errors: validation.errors.all() });
    }

    // Check if the movie exists
    const movie = await Movie.findOne({ where: { id: movie_id } });
    if (!movie) {
      return res
        .status(404)
        .send({ success: false, message: "Movie not found!" });
    }

    // Check if the showtime already exists
    const existingShowtime = await Showtime.findOne({
      where: {
        movie_id,
        date,
        time,
        cinema,
      },
    });

    if (existingShowtime) {
      return res
        .status(400)
        .send({ success: false, message: "Showtime already exists!" });
    }

    const availableSeatsJson = JSON.stringify(availableSeats);

    const formattedPrice = perSeat_Price.trim(); 

    const newShowtime = await Showtime.create({
      movie_id: movie.id,
      date,
      time,
      cinema,
      availableSeats: availableSeatsJson,
      perSeat_Price: formattedPrice, 
    });

    return res.status(201).send({
      success: true,
      message: "Showtime added successfully!",
      data: newShowtime,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message || error.toString(),
    });
  }
};