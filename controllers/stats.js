const Sequelize = require("sequelize");

const Sale = require("../models/Sale/Sale");
const Supply = require("../models/Supply/Supply");
const { months } = require("../constants/dates");
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

exports.getLastSixMonths = async (req, res, next) => {
    const { userId } = req;
    const { year, month } = req.query;
    console.log(month);

    try {
        const verifiedUserId = await findExistingUser(userId);

        const monthFrom = (+month - 5) < 0 ? (+month + 7) : (+month - 5);
        const yearFrom = (+month - 5) < 0 ? (+year - 1) : +year;

        const allSales = await Sale.findAll({
          where: {
            UserId: verifiedUserId,
            date: {
              [Sequelize.Op.between]: [
                new Date(yearFrom, monthFrom, 1),
                new Date(year, month + 1, 0),
              ],
            },
          }, attributes: ["id", "total", "date"], order: [["date", "ASC"]]
        });

        const allSupplies = await Supply.findAll({
            where: {
                UserId: verifiedUserId,
                date: {
                    [Sequelize.Op.between]: [
                        new Date(yearFrom, monthFrom, 1),
                        new Date(year, month + 1, 0)
                    ]
                }
            }, attributes: ["id", "total", "date"], order: [["date", "ASC"]]
        });

        const data = [];

        for (const sale of allSales) {
            const existingMonthIndex = data.findIndex(
              (month) => month.name === new Date(sale.date).getMonth()
            );
            
            if (existingMonthIndex !== -1) {
                const existingMonth = data[existingMonthIndex];
                existingMonth.Sales += sale.total;
                data.splice(existingMonthIndex, 1, existingMonth);
            } 
            else {
                const monthNum = new Date(sale.date).getMonth();
                const newMonth = {
                    name: monthNum,
                    Sales: sale.total,
                    Expenses: 0
                }
                data.push(newMonth);
            }
        }

        for (const supply of allSupplies) {
            const existingMonthIndex = data.findIndex(
              (month) => month.name === new Date(supply.date).getMonth()
            );

            if (existingMonthIndex !== -1) {
                const existingMonth = data[existingMonthIndex];
                existingMonth.Expenses += supply.total;
                data.splice(existingMonthIndex, 1, existingMonth);
            } else {
                const monthNum = new Date(supply.date).getMonth();
                const newMonth = {
                    name: monthNum,
                    Expenses: supply.total,
                    Sales: 0
                };
                data.push(newMonth);
            }
        }

        mappedData = data.map((month) => {
            return {...month, name: months[month.name]}
        });

        res.status(200).json({ message: "Data fetched successfully", data: mappedData });
    } catch (error) {
        next(error);
    }
};