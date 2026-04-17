const express = require("express");
const router = express.Router();

const { signup, login, logout, refresh } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

// Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/refresh", refresh);

// Protected route
router.get("/dashboard", authenticateToken, (req, res) => {
    res.json({
        message: "Welcome to dashboard",
        user: req.user
    });
});

module.exports = router;