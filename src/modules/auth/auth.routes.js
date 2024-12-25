const express = require("express");
const {
	registerUser,
	loginUser,
	getCurrentUser,
	forgotPassword,
	userBlock,
	secretVerify,
	getAllUsers,
	setNickname,
	deleteUser,
} = require("./auth.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/secret", secretVerify);

router.put("/nickname", authMiddleware, setNickname);

// Protected route
router.get("/", authMiddleware, getCurrentUser);

// admin routes
router.put("/forgot-password", forgotPassword);
router.put("/handle-block", userBlock);
router.get("/get-allUsers", isAdmin, getAllUsers);
router.delete("/delete", isAdmin, deleteUser);

module.exports = router;
