const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const SaleItem = sequelize.define("SaleItem", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    SaleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = SaleItem;