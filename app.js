const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./database");

const User = require("./models/User/User");
const Contact = require("./models/User/Contact");

const authRouter = require("./routes/auth");

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use(authRouter);

User.hasMany(Contact);
Contact.belongsTo(User);

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});

sequelize.sync().then(() => {
    app.listen(8080);
}).catch((error) => {
    console.log(error);
});