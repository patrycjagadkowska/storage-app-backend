const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

const signUpValidation = [
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty()
    .isStrongPassword({
        minLowercase: 1,
        minNumbers: 1
    })
    .isLength({
        min: 5,
        max: 20
    }).withMessage("Password must be at least 5 characters long and maximum 20."),
    body("repeat-pass").trim().notEmpty().custom((value, { req }) => {
        return value === req.body.password;
    })
];

const loginValidation = [
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty().isLength({
        min: 5, 
        max: 20
    }).withMessage("Password must be at least 5 characters long and maximum 20.")
];

router.post("/signup", signUpValidation, authController.postSignup);
router.post("/login", loginValidation, authController.postLogin);

module.exports = router;