const Sale = require("../models/Sale/Sale");
const Item = require("../models/Item/Item");
const { findExistingUser } = require("../constants/functions");

exports.getAllSales = async (req, res, next) => {
    const { userId } = req;

    try {
        const verifiedUserId = await findExistingUser(userId);
        
        const sales = await Sale.findAll({ where: { UserId: verifiedUserId }, include: [Item]});

        res.status(200).json({ message: "Data fetched successfully.", sales });
    } catch (error) {
        next(error);
    }
};