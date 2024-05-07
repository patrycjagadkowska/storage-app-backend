const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User/User");

exports.postSignup = async (req, res, next) => {
    const { email, password } = req.body;
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errorMsg = result.array()[0];

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
        const user = await User.create({ email, password: encryptedPass });
        res.status(201).json({ message: "User registered successfully.", userId: user.id });
        return res;
    } catch (error) {
        next(error);
        return error;
    }
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    const result = validationResult(req);

    if (!result.isEmpty()) {
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
        const token = jwt.sign({ userId }, "supersecretkey", { expiresIn: "12h" });
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 12);
        res
          .status(200)
          .json({
            message: "Successfully logged in.",
            userId,
            token,
            expiresIn: expirationTime,
          });
          return res;
    } catch (error) {
        next(error);
        return error;
    }
};

exports.getUserData = async (req, res, next) => {
    const userId = req.userId;

    try {
        const existingUser = await User.findByPk(userId);

        if (!existingUser) {
            const error = new Error("Not authenticated!");
            error.status = 401;
            throw error;
        }

        const { email, userName } = existingUser;
        res.status(200).json({ message: "User found", data: { email, userName }});
        return res;
    } catch (error) {
        next(error);
        return error;
    }
};

exports.postUserData = async (req, res, next) => {
    const { userId } = req;
    const { email, userName, oldPass, newPass } = req.body;

    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errorMsg = result.array()[0];

        return res.status(422).json({ message: errorMsg });
    }

    try {
        const existingUser = await User.findByPk(userId);
        if (!existingUser) {
            const error = new Error("Not authenticated.");
            error.status = 401;
            throw error;
        }

        const passIsValid = await bcrypt.compare(oldPass, existingUser.password);
        if (!passIsValid) {
            const error = new Error("Wrong password.");
            error.status = 422;
            throw error;
        }

        existingUser.email = email;
        existingUser.userName = userName;
        if (newPass && newPass.length !== 0) {
            const hashedPassword = await bcrypt.hash(newPass, 12);
            existingUser.password = hashedPassword;
        }

        await existingUser.save();

        res.status(201).json({ message: "Data updated successfully." });
    } catch (error) {
        next(error);
    }
};