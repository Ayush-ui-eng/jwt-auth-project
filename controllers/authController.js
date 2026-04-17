const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const blacklist = require("../config/blacklist");

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


// 🔹 LOGIN
exports.login = async (req, res) => {
    console.log("👉 Login request:", req.body);

    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong password" });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
};


// 🔹 LOGOUT (NEW)
exports.logout = (req, res) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return res.sendStatus(400);

    const token = authHeader.split(" ")[1];

    if (!token) return res.sendStatus(400);

    // 🚫 Add token to blacklist
    blacklist.add(token);

    console.log("🚫 Token blacklisted:", token);

    res.json({ message: "Logged out successfully" });
};