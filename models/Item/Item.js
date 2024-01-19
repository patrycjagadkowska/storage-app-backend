const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const Item = sequelize.define("Item", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = Item;