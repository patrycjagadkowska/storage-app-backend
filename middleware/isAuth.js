const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
    const authHeader = req.getHeader("Authorization");

    if (!authHeader) {
        const error = new Error("Not authenticated!");
        error.status = 401;
        next(error);
    }

    const token = authHeader.split(" ")[1];

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, "supersecretkey");
    } catch (error) {
        if (!error.status) {
            error.status = 401;
            next(error);
        }
    }

    req.userId = decodedToken.userId;
    next();
};

module.exports = isAuth;