const Sequelize = require("sequelize");

const Sale = require("../models/Sale/Sale");
const Supply = require("../models/Supply/Supply");
const { months } = require("../constants/dates");
const { findExistingUser } = require("../constants/functions");
const Item = require("../models/Item/Item");
const SaleItem = require("../models/Sale/SaleItem");
const Category = require("../models/Item/Category");

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

exports.getLastMonth = async (req, res, next) => {
    const { userId } = req;
    const { year, month } = req.query;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const sales = await Sale.findAll({
          where: {
            UserId: verifiedUserId,
            date: {
              [Sequelize.Op.between]: [
                new Date(year, month, 1),
                new Date(year, month + 1, 0),
              ],
            },
          },
          attributes: ["id"],
          include: [
            {
              model: Item,
              attributes: ["id"],
              include: [
                {
                  model: Category,
                  attributes: ["id", "name"]
                },
              ],
              through: [{
                model: SaleItem,
                attributes: ["id", "quantity", "price"]
              }]
            },
          ],
        });

        const categories = await Category.findAll({ where: {
            UserId: verifiedUserId
        }});

        const data = categories.map((category) => {
            return {
                id: category.id,
                name: category.name,
                value: 0
            }
        });

        sales.forEach((sale) => {
            const items = sale.Items;
            items.forEach((item) => {
                const value = item.SaleItem.price * item.SaleItem.quantity;
                const categoryId = item.Category.id;
                const categoryIndex = data.findIndex((category) => category.id === categoryId);
                const categoryNewData = {...data[categoryIndex]};
                categoryNewData.value += value;
                data.splice(categoryIndex, 1, categoryNewData);
            });
        });

        res.status(200).json({ message: "Data fetched successfully", data });
    } catch (error) {
        next(error);
    }
};

exports.getItemsSummary = async (req, res, next) => {
  const { userId } = req;
  const { year, month } = req.query;

  try {
    const verifiedUserId = await findExistingUser(userId);

    const lowQuantityItems = await Item.findAll({
      where: {
        UserId: verifiedUserId,
        quantity: { [Sequelize.Op.lt]: 15 },
      },
      include: {
        model: Category,
        attributes: ["id", "name"],
      },
      attributes: ["id", "name", "quantity"],
    });

    const lastYearSales = await Sale.findAll({
      where: {
        UserId: verifiedUserId,
        date: {
          [Sequelize.Op.between]: [
            new Date(year - 1, month, 1),
            new Date(year, month + 1, 0),
          ],
        },
      },
      attributes: ["id"],
    });

    const salesIds = lastYearSales.map((sale) => sale.id);

    const saleItems = await SaleItem.findAll({
      where: {
        SaleId: {
          [Sequelize.Op.in]: salesIds,
        },
      },
      attributes: ["quantity", "ItemId", "id"],
    });

    const itemsTotalQuantities = [];

    for (const item of saleItems) {
      let found = false;
      for (let i = 0; i < itemsTotalQuantities.length; i++) {
        if (itemsTotalQuantities[i].id === item.ItemId) {
          itemsTotalQuantities[i].quantity += parseInt(item.quantity);
          found = true;
          break;
        }
      }
      if (!found) {
        itemsTotalQuantities.push({
          id: item.ItemId,
          quantity: parseInt(item.quantity),
        });
      }
    }

    itemsTotalQuantities.sort((a, b) => b.quantity - a.quantity);

    const bestsellers =
      itemsTotalQuantities.length > 5
        ? itemsTotalQuantities.slice(0, 5)
        : itemsTotalQuantities;

    const itemsIds = bestsellers.map((best) => best.id);

    const items = await Item.findAll({where: {
        id: {
            [Sequelize.Op.in]: itemsIds
        },
    }});

    const categoriesIds = items.map((item) => item.CategoryId);

    const categories = await Category.findAll({ where: {
        id: {
            [Sequelize.Op.in]: categoriesIds 
        },
    }, attributes: ["id", "name"]
    });

    const bestsellersWithNames = bestsellers.map((best) => {
        const item = items.find((item) => item.id === best.id);
        const categoryName = categories.find((cat) => cat.id === item.CategoryId).name;
        return {
            ...best, 
            categoryName,
            itemName: item.name
        };
    });

    res
      .status(200)
      .json({
        message: "Data fetched successfully",
        data: { lowQuantityItems, bestsellers: bestsellersWithNames },
      });
  } catch (error) {
    next(error);
  }
};