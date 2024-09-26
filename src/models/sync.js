import sequelize from "../config/config.js";
import Movie from "./movies.js";
import Showtime from "./showtimes.js";
import User from "./users.js";
import Booking from "./booking.js";
import Seat from "./seats.js";

// Define associations
Movie.associate({ Showtime });
Showtime.associate({ Movie, Seat, Booking });
Seat.associate({ Showtime });
User.associate && User.associate({ Booking }); // Use conditional chaining to avoid errors if associate is not defined
Booking.associate && Booking.associate({ User, Showtime }); // Same here

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Error syncing models:", error);
  }
})();
