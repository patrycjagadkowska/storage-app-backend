const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../middleware/isAuth");

const contactsController = require("../controllers/contacts");

const router = express.Router();

const contactValidation = [
  body("name")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 30 })
    .withMessage("Please enter a valid name - maximum 30 characters."),
  body("email").optional().trim().isEmail(),
  body("phone").optional().trim().isMobilePhone(),
  body("address")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 5, max: 100 })
    .withMessage(
      "Please enter a valid address - min 5 and max 100 characters."
    ),
];

router.get("/contacts", isAuth, contactsController.getContacts);
router.post("/addContact", isAuth, contactValidation, contactsController.postAddContact);

module.exports = router;