import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const Showtime = sequelize.define("Showtime", {
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  time: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  cinema: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  availableSeats: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: "[]",
  },
  perSeat_Price: {
    type: DataTypes.STRING, // Adjust the precision and scale as needed
    allowNull: false,
  },
});

// Associations
Showtime.associate = (models) => {
  Showtime.belongsTo(models.Movie, {
    foreignKey: "movie_id",
    as: "movie",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Showtime.hasMany(models.Seat, {
    foreignKey: "showtime_id",
    as: "seatsList", 
  });

  Showtime.hasMany(models.Booking, {
    foreignKey: "showtime_id",
    as: "bookingsList", 
  });
};

export default Showtime;