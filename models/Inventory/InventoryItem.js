const { DataTypes } = require("sequelize");

const sequelize= require("../../database");

const InventoryItem = sequelize.define("InventoryItem", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true, 
        primaryKey: true,
    },
    InventoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantityBefore: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantityAfter: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = InventoryItem;