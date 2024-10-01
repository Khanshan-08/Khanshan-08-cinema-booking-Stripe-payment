import express from "express";
import apiLimiter from "../middleware/ratelimiting.js";
import verifytoken from "../middleware/verifytoken.js";
import authenticateToken from "../middleware/authentication.js";
// import bookingtoken from "../middleware/bookingauth.js";
import {
  signup,
  login,
  getmovieslist,
  getmoviebyid,
  authroute,
  getshowtime,
  getavailableseats,
  getshowtimebyid,
  getbookinglist,
  deletebooking,
  bookSeats,
} from "../controllers/user-controller.js";
import db from "../config/config.js"

const router = new express.Router();

router.use(apiLimiter);
//documentation for signup route
/**
 * @swagger
 * /movieshub/user/signup:
 *   post:
 *     summary: Signup for a new user
 *     tags:
 *       - User
 *     description: Creates a new user account with validation rules and returns a JWT token.
 *     security: []  # Correct indentation here
 *     requestBody:
 *       description: User signup information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user with no space
 *                 example: JohnDoe
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *                 example: john.doe@example.com
 *               password:                 
 *                 type: string
 *                 description: Password for the account (must meet complexity requirements)
 *                 example: Password123!
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: SignUp Successfully!, Welcome John Doe
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     role:
 *                       type: string
 *                       example: user
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplY2VAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpZCI6MSwiaWF0IjoxNjM3Mzg1NTYwLCJleHBpcm91c3MiOiJhbGwiLCJzdWIiOiIifQ.SsT1Np3I6mJz2T5R0LgGZ-0lhlRXcv6lQ2Ej5qxJZ8E
 *       400:
 *         description: Bad request due to validation errors or email already in use
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
 *                   example: User already exists with this email
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *                   example:
 *                     name: ["The name field is required."]
 *                     email: ["The email field must be a valid email."]
 *                     password: ["The password field is required."]
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
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Error details or stack trace
 */

router.post("/signup", signup);
//documentation for login route
/**
 * @swagger
 * /movieshub/user/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - User
 *     description: Authenticates a user by email and password, and returns a JWT token.
 *     security: [] 
 *     requestBody:
 *       description: Login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: Password for the account
 *                 example: Password123!
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful!
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImplY2VAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpZCI6MSwiaWF0IjoxNjM3Mzg1NTYwLCJleHAiOiJhbGwiLCJzdWIiOiIifQ.SsT1Np3I6mJz2T5R0LgGZ-0lhlRXcv6lQ2Ej5qxJZ8E
 *       400:
 *         description: Invalid email or password
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
 *                   example: Invalid password
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *                   example:
 *                     email: ["The email field must be a valid email."]
 *                     password: ["The password field is required."]
 *       404:
 *         description: User not found
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
 *                   example: User not found with this Email!
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
 *                   example: Server Error
 *                 errors:
 *                   type: string
 *                   example: Error details or stack trace
 */
router.post("/login", login);
//documentation for getmovies list route
/**
 * @swagger
 * /movieshub/user/all_movies:
 *   get:
 *     summary: Retrieve the list of all movies
 *     tags:
 *       - User/movies
 *     description: Fetches a list of all movies available. Requires a valid JWT token in the Authorization header.
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of movies
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
 *                   example: List of All Movies
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: The Matrix
 *                       genre:
 *                         type: string
 *                         example: Sci-Fi
 *                       release_date:
 *                         type: string
 *                         format: date
 *                         example: 1999-03-31
 *       401:
 *         description: Unauthorized if the token is missing or invalid
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
 *                   example: Unauthorized
 *       404:
 *         description: No movies available
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
 *                   example: Movies not Available!
 *       400:
 *         description: Bad request due to errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Error details or stack trace
 */
router.get("/all_movies", getmovieslist);
router.get("/authroute", verifytoken, authroute);
//documentation for booking showtimes
/**
 * @swagger
 * /movieshub/user/booking:
 *   post:
 *     summary: Book seats for a specific showtime
 *     tags:
 *       - Booking
 *     description: Books seats for a given showtime. Requires a valid JWT token in the Authorization header. The request body should include the `showtimeId` and an array of `seats` to be booked.
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showtimeId:
 *                 type: integer
 *                 description: ID of the showtime for which seats are being booked
 *                 example: 1
 *               seats:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of seat numbers to be booked
 *                 example: [1, 2, 3]
 *     responses:
 *       '201':
 *         description: Booking successful
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
 *                   example: Booking successful
 *                 newBooking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     showtime_id:
 *                       type: integer
 *                       example: 1
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2, 3]
 *       '400':
 *         description: Bad request if no seats are provided or some requested seats are not available
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
 *                   example: No seats provided in the request or Some of the requested seats are not available
 *                 unavailableSeats:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [4, 5]
 *       '404':
 *         description: Showtime not found
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
 *                   example: Showtime not found
 *       '500':
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
 *                   example: An error occurred while booking the seats
 *                 error:
 *                   type: string
 *                   example: Error details or stack trace
 */
router.post("/booking",authenticateToken, bookSeats);
//documentation for getting bookingn list
/**
 * @swagger
 * /movieshub/user/bookinglist:
 *   get:
 *     summary: Get bookings for a specific date
 *     description: Retrieves a list of bookings for a given date. Requires a valid JWT token in the Authorization header.
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - in: query
 *         name: searchDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-09-18"
 *         required: true
 *         description: The date to retrieve bookings for, in YYYY-MM-DD format.
 *     responses:
 *       '200':
 *         description: Successfully retrieved bookings for the specified date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       '400':
 *         description: Bad Request, missing or invalid date
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
 *                   example: Date is required or Invalid date format. Please use YYYY-MM-DD
 *       '404':
 *         description: No bookings found for the specified date
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
 *                   example: No booking found on this date
 *       '500':
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
 *                   example: Internal server error
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           example: 1
 *         booking_date:
 *           type: string
 *           format: date
 *           example: '2024-09-18'
 *         movie_id:
 *           type: integer
 *           example: 1
 *         seats:
 *           type: integer
 *           example: 3
 */
