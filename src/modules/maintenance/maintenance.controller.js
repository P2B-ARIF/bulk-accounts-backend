const Maintenance = require("./maintenance.model");

// Get current maintenance status
exports.currentMaintenance = async (req, res) => {
	try {
		const maintenance = await Maintenance.findOne();
		res.status(200).json(maintenance);
	} catch (err) {
		res.status(500).json({
			message: "Error fetching maintenance status",
			error: err.message,
		});
	}
};

// Update maintenance status
exports.updateMaintenance = async (req, res) => {
	try {
		const { enabled, message } = req.body;
		const maintenance = await Maintenance.findOneAndUpdate(
			{},
			{ enabled, message },
			{ new: true, upsert: true },
		);
		res.status(200).json(maintenance);
	} catch (err) {
		res.status(500).json({
			message: "Error updating maintenance status",
			error: err.message,
		});
	}
};

exports.changePassword = async (req, res) => {
	try {
		const { password } = req.body;
		const result = await Maintenance.findOneAndUpdate(
			{},
			{ password: password },
		);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json({
			message: "Error updating change password",
			error: err.message,
		});
	}
};

exports.updateMailBox = async (req, res) => {
	try {
		const updateFields = {};
		const { mailbox, tempmail, mailboxToggle, embedmail, embedMailToggle } =
			req.body;

		// Check which fields are present in the request body and update accordingly
		if (tempmail !== undefined) updateFields.tempmail = tempmail;
		if (mailboxToggle !== undefined) updateFields.mailboxToggle = mailboxToggle;
		if (embedMailToggle !== undefined)
			updateFields.embedMailToggle = embedMailToggle;
		if (mailbox) updateFields.mailbox = mailbox;
		if (embedmail) updateFields.embedmail = embedmail;

		// If no valid fields are found, return an error
		if (Object.keys(updateFields).length === 0) {
			return res
				.status(400)
				.json({ message: "No valid fields provided for update" });
		}

		// Update the document
		const result = await Maintenance.findOneAndUpdate({}, updateFields, {
			new: true,
			upsert: true,
		});

		res.status(200).json({
			result,
			message: "Mailbox settings updated successfully",
		});
	} catch (err) {
		console.error("Error updating mailbox:", err);
		res.status(500).json({
			message: "Failed to update mailbox",
			error: err.message,
		});
	}
};
