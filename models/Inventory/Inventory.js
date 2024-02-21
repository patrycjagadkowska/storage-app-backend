const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const Inventory = sequelize.define("Inventory", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true, 
        primaryKey: true
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Inventory;