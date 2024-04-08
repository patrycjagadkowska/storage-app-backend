const Sequelize = require("sequelize");

const Sale = require("../models/Sale/Sale");

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

        // console.log(allSales);
        const totalSales = allSales.reduce((total, sale) => {
            const totalOneSale = sale.Items.reduce((totalItems, item) => {
                const totalOneItem = item.SaleItem.price * item.SaleItem.quantity;
                return totalItems + totalOneItem;
            }, 0)
            return total + totalOneSale;
        }, 0);

      
        res.status(200).json({ data: {totalSales} });
    } catch (error) {
        next(error);
    }
};