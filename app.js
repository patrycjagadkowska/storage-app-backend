const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./database");

const authRouter = require("./routes/auth");

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use(authRouter);

sequelize.sync().then(() => {
    app.listen(8080);
}).catch((error) => {
    console.log(error);
});