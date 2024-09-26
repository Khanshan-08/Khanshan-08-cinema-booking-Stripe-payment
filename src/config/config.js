import { Sequelize } from "sequelize";

const sequelize = new Sequelize("movie_cinema", "root", "", {
  host: "localhost", 
  dialect: "mysql", 
  logging:false,
  define:{
    freezeTableName:true,
    timestamps:false
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
  })
  .catch((err) => {
    console.log("Errors: " + err);
  });

export default sequelize;