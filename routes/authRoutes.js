const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// 🔹 Existing routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

// 🔥 ADD THIS (VERY IMPORTANT)
router.get("/dashboard", verifyToken, (req, res) => {
    res.json({
        message: "Welcome to dashboard",
        user: req.user
    });
});

module.exports = router;