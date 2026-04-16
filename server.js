const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "mysecretkey";

// 🔥 NON-SRV CONNECTION (FIXED)
mongoose.connect("mongodb://ayush:ayush123@ac-kcb4mqg-shard-00-00.5egu93l.mongodb.net:27017,ac-kcb4mqg-shard-00-01.5egu93l.mongodb.net:27017,ac-kcb4mqg-shard-00-02.5egu93l.mongodb.net:27017/?ssl=true&replicaSet=atlas-ugjf9f-shard-0&authSource=admin&appName=Cluster0")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));


// 👤 User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("User", UserSchema);


// 🔹 SIGNUP API
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error in signup" });
    }
});


// 🔹 LOGIN API
app.post("/login", async (req, res) => {
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
});


// 🔐 AUTH
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.sendStatus(403);

    const token = authHeader.split(" ")[1];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.sendStatus(401);
        req.user = decoded;
        next();
    });
}


// 🔹 PROTECTED
app.get("/dashboard", authenticateToken, (req, res) => {
    res.json({
        message: "Welcome to dashboard",
        user: req.user
    });
});


app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});