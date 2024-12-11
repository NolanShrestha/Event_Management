const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("Event_db", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection successful!");
  })
  .catch((error) => {
    console.error("Connection failure!", error);
  });

module.exports = sequelize;
