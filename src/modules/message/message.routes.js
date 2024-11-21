const express = require("express");
const router = express.Router();
const {
	fetchMessage,
	updateMessage,
	markAsSeen,
} = require("./message.controller");

// Define routes
router.get("/:userEmail", fetchMessage); // Fetch the latest message for a user
router.post("/seen/:userEmail", markAsSeen); // Mark message as seen by a user

// admin routes
router.post("/", updateMessage); // Update the admin message

module.exports = router;
