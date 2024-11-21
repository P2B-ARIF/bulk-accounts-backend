const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		text: { type: String, required: true },
		seenBy: [{ type: String }], // List of user IDs who have seen the message
	},
	{ timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
