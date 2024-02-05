const Supply = require("../models/Supply/Supply");
const Item = require("../models/Item/Item");
const SupplyItem = require("../models/Supply/SupplyItem");
const User = require("../models/User/User");
const Contact = require("../models/User/Contact");
const { findExistingUser, findExistingContact } = require("../constants/functions");

exports.getSupplies = async (req, res, next) => {
    const { userId } = req;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const supplies = await Supply.findAll({
          where: { UserId: verifiedUserId },
          include: [Item],
        });
        res.status(200).json({ message: "Data fetched successfully.", data: supplies });

    } catch (error) {
        next(error);
    }
};

exports.getSupply = async (req, res, next) => {
    const { userId } = req;
    const { supplyId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const supply = await Supply.findByPk(supplyId);

        if (!supply || supply.UserId !== verifiedUserId) {
           return res.status(404).json({message: "No data found"});
        }

        res.status(200).json({ message: "Data fetched successfully", data: supply });
    } catch (error) {
        next(error);
    }
};

exports.postAddSupply = async (req, res, next) => {
    const { userId } = req;
    const { supplierId, date, items } = req.body;

    try {
        const verifiedUserId = await findExistingUser(userId);
        const verifiedSupplierId = await findExistingContact(supplierId);

        const supply = await Supply.create({
          date,
          ContactId: verifiedSupplierId,
          UserId: verifiedUserId,
        });

        for (const itemData of items) {
            const { itemName, purchasePrice, quantity } = itemData;

            const item = await Item.findOne({where: { name: itemName }});
            if (!item) {
                supply.destroy();
                const error = new Error("Item not found");
                error.status = 404;
                throw error;
            }

            item.quantity += parseInt(quantity);
            await item.save();

            await SupplyItem.create({
                quantity,
                purchasePrice,
                ItemId: item.id,
                SupplyId: supply.id,
            });
        }
        
        res.status(201).json({ message: "Data added successfully" });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.postEditSupply = async (req, res, next) => {
    const { userId } = req;
    const { supplierId, date, items } = req.body; 
    const { supplyId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);
        const verifiedSupplierId = await findExistingContact(supplierId);

        const supply = await Supply.findByPk(supplyId);
        if (!supply) {
            const error = new Error("No data found!");
            error.status = 404;
            throw error;
        }

        if (supply.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        supply.ContactId = verifiedSupplierId;
        supply.date = date;

        const previousSupplyItems = await SupplyItem.findAll({ where: { SupplyId: supply.id }});

        for (const supplyItem of previousSupplyItems) {
            const { ItemId } = supplyItem;
            const item = await Item.findByPk(ItemId);
            item.quantity -= supplyItem.quantity;
            await item.save();

            await supplyItem.destroy();
        }

        for (const itemData of items) {
            const { itemId, purchasePrice, quantity } = itemData;
            
            const item = await Item.findByPk(itemId);
            if (!item) {
                const error = new Error("Data not found");
                error.status = 404;
                throw error;
            }

            item.quantity += quantity;
            await item.save();

            SupplyItem.create({
                purchasePrice, 
                quantity,
                ItemId: itemId,
                SupplyId: supplyId,
            });
        }

        await supply.save();

        res.status(201).json({ message: "Data updated successfully", supply});
    } catch (error) {
        next(error);
    }
};

exports.postDeleteSupply = async (req, res, next) => {
    const { userId } = req;
    const { supplyId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const supply = await Supply.findByPk(supplyId);
        if (!supply) {
            const error = new Error("Data not found");
            error.status = 404;
            throw error;
        }

        if(supply.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        const supplyItems = await SupplyItem.findAll({ where: { SupplyId: supplyId }});

        for (const supplyItem of supplyItems) {
            const item = await Item.findByPk(supplyItem.ItemId);
            item.quantity -= supplyItem.quantity;
            await item.save();

            await supplyItem.destroy();
        }

        await supply.destroy();

        res.status(200).json({ message: "Data deleted successfully"});
    } catch (error) {
        next(error);
    }
};