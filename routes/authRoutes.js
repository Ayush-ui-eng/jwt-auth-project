const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// 🔥 DEBUG (IMPORTANT)
console.log("DEBUG CONTROLLER:", authController);

// Routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

module.exports = router;