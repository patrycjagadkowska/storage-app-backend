const { validationResult } = require("express-validator");

const Contact = require("../models/User/Contact");
const User = require("../models/User/User");

exports.getContacts = async (req, res, next) => {
    const { userId } = req;

    try {
        const existingUser = await User.findByPk(userId);

        if (!existingUser) {
            const error = new Error("Not autheticated!");
            error.status = 401;
            throw error;
        }

        const contacts = await Contact.findAll({ where: { UserId: userId }});

        if (contacts === null){
            res.status(404).json({ message: "No data found."});
        }

        res.status(200).json({ message: "Data fetched successfully.", data: contacts});
    } catch (error) {
        next(error);
    }
};

exports.postAddContact = async (req, res, next) => {
    const { userId } = req;
    const { name, phone, address, email } = req.body;
    
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errorMsg = result.array()[0];

        return res.status(422).json({ message: errorMsg });
    }

    try {
      const existingUser = await User.findByPk(userId);
      if (!existingUser) {
        const error = new Error("Not authenticated!");
        error.status = 401;
        throw error;
      }

      const contact = await Contact.create({ email, name, phone, address, UserId: userId });
      res.status(201).json({ message: "Data was added successfully.", contact });
    } catch (error) {
      next(error);
    }
};