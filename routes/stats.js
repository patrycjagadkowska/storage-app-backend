const express = require("express");

const statsController = require("../controllers/stats");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/monthly-income", isAuth, statsController.getMonthlyIncome);
router.get("/last-six-months", isAuth, statsController.getLastSixMonths);
router.get("/last-month", isAuth, statsController.getLastMonth);

module.exports = router;