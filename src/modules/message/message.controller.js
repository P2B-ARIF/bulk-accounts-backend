const Message = require("./message.model");

exports.fetchMessage = async (req, res) => {
	try {
		const { userEmail } = req.params;
		const message = await Message.findOne({
			seenBy: { $ne: userEmail },
		}).sort({ createdAt: -1 });

		if (!message) {
			return res.json({ showMessage: false });
		}

		res.json({ showMessage: true, message: message.text });
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch message" });
	}
};

exports.updateMessage = async (req, res) => {
	try {
		const { text } = req.body;

		const newMessage = new Message({ text, seenBy: [] });
		await newMessage.save();

		res.json({ success: true, message: "Message updated successfully" });
	} catch (err) {
		res.status(500).json({ error: "Failed to update message" });
	}
};

exports.markAsSeen = async (req, res) => {
	try {
		const { userEmail } = req.params;

		const message = await Message.findOneAndUpdate(
			{ seenBy: { $ne: userEmail } },
			{ $push: { seenBy: userEmail } },
		);

		if (!message) {
			return res.status(404).json({ message: "No unseen message found" });
		}

		res.json({ success: true, message: "Message marked as seen" });
	} catch (err) {
		res.status(500).json({ error: "Failed to mark message as seen" });
	}
};

exports.getMessages = async (req, res) => {
	try {
		const messages = await Message.find({});
		res.status(200).json({ success: true, data: messages });
	} catch (err) {
		res.status(500).json({ success: false, error: "Failed to get messages" });
	}
};

exports.deleteMessage = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res
				.status(400)
				.json({ success: false, error: "Message ID is required" });
		}

		const result = await Message.findByIdAndDelete(id);
		if (!result) {
			return res
				.status(404)
				.json({ success: false, error: "Message not found" });
		}
		res.status(200).json({
			success: true,
			message: "Message deleted successfully",
			data: result,
		});
	} catch (err) {
		res.status(500).json({ success: false, error: "Failed to delete message" });
	}
};
