import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const Seat = sequelize.define("Seat", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  seatNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  showtime_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Define associations if needed
Seat.associate = (models) => {
  Seat.belongsTo(models.Showtime, {
    foreignKey: "showtime_id",
    as: "showtime",
  });
};

export default Seat;
