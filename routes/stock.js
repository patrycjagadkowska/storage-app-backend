const express = require("express");

const isAuth = require("../middleware/isAuth");
const stockController = require("../controllers/stock");

const router = express.Router();

router.post("/addCategory", isAuth, stockController.addCategory);
router.post("/editCategory/:categoryId", isAuth, stockController.editCategory);
router.post("/deleteCategory/:categoryId", isAuth, stockController.deleteCategory);
router.post("/addItem", isAuth, stockController.addItem);
router.post("/editItem/:itemId", isAuth, stockController.editItem);
router.post("/deleteItem/:itemId", isAuth, stockController.deleteItem);
router.get("/categories", isAuth, stockController.getCategories);
router.get("/categories/items", isAuth, stockController.getAllItems);
router.get("/categories/:categoryId", isAuth, stockController.getCategoryItems);
router.get("/categories/:categoryId/:itemId", isAuth, stockController.getItem);
router.post("/addInventory", isAuth, stockController.addInventory);

module.exports = router;