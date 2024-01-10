const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User/User");

exports.postSignup = async (req, res, next) => {
    const { email, password } = req.body;
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errorMsg = result.array()[0].msg;

        return res.status(422).json({ message: errorMsg });
    }

    try {
        const existingUser = await User.findOne({ where: { email }});
        if (existingUser) {
            const error = new Error("Email already registered!");
            error.code = 422;
            throw error;
        }

        const encryptedPass = await bcrypt.hash(password, 12);
        await User.create({ email, password: encryptedPass });
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        next(error);
    }
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const result = validationResult(req);

    if (!result.isEmpty()) {
        console.log(result.array());
        const errorMsg = result.array()[0].msg;

        return res.status(422).json({ message: errorMsg });
    }

    try {
        const existingUser = await User.findOne({ where: { email }});

        if (!existingUser) {
            const error = new Error("User is not registered yet.");
            error.code = 422;
            throw error;
        }

        const passIsValid = await bcrypt.compare(password, existingUser.password);

        if (!passIsValid) {
            return res.status(422).json({ message: "Wrong password."});
        }

        const userId = existingUser.id;
        const token = jwt.sign({ userId }, "supersecretkey", { expiresIn: "1h" });
        res.status(200).json({ message: "Successfully logged in.", userId, token });
    } catch (error) {
        next(error);
    }
};