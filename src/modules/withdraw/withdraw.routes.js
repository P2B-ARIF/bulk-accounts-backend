const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const {
	createWithdraw,
	allWithdrawal,
	confirmPayment,
} = require("./withdraw.controller");
const isAdmin = require("../../middlewares/isAdmin");
const router = express.Router();

// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const dotenv = require("dotenv");

// dotenv.config();

// Cloudinary configuration
// cloudinary.config({
// 	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// 	api_key: process.env.CLOUDINARY_API_KEY,
// 	api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const upload = multer();

// router.post(
// 	"/upload-image",
// 	authMiddleware,
// 	upload.single("file"),
// 	uploadImage,
// );

router.post("/", authMiddleware, createWithdraw);

//? admin routes
router.get("/", isAdmin, allWithdrawal);
router.put("/:id", isAdmin, confirmPayment);

// /api/withdraw
module.exports = router;
