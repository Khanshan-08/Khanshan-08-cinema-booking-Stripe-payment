import express from "express";
import apiLimiter from "../middleware/ratelimiting.js";
import roleAuthorization from "../middleware/adminauth.js";

import {
  adminsignup,
  adminlogin,
  addmovies,
  addshowtimesbymovieId,
} from "../controllers/admin-controller.js";


const router = express.Router();
router.use(apiLimiter);

///swagger documentation for admin signUp
/**
 * @swagger
 * /movieshub/admin/signup:
 *   post:
 *     summary: Admin signup
 *     description: Allows a user to sign up as an admin by providing name, email, and password with the permission of an admin. The password must meet specific criteria, and a JWT token is returned on successful signup.
 *     tags:
 *       - Admin
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "JohnDoe"
 *                 description: "Admin's name must be between 5 and 30 characters and contain only alphabetic characters."
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: "Valid email address."
 *               password:
 *                 type: string
 *                 example: "Pass@1234"
 *                 description: "Password must be between 8 and 15 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
 *     responses:
 *       201:
 *         description: Successful signup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Welcome JohnDoe, you are now an Admin"
 *                 data:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     name:
 *                       type: string
 *                       example: "JohnDoe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   description: "Validation errors for name, email, or password."
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email already exists,Try another Email."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Error message details..."
 */
router.post("/signup", adminsignup);
//swagger documentation for admin login
/**
 * @swagger
 * /movieshub/admin/login:
 *   post:
 *     summary: Admin login
 *     description: Allows an admin to log in by providing email and password. Returns a JWT token on successful authentication.
 *     tags:
 *       - Admin
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *                 description: "Admin's registered email."
 *               password:
 *                 type: string
 *                 example: "Pass@1234"
 *                 description: "Password must be between 8 and 15 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: object
 *                   description: "Validation errors for email or password."
 *       401:
 *         description: Invalid password or error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid password"
 *                 error:
 *                   type: string
 *                   example: "Error message details..."
 *       403:
 *         description: Access denied (not an admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied Not an admin."
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No Admin found with this email!"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error"
 *                 error:
 *                   type: string
 *                   example: "Error message details..."
 */

router.post("/login", adminlogin);
//swagger documentation for addmovies 
/**
 * @swagger
 * /movieshub/admin/addmovies:
 *   post:
 *     summary: Add a new movie
 *     description: Allows an admin to add a new movie to the database. Requires admin authorization.
 *     security:
 *       - bearerAuth: []  # Ensure this matches your security scheme name
 *     tags:
 *       - Movies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Inception"
 *                 description: "Name of the movie."
 *               genre:
 *                 type: string
 *                 example: "Sci-Fi"
 *                 description: "Genre of the movie."
 *               duration:
 *                 type: string
 *                 example: "2h 28m"
 *                 description: "Duration of the movie."
 *               description:
 *                 type: string
 *                 example: "A thief with the ability to enter people's dreams and steal their secrets."
 *                 description: "A brief description of the movie."
 *               synopsis:
 *                 type: string
 *                 example: "Cobb is offered a chance to have his criminal history erased in exchange for planting an idea into a CEO's subconscious."
 *                 description: "Synopsis of the movie."
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]
 *                 description: "The main cast of the movie."
 *               trailer:
 *                 type: string
 *                 format: url
 *                 example: "https://www.youtube.com/watch?v=8hP9D6kZseM"
 *                 description: "URL of the movie trailer."
 *     responses:
 *       201:
 *         description: Movie added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Movie added successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Inception"
 *                     genre:
 *                       type: string
 *                       example: "Sci-Fi"
 *                     duration:
 *                       type: string
 *                       example: "2h 28m"
 *                     description:
 *                       type: string
 *                       example: "A thief with the ability to enter people's dreams."
 *                     synopsis:
 *                       type: string
 *                       example: "Cobb is offered a chance to have his criminal history erased."
 *                     cast:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]
 *                     trailer:
 *                       type: string
 *                       example: "https://www.youtube.com/watch?v=8hP9D6kZseM"
 *       400:
 *         description: Validation errors or movie already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Movie already available!"
 *                 errors:
 *                   type: object
 *                   description: "Validation error details."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: string
 *                   example: "Error adding movie."
 */
router.post("/addmovies",roleAuthorization(["admin"]), addmovies);
//swagger documentation to add showtimes by specific movie id
/**
 * @swagger
 * /movieshub/admin/addingshowtime/{movie_id}/addshowtimes:
 *   post:
 *     summary: Add showtimes for a specific movie
 *     description: Allows an admin to add showtimes for a specific movie by providing the movie ID, showtime details, and available seats. Requires admin authorization.
 *     security:
 *       - bearerAuth: [] 
 *     tags:
 *       - addshowtime
 *     parameters:
 *       - in: path
 *         name: movie_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the movie to add showtimes for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2024-09-30"
 *                 description: "Showtime date in YYYY-MM-DD format."
 *               time:
 *                 type: string
 *                 example: "18:30"
 *                 description: "Showtime start time in HH:mm format."
 *               cinema:
 *                 type: string
 *                 example: "CinemaX"
 *                 description: "Name of the cinema where the showtime will take place."
 *               availableSeats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A1", "A2", "A3", "A4"]
 *                 description: "Array of available seat IDs for the showtime."
 *     responses:
 *       201:
 *         description: Showtime added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Showtime added successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     movie_id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       example: "2024-09-30"
 *                     time:
 *                       type: string
 *                       example: "18:30"
 *                     cinema:
 *                       type: string
 *                       example: "CinemaX"
 *                     availableSeats:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A1", "A2", "A3", "A4"]
 *       400:
 *         description: Validation errors or showtime already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation errors or showtime already exists!"
 *                 errors:
 *                   type: object
 *                   description: "Validation error details."
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Movie not found!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post("/addingshowtime/:movie_id/addshowtimes",roleAuthorization(["admin"]),
  addshowtimesbymovieId
);

export default router;