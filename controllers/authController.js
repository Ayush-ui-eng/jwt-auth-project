const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const blacklist = require("../config/blacklist");
const refreshTokens = require("../config/refreshTokens");

const SECRET_KEY = process.env.SECRET_KEY;


// 🔹 SIGNUP
exports.signup = async (req, res) => {
    console.log("👉 Signup request:", req.body);

    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Signup error" });
    }
};


// 🔹 LOGIN (ACCESS + REFRESH TOKEN)
exports.login = async (req, res) => {
    console.log("👉 Login request:", req.body);

    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password" });

        // 🔹 Access Token (short life)
        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_KEY,
            { expiresIn: "15m" }
        );

        // 🔹 Refresh Token (long life)
        const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        // Store refresh token
        refreshTokens.add(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });

    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
};


// 🔹 LOGOUT
exports.logout = (req, res) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return res.sendStatus(400);

    const token = authHeader.split(" ")[1];

    if (!token) return res.sendStatus(400);

    // 🚫 Blacklist access token
    blacklist.add(token);

    console.log("🚫 Access token blacklisted:", token);

    res.json({ message: "Logged out successfully" });
};


// 🔹 REFRESH TOKEN (NEW ACCESS TOKEN)
exports.refresh = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
    }

    // Check if refresh token exists
    if (!refreshTokens.has(refreshToken)) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Refresh token expired" });
        }

        // 🔹 Generate new access token
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });
    });
};