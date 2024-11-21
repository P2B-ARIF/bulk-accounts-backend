const express = require("express");
const {
	createPackage,
	listPackage,
	updatePackage,
	deletePackage,
} = require("./package.controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const isAdmin = require("../../middlewares/isAdmin");

const router = express.Router();

// user routes
router.get("/", authMiddleware, listPackage);

//? admin routes
router.post("/", isAdmin, createPackage);
router.put("/:packageId", isAdmin, updatePackage);
router.delete("/:packageId", isAdmin, deletePackage);

module.exports = router;
