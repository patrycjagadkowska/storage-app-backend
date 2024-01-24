const User = require("../models/User/User");
const Contact = require("../models/User/Contact");

exports.findExistingUser = async (userId) => {
    const existingUser = await User.findByPk(userId);

    if (!existingUser) {
        const error = new Error("Not authenticated!");
        error.status = 401;
        throw error;
    }

    return userId;
};

exports.findExistingContact = async (contactId) => {
    const existingContact = await Contact.findByPk(contactId);

    if (!existingContact) {
        const error = new Error("Contact not found");
        error.status = 404;
        throw error;
    }

    return contactId;
};