// models/movies.js
import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const Movie = sequelize.define("Movie", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  synopsis: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cast: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  trailer: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
});

// Associations
Movie.associate = (models) => {
  Movie.hasMany(models.Showtime, {
    foreignKey: "movie_id",
    as: "showtimes",
  });
};

export default Movie;