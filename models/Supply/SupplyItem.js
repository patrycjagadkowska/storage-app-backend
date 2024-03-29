const { DataTypes } = require("sequelize");

const sequelize = require("../../database");

const SupplyItem = sequelize.define("SupplyItem", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    purchasePrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    SupplyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ItemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = SupplyItem;