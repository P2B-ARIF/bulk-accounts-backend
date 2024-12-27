const express = require("express");
const router = express.Router();
const {
	fetchMessage,
	updateMessage,
	markAsSeen,
	getMessages,
	deleteMessage,
} = require("./message.controller");

// Define routes
router.get("/:userEmail", fetchMessage); // Fetch the latest message for a user
router.post("/seen/:userEmail", markAsSeen); // Mark message as seen by a user

// admin routes
router.post("/", updateMessage); // Update the admin message
router.get("/", getMessages); // get the admin messages
router.delete("/:id", deleteMessage); // delete the admin message

module.exports = router;
