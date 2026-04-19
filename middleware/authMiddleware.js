const jwt = require("jsonwebtoken");
const blacklist = require("../config/blacklist"); // 👈 ADD THIS
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 🚫 CHECK BLACKLIST
    if (blacklist.has(token)) {
        return res.status(403).json({ message: "Token is logged out" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user;
        next();
    });
};