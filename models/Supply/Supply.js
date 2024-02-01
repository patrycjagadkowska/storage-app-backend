const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const Supply = sequelize.define("Supply", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ContactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

module.exports = Supply;