// 🔥 MUST BE FIRST (loads .env properly)
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 🔥 DEBUG (check if env is loaded)
console.log("👉 SECRET_KEY:", process.env.SECRET_KEY);
console.log("👉 MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

// 🔧 Middleware
app.use(express.json());
app.use(cors());

// 🔗 Routes
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// 🔗 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

// 🧪 Test route (optional but useful)
app.get("/", (req, res) => {
    res.send("API is working 🚀");
});

// 🔥 Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});