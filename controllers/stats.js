const Sequelize = require("sequelize");

const Sale = require("../models/Sale/Sale");
const Supply = require("../models/Supply/Supply");

const { findExistingUser } = require("../constants/functions");
const Item = require("../models/Item/Item");

exports.getMonthlyIncome = async (req, res, next) => {
    const { userId } = req;
    const { month, year } = req.query;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const totalSales = await Sale.sum("total", {where: {
            UserId: verifiedUserId,
            date: {
                [Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
            }
        }});

        const totalExpenses = await Supply.sum("total", {where:{
            UserId: verifiedUserId,
            date: {
                [Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
            }
        }});

        const allItems = await Item.findAll({ where: {
            UserId: verifiedUserId
        }, attributes: ["salePrice", "quantity"]});

        const warehouseValue = allItems.reduce((total, item) => {
            return total + item.salePrice * item.quantity;
        }, 0);

        const profitMargin = totalSales - totalExpenses;
      
        res.status(200).json({ data: {totalSales, totalExpenses, warehouseValue, profitMargin} });
    } catch (error) {
        next(error);
    }
};