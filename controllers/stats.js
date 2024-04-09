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

        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);
        const allSales = await Sale.findAll({ where: { UserId: verifiedUserId, date: {
            [Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }}, include: [{
            model: Item,
            through: {
                attributes: ["id", "price", "quantity"]
            },
            attributes: ["id"]
        }], attributes: ["id", "date", "UserId", "ContactId"]});

        const allSupplies = await Supply.findAll({ where: { UserId: verifiedUserId, date: {
            [Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
        }}, include: [{
            model: Item,
            throught: {
                attributes: ["id", "purchasePrice", "quantity"]
            },
            attributes: ["id"]
        }], attributes: ["id", "date", "ContactId", "UserId"]});

        const allItems = await Item.findAll({ where: {
            UserId: verifiedUserId
        }, attributes: ["salePrice", "quantity"]});

        const totalSales = allSales.reduce((total, sale) => {
            const totalOneSale = sale.Items.reduce((totalItems, item) => {
                const totalOneItem = item.SaleItem.price * item.SaleItem.quantity;
                return totalItems + totalOneItem;
            }, 0);
            return total + totalOneSale;
        }, 0);

        const totalExpenses = allSupplies.reduce((total, supply) => {
            const totalOneSupply = supply.Items.reduce((totalItems, item) => {
                const totalOneItem = item.SupplyItem.purchasePrice * item.SupplyItem.quantity;
                return totalItems + totalOneItem;
            }, 0);
            return total + totalOneSupply;
        }, 0);

        const warehouseValue = allItems.reduce((total, item) => {
            return total + item.salePrice * item.quantity;
        }, 0);

        const profitMargin = totalSales - totalExpenses;
      
        res.status(200).json({ data: {totalSales, totalExpenses, warehouseValue, profitMargin} });
    } catch (error) {
        next(error);
    }
};