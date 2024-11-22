const express = require("express");
const {
	registerUser,
	loginUser,
	getCurrentUser,
	forgotPassword,
	userBlock,
	secretVerify,
} = require("./auth.controller");
const authMiddleware = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/secret", secretVerify);

// Protected route
router.get("/", authMiddleware, getCurrentUser);

// admin routes
router.put("/forgot-password", forgotPassword);
router.put("/handle-block", userBlock);

module.exports = router;
