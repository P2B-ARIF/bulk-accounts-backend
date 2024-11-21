const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const router = express.Router();

// router.get("/", authMiddleware, getUserStats);

module.exports = router;
