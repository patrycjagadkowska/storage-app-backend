const { findExistingUser } = require("../constants/functions");
const Category = require("../models/Item/Category");
const Item = require("../models/Item/Item");

exports.addCategory = async (req, res, next) => {
    const { userId } = req;
    const { categoryName } = req.body

    try {
        const verifiedUserId = await findExistingUser(userId);

        const categoriesNames = await Category.findAll({ attributes: ["name"] });
        const existingName = categoriesNames.find((name) => {
            return name === categoryName;
        });

        if (existingName) {
            const error = new Error("Category already exists");
            error.status = 422;
            throw error;
        }

        const category = await Category.create({ name: categoryName, UserId: verifiedUserId });

        res.status(201).json({ message: "Data updated successfully", category });
    } catch (error) {
        next(error);
    }
};

exports.editCategory = async (req, res, next) => {
    const { userId } = req;
    const { categoryId } = req.params;
    const { categoryName } = req.body;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const category = await Category.findByPk(categoryId);

        if (!category) {
            const error = new Error("Data not found");
            error.status = 404;
            throw error;
        }

        if (category.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        category.name = categoryName;
        await category.save();

        res.status(201).json({ message: "Data updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    const { userId } = req;
    const { categoryId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const category = await Category.findByPk(categoryId);

        if (!category) {
            const error = new Error("Data not found");
            error.status = 404;
            throw error;
        }

        if (category.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        const items = await Item.findAll({ where: { CategoryId: categoryId }});

        for (const item of items) {
            await item.destroy();
        }

        await category.destroy();

        res.status(200).json({ message: "Data deleted successfully" });
    } catch (error) {
        next(error);
    }
};

exports.addItem = async (req, res, next) => {
    const { userId } = req;
    const { name, categoryId } = req.body;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const category = await Category.findByPk(categoryId);
        if (!category) {
            const error = new Error("Data not found");
            error.status = 404;
            throw error;
        }

        const categoryItems = await Item.findAll({ where: { CategoryId: categoryId }});

        const existingItem = categoryItems.find((item) => item.name === name);

        if (existingItem) {
            const error = new Error("Item already exists");
            error.status = 422;
            throw error;
        }

        const item = await Item.create({ name, CategoryId: categoryId, UserId: verifiedUserId });

        res.status(201).json({ message: "Data updated successfully", item });
    } catch (error) {
        next(error);
    }
};

exports.editItem = async (req, res, next) => {
    const { userId } = req;
    const { name, categoryId } = req.body;
    const { itemId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const category = await Category.findByPk(categoryId);
        const item = await Item.findByPk(itemId);

        if (!category || !item) {
            const error = new Error("No data found");
            error.status = 404;
            throw error;
        }

    if (category.UserId !== verifiedUserId || item.UserId !== verifiedUserId) {
        const error = new Error("Unauthorized user");
        error.status = 403;
        throw error;
    }        

    item.CategoryId = categoryId;
    item.name = name;

    await item.save();

    res.status(201).json({ message: "Data updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.deleteItem = async (req, res, next) => {
    const { userId } = req;
    const { itemId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const item = await Item.findByPk(itemId);

        if (!item) {
            const error = new Error("No data found");
            error.status = 404;
            throw error;
        }

        if (item.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        await item.destroy();

        res.status(200).json({ message: "Data updated successfully" });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async(req, res, next) => {
    const { userId } = req;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const categories = await Category.findAll({ where: { UserId: verifiedUserId }});

        res.status(200).json({ message: "Data fetched successfully", data: categories });
    } catch (error) {
        next(error);
    }
};

exports.getCategoryItems = async (req, res, next) => {
    const { userId } = req;
    const { categoryId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const category = await Category.findByPk(categoryId);
        if (!category) {
            const error = new Error("Data not found");
            error.status = 404;
            throw error;
        }

        if (category.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        const items = await Item.findAll({ where: { CategoryId: category.id }});

        res.status(200).json({ message: "Data fetched successfully", data: items });
    } catch (error) {
        next(error);
    }
};

exports.getItem = async (req, res, next) => {
    const { userId } = req;
    const { categoryId, itemId } = req.params;

    try {
        const verifiedUserId = await findExistingUser(userId);

        const item = await Item.findByPk(itemId);

        if (item.UserId !== verifiedUserId) {
            const error = new Error("Unauthorized user");
            error.status = 403;
            throw error;
        }

        if (item.CategoryId !== categoryId) {
            const error = new Error("Data not found");
            error.status = 404;
            throw error;
        }

        res.status(200).json({ message: "Data fetched successfully", data: item });
    } catch (error) {
        next(error);
    }
};