const Sale = require("../models/Sale/Sale");
const Item = require("../models/Item/Item");
const Category = require("../models/Item/Category");
const { findExistingUser, findExistingContact } = require("../constants/functions");
const SaleItem = require("../models/Sale/SaleItem");

exports.getAllSales = async (req, res, next) => {
    const { userId } = req;

    try {
        const verifiedUserId = await findExistingUser(userId);
        
        const sales = await Sale.findAll({ where: { UserId: verifiedUserId }, include: [Item]});

        res.status(200).json({ message: "Data fetched successfully.", data: sales });
    } catch (error) {
        next(error);
    }
};

exports.getSale = async (req, res, next) => {
    const { userId } = req;
    const { saleId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const sale = await Sale.findByPk(saleId);

        if (!sale) {
            const error = new Error("No data found.");
            error.status = 404;
            throw error;
        }

        if (sale.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        res.status(200).json({ message: "Data fetched successfully.", data: sale});
    } catch (error) {
        next(error);
    }
};

exports.postAddSale = async (req, res, next) => {
    const { userId } = req;
    const { date, customerId, items } = req.body;

    try {
        const verifiedUserId = await findExistingUser(userId);
        const verifiedCustomerId = await findExistingContact(customerId);

        const sale = await Sale.create({
          date,
          ContactId: verifiedCustomerId,
          UserId: verifiedUserId,
        });

        let total = 0;

        for (const itemData of items) {
            const { itemName, categoryName, price, quantity } = itemData;

            const itemCategory = await Category.findOne({ where: { name: categoryName }});

            if (!itemCategory) {
                const alreadycreatedItems = await SaleItem.findAll({ where: { SaleId: sale.id }});
                for ( const saleItem of alreadycreatedItems) {
                    const item = await Item.findByPk(saleItem.ItemId);
                    item.quantity -= saleItem.quantity;
                    await item.save();
                    await saleItem.destroy();
                }
                await sale.destroy();
                const error = new Error("Data not found.");
                error.status = 404;
                throw error;
            }

            const item = await Item.findOne({
              where: { name: itemName, CategoryId: itemCategory.id },
            });

            if (!item) {
                const alreadycreatedItems = await SaleItem.findAll({ where: { SaleId: sale.id }});
                for ( const saleItem of alreadycreatedItems) {
                    const item = await Item.findByPk(saleItem.ItemId);
                    item.quantity -= saleItem.quantity;
                    await item.save();
                    await saleItem.destroy();
                }
                await sale.destroy();
                const error = new Error("No data found.");
                error.status = 404;
                throw error;
            }

            item.quantity -= quantity;
            await item.save();

            await SaleItem.create({
              price,
              quantity,
              SaleId: sale.id,
              ItemId: item.id,
            });

            total += price * quantity;
        }

        sale.total = total;
        await sale.save(); 
        
        res.status(201).json({ message: "Data added successfully." });
    } catch (error) {
        next(error);
    }
};

exports.postDeleteSale = async (req, res, next) => {
    const { userId } = req;
    const { saleId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const existingSale = await Sale.findByPk(saleId);

        if (!existingSale) { 
            const error = new Error("Sale not found.");
            error.status = 404;
            throw error;
        }

        if (existingSale.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user.");
            error.status = 403;
            throw error;
        }

        if (existingSale.Items === 0) {
            await existingSale.destroy();
        }

        const saleItems = await SaleItem.findAll({ where: { SaleId: saleId }});

        for (const saleItem of saleItems) {
            const item = await Item.findByPk(saleItem.ItemId);
            item.quantity -= saleItem.quantity;
            await item.save();
            await saleItem.destroy();
        }

        await existingSale.destroy();

        res.status(200).json({ message: "Sale deleted successfully." });
    } catch (error) {
        next(error);
    }
};

exports.postEditSale = async (req, res, next) =>{
    const { userId } = req;
    const { saleId } = req.params;
    const { date, customerId } = req.body;
    
    try {
        const verifiedUserId = await findExistingUser(userId);
        const verifiedCustomerId = await findExistingContact(customerId);

        const existingSale = await Sale.findByPk(saleId, {
            include: Item
        });

        if(!existingSale) {
            const error = new Error("Sale not found");
            error.status = 404;
            throw error;
        }

        if (existingSale.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        existingSale.date = date;
        existingSale.ContactId = verifiedCustomerId;

        await existingSale.save();

        res.status(201).json({ message: "Sale updated successfully.", data: existingSale });
    } catch (error) {
        next(error);
    }
};