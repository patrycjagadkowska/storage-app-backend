const express = require("express");

const salesController = require("../controllers/sales");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/sales", isAuth, salesController.getAllSales);
router.get("/sales/:saleId", isAuth, salesController.getSale);
router.post("/addSale", isAuth, salesController.postAddSale);
router.post("/deleteSale/:saleId", isAuth, salesController.postDeleteSale);
router.post("/sales/:saleId", isAuth, salesController.postEditSale);

module.exports = router;