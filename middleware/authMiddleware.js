const jwt = require("jsonwebtoken");
const blacklist = require("../config/blacklist");

const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        console.log("❌ No token provided");
        return res.sendStatus(403);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        console.log("❌ Token missing");
        return res.sendStatus(403);
    }

    // 🔥 NEW: Check blacklist
    if (blacklist.has(token)) {
        console.log("🚫 Blacklisted token used");
        return res.status(401).json({ message: "Token expired (logged out)" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log("❌ Invalid token");
            return res.sendStatus(401);
        }

        console.log("✅ Token verified:", decoded);

        req.user = decoded;
        next();
    });
}

module.exports = authenticateToken;