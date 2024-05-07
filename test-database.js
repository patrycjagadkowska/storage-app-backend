const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.TESTDATABASE,
  process.env.TESTUSER,
  process.env.TESTPASSWORD,
  {
    host: process.env.TESTHOST,
    dialect: "postgres",
  }
);

module.exports = sequelize;
