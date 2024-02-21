const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./database");

const User = require("./models/User/User");
const Contact = require("./models/User/Contact");
const Category = require("./models/Item/Category");
const Item = require("./models/Item/Item");
const Supply = require("./models/Supply/Supply");
const SupplyItem = require("./models/Supply/SupplyItem");
const Sale = require("./models/Sale/Sale");
const SaleItem = require("./models/Sale/SaleItem");
const Inventory = require("./models/Inventory/Inventory");
const InventoryItem = require("./models/Inventory/InventoryItem");

const authRouter = require("./routes/auth");
const contactsRouter = require("./routes/contacts");
const suppliesRouter = require("./routes/supplies");
const stockRouter = require("./routes/stock");
const salesRouter = require("./routes/sales");

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
app.use(contactsRouter);
app.use(suppliesRouter);
app.use(stockRouter);
app.use(salesRouter);

User.hasMany(Contact);
Contact.belongsTo(User);
User.hasMany(Category);
Category.belongsTo(User);
Category.hasMany(Item);
Item.belongsTo(Category);
User.hasMany(Item);
Item.belongsTo(User);
Supply.belongsToMany(Item, { through: SupplyItem });
Item.belongsToMany(Supply, { through: SupplyItem });
SupplyItem.belongsTo(Supply);
Supply.belongsTo(User);
User.hasMany(Supply);
Supply.hasOne(Contact);
Contact.hasMany(Supply);
Sale.belongsTo(User);
User.hasMany(Sale);
Sale.belongsToMany(Item, { through: SaleItem });
Item.belongsToMany(Sale, { through: SaleItem });
SaleItem.belongsTo(Sale);
Sale.belongsTo(Contact);
Contact.hasMany(Sale);
Inventory.belongsTo(User);
User.hasMany(Inventory);
Inventory.belongsToMany(Item, { through: InventoryItem });
Item.belongsToMany(Inventory, { through: InventoryItem });

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