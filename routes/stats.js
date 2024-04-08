const express = require("express");

const statsController = require("../controllers/stats");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/monthly-income", isAuth, statsController.getMonthlyIncome);

module.exports = router;