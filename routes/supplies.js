const express = require("express");

const suppliesController = require("../controllers/supplies");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/supplies", isAuth, suppliesController.getSupplies);
router.get("/supplies/:supplyId", isAuth, suppliesController.getSupply);
router.post("/addSupply", isAuth, suppliesController.postAddSupply);
router.post("/supplies/:supplyId", isAuth, suppliesController.postEditSupply);
router.post("/deleteSupply/:supplyId", isAuth, suppliesController.postDeleteSupply);

module.exports = router;