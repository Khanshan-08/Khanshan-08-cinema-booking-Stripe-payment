// models/sync.js
import sequelize from "../config/config.js";
import Movie from "./movies.js";
import Showtime from "./showtimes.js";
import User from "./users.js"; // Ensure User model is defined
import Booking from "./booking.js"; // Ensure Booking model is defined
import Seat from "./seats.js"; // Ensure Seat model is defined

// Define associations
Movie.associate({ Showtime });
Showtime.associate({ Movie, Seat, Booking });
Seat.associate && Seat.associate({ Showtime }); // Ensure Seat model is defined
User.associate && User.associate({ Booking }); // Ensure User model is defined
Booking.associate && Booking.associate({ User, Showtime }); // Ensure Booking model is defined

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error syncing models:", error);
  }
})();

// Export the models
export { Movie, Showtime, Booking, User, Seat }; // Ensure all models are exported