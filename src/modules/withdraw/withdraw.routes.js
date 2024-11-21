const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
	createWithdraw,
	allWithdrawal,
	confirmPayment,
} = require("./withdraw.controller");
const isAdmin = require("../../middlewares/isAdmin");
const router = express.Router();

router.post("/", authMiddleware, createWithdraw);

//? admin routes
router.get("/", isAdmin, allWithdrawal);
router.put("/:id", isAdmin, confirmPayment);

// /api/withdraw
module.exports = router;
