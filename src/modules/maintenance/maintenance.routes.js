const express = require("express");
const {
	currentMaintenance,
	updateMaintenance,
	changePassword,
	updateMailBox,
} = require("./maintenance.controller");
const isAdmin = require("../../middlewares/isAdmin");
const router = express.Router();

router.get("/", currentMaintenance);
router.put("/", isAdmin, updateMaintenance);
router.put("/change-password", isAdmin, changePassword);
router.put("/mailbox", isAdmin, updateMailBox);

module.exports = router;
