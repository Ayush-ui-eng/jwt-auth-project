const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const blacklist = require("../config/blacklist");
const refreshTokens = require("../config/refreshTokens");

const SECRET_KEY = process.env.SECRET_KEY;


// 🔹 SIGNUP
async function signup(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully" });

    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).json({ message: "Signup error" });
    }
}


// 🔹 LOGIN
async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password" });

        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_KEY,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        refreshTokens.add(refreshToken);
        console.log("✅ Refresh token stored");

        res.json({ accessToken, refreshToken });

    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ message: "Login error" });
    }
}


// 🔹 LOGOUT
function logout(req, res) {
    console.log("👉 BODY RECEIVED:", req.body);

    const authHeader = req.headers["authorization"];
    const { refreshToken } = req.body;

    if (!authHeader) {
        console.log("❌ No auth header");
        return res.sendStatus(400);
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
        console.log("❌ No access token");
        return res.sendStatus(400);
    }

    // 🚫 Blacklist access token
    blacklist.add(accessToken);

    // 🔥 Remove refresh token
    if (refreshToken && refreshTokens.has(refreshToken)) {
        refreshTokens.delete(refreshToken);
        console.log("🗑️ Refresh token REMOVED successfully");
    } else {
        console.log("⚠️ Refresh token missing or not found");
    }

    res.json({ message: "Logged out completely" });
}


// 🔹 REFRESH
function refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Refresh token expired" });
        }

        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: "15m" }
        );

        console.log("✅ New access token generated");

        res.json({ accessToken: newAccessToken });
    });
}


// ✅ EXPORT (VERY IMPORTANT — KEEP THIS)
module.exports = {
    signup,
    login,
    logout,
    refresh
};