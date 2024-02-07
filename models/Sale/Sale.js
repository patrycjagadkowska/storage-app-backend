const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const Sale = sequelize.define("Sale", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    ContactId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Sale;