const express = require("express");
const {
	currentMaintenance,
	updateMaintenance,
} = require("./maintenance.controller");
const isAdmin = require("../../middlewares/isAdmin");
const router = express.Router();

router.get("/", currentMaintenance);
router.put("/", isAdmin, updateMaintenance);

module.exports = router;
