const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const Category = sequelize.define("Category", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = Category;