router.get("/bookinglist", authenticateToken, getbookinglist);
//documentation for get movie by id
/**
 * @swagger
 * /movieshub/user/movie/{id}:
 *   get:
 *     summary: Retrieve a movie by its ID
 *     tags:
 *       - User/movies
 *     description: Fetches a specific movie using its ID. Requires a valid JWT token in the Authorization header.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to retrieve
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved the movie
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
 *                   example: "Movie Selected by ID!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "The Matrix"
 *                     genre:
 *                       type: string
 *                       example: "Sci-Fi"
 *                     release_date:
 *                       type: string
 *                       format: date
 *                       example: "1999-03-31"
 *       401:
 *         description: Unauthorized if the token is missing, invalid, or user does not exist
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Movie not found or invalid ID
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
 *                   example: "Not Found!"
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
 *                   example: "Server error"
 *                 error:
 *                   type: string
 *                   example: "Error details or stack trace"
 */
router.get("/movie/:id", getmoviebyid);
//documentation for delete booking by booking Id
/**
 * @swagger
 * /movieshub/user/cancelbooking/{bookingId}:
 *   delete:
 *     summary: Cancel a booking
 *     description: Deletes a booking by its ID. Requires user authentication.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Booking
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the booking to be canceled.
 *     responses:
 *       '200':
 *         description: Booking successfully deleted
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
 *                   example: "Booking successfully deleted"
 *       '400':
 *         description: Invalid booking ID
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
 *                   example: "Invalid booking ID"
 *       '404':
 *         description: Booking not found
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
 *                   example: "Booking not found"
 *       '500':
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
 *                   example: "An error occurred while deleting the booking"
 */
router.delete("/cancelbooking/:bookingId", authenticateToken, deletebooking);
//documentation for getting showtime by movieId
/**
 * @swagger
 * /movie/{id}/showtimes:
 *   get:
 *     summary: Get showtimes for a specific movie
 *     description: Retrieves showtimes for a movie specified by its ID. Requires a valid JWT token in the Authorization header.
 *     tags:
 *       - showtime details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the movie to retrieve showtimes for.
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token for authorization, in the format `Bearer <token>`.
 *     responses:
 *       '200':
 *         description: Successfully retrieved showtimes
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
 *                   example: Showtimes for the movie: Movie Name
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Showtime'
 *       '401':
 *         description: Unauthorized due to invalid or missing token
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
 *                   example: Invalid token
 *       '403':
 *         description: Forbidden, user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       '404':
 *         description: Movie or showtimes not found
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
 *                   example: No showtimes available for this movie!
 *     security:
 *       - bearerAuth: []
 * components:
 *   schemas:
 *     Showtime:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         movie_id:
 *           type: integer
 *           example: 1
 *         time:
 *           type: string
 *           format: date-time
 *           example: '2024-09-18T14:00:00Z'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.get("/movie/:id/showtimes",getshowtime);///not displaying in swagger
//documentation for getting specific showtime by showtime id
/**
 * @swagger
 * /movieshub/user/movie/{id}/showtimes/{showtimeId}:
 *   get:
 *     summary: Retrieve showtime details for a specific movie
 *     tags:
 *       - user/showtime
 *     description: Fetches showtime details for a movie based on its ID and showtime ID. Requires a valid JWT token in the Authorization header.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to retrieve showtime for
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         description: ID of the showtime to retrieve
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved showtime details
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
 *                   example: Showtime details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     movie_id:
 *                       type: integer
 *                       example: 1
 *                     showtime:
 *                       type: string
 *                       example: "2024-09-18T14:00:00Z"
 *       401:
 *         description: Unauthorized if the token is missing, invalid, or the user does not exist
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
 *                   example: Unauthorized user
 *       404:
 *         description: No movie or showtime found for the provided IDs
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
 *                   example: Showtime with ID 1 not found for movie with ID 1
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
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details or stack trace
 */
router.get("/movie/:id/showtimes/:showtimeId", getshowtimebyid);
//documentation for available seats of showtime
/**
 * @swagger
 * /movieshub/user/movie/{id}/showtimes/{showtimeId}/availableseats:
 *   get:
 *     summary: Get Available Seats for a Movie Showtime
 *     description: Retrieves the available seats for a specific movie showtime.
 *     tags:
 *       - availableseats
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: The ID of the movie.
 *       - in: path
 *         name: showtimeId
 *         schema:
 *           type: integer
 *           example: 2
 *         required: true
 *         description: The ID of the showtime.
 *     security:
 *       - bearerAuth: []    # This adds JWT authentication via the security definition
 *     responses:
 *       '200':
 *         description: Successfully retrieved available seats
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
 *                   example: Available Seats of Selected Movie Showtime!
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableSeats:
 *                       type: integer
 *                       example: 50
 *       '400':
 *         description: Bad Request
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
 *                   example: Invalid Token or error message
 *       '401':
 *         description: Unauthorized
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
 *                   example: Invalid Token
 *       '404':
 *         description: Resource Not Found
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
 *                   example: Movie not found! or Showtime not found!
 */
router.get("/movie/:id/showtimes/:showtimeId/availableseats",getavailableseats);

export default router;