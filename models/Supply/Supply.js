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
});

module.exports = Supply;