const express = require("express");
const { body } = require("express-validator");

const isAuth = require("../middleware/isAuth");
const { passwordRegex } = require("../constants/regex");

const authController = require("../controllers/auth");

const router = express.Router();

const signUpValidation = [
    body("email").trim().notEmpty().isEmail(),
    body("password").trim().notEmpty()
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

const userDataValidation = [
    body("email").trim().notEmpty().isEmail(),
    body("userName").trim().notEmpty().isLength({
        min: 1,
        max: 20
    }).withMessage("Name must not be empty. Maximum length is 20. No numbers or special characters are allowed."),
    body("newPass").custom((value, { req }) => {
        if (!value || value.length === 0) {
            return true;
        } else if (!passwordRegex.test(value)) {
            throw new Error("Password must be at least 5 and maximum 20 characters long.");
        } else if (value !== req.body.repeatPass) {
            throw new Error("Passwords must be equal.");
        } else {
            return true;
        }
    })
];

router.post("/signup", signUpValidation, authController.postSignup);
router.post("/login", loginValidation, authController.postLogin);
router.get("/userData", isAuth, authController.getUserData);
router.post("/userData", isAuth, userDataValidation, authController.postUserData);

module.exports = router